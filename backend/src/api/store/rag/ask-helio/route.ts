/**
 * API Route: /rag/ask-helio
 * Conversational AI usando RAG + OpenAI GPT-4
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { QdrantClient } from "@qdrant/js-client-rest"

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333"
const QDRANT_API_KEY = process.env.QDRANT_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_REQUESTS = 10 // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

function checkRateLimit(clientIP: string): boolean {
    const now = Date.now()
    const clientData = rateLimitStore.get(clientIP)

    if (!clientData || now > clientData.resetTime) {
        // Reset or initialize rate limit
        rateLimitStore.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
        return true
    }

    if (clientData.count >= RATE_LIMIT_REQUESTS) {
        return false
    }

    clientData.count++
    return true
}

type AskHelioRequest = {
    question: string
    context?: {
        customer_id?: string
        cep?: string
        consumo_kwh_mes?: number
    }
    collections?: string[]
}

export async function POST(
    req: MedusaRequest<AskHelioRequest>,
    res: MedusaResponse
) {
    try {
        // API Key validation
        if (!OPENAI_API_KEY) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "OpenAI API key not configured"
            )
        }

        if (!QDRANT_API_KEY) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Qdrant API key not configured"
            )
        }

        // Rate limiting
        const clientIP = req.headers['x-forwarded-for'] as string ||
            req.headers['x-real-ip'] as string ||
            req.connection.remoteAddress ||
            'unknown'

        if (!checkRateLimit(clientIP)) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Rate limit exceeded. Please try again later."
            )
        }

        // Request validation
        const { question, context = {}, collections = ["ysh-catalog", "ysh-regulations", "ysh-tariffs"] } = req.body

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Question is required and must be a non-empty string"
            )
        }

        if (question.length > 1000) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Question must be less than 1000 characters"
            )
        }

        // Validate collections
        const allowedCollections = ["ysh-catalog", "ysh-regulations", "ysh-tariffs", "ysh-technical"]
        const invalidCollections = collections.filter(col => !allowedCollections.includes(col))
        if (invalidCollections.length > 0) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Invalid collections: ${invalidCollections.join(', ')}`
            )
        }

        const qdrant = new QdrantClient({
            url: QDRANT_URL,
            apiKey: QDRANT_API_KEY,
        })

        // Create timeout controller (30 seconds)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        try {
            // 1. Gerar embedding da pergunta
            const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "text-embedding-3-large",
                    input: question
                }),
                signal: controller.signal
            })

            if (!embeddingRes.ok) {
                throw new MedusaError(
                    MedusaError.Types.INTERNAL_ERROR,
                    `OpenAI embedding API error: ${embeddingRes.status}`
                )
            }

            const embeddingData = await embeddingRes.json()
            const query_vector = embeddingData.data[0].embedding

            // 2. Buscar contexto relevante em múltiplas collections
            const searches = await Promise.all(
                collections.map(collection =>
                    qdrant.search(collection, {
                        vector: query_vector,
                        limit: 3,
                        with_payload: true
                    }).catch(err => {
                        console.warn(`Collection ${collection} search failed:`, err.message)
                        return []
                    })
                )
            )

            // Consolidar resultados
            const relevant_docs = searches.flat().sort((a, b) => b.score - a.score).slice(0, 5)

            // 3. Preparar contexto para GPT-4
            const context_text = relevant_docs.map((doc, i) => {
                const payload = doc.payload as any
                return `[Documento ${i + 1}] ${payload.title || payload.product_id || doc.id}\n${JSON.stringify(payload, null, 2)}`
            }).join("\n\n---\n\n")

            // 4. Chamar GPT-4 com RAG
            const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `Você é o Hélio, copiloto solar da YSH (Yello Solar Hub). 

Missão: auxiliar clientes B2B do setor de energia solar fotovoltaica no Brasil com:
- Dimensionamento de sistemas FV
- Regulamentações ANEEL (PRODIST, Lei 14.300/2022, MMGD)
- Seleção de produtos (painéis, inversores, baterias)
- Cálculo de ROI e financiamento
- Tarifas e classes de consumo

Tom: técnico, cordial, direto. Sempre cite fontes quando usar dados regulatórios.
Tratamento: "Comandante A" quando apropriado.
Locale: pt-BR, BRL, classes consumidoras brasileiras (B1/B2/B3, A4/A3).

Contexto disponível:
${context_text}

${context.cep ? `\nCEP do cliente: ${context.cep}` : ''}
${context.consumo_kwh_mes ? `\nConsumo mensal: ${context.consumo_kwh_mes} kWh/mês` : ''}
`
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                }),
                signal: controller.signal
            })

            if (!completionRes.ok) {
                throw new MedusaError(
                    MedusaError.Types.INTERNAL_ERROR,
                    `OpenAI completion API error: ${completionRes.status}`
                )
            }

            const completionData = await completionRes.json()
            const answer = completionData.choices[0].message.content

            clearTimeout(timeoutId)

            return res.json({
                question,
                answer,
                context_used: relevant_docs.map(d => ({
                    id: d.id,
                    score: d.score,
                    source: (d.payload as any).source || (d.payload as any).title || "N/A"
                })),
                helio_signature: "🌞 Hélio Copiloto Solar · YSH"
            })

        } catch (error: any) {
            clearTimeout(timeoutId)

            if (error.name === 'AbortError') {
                throw new MedusaError(
                    MedusaError.Types.INTERNAL_ERROR,
                    "Request timeout - please try again"
                )
            }

            throw error
        }

    } catch (error: any) {
        console.error("[Ask Hélio Error]", error)
        return res.status(500).json({ error: error.message })
    }
}
