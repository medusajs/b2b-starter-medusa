/**
 * API Route: /rag/ask-helio
 * Conversational AI usando RAG + OpenAI GPT-4
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QdrantClient } from "@qdrant/js-client-rest"

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333"
const QDRANT_API_KEY = process.env.QDRANT_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const qdrant = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
})

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
        const { question, context = {}, collections = ["ysh-catalog", "ysh-regulations", "ysh-tariffs"] } = req.body

        if (!question) {
            return res.status(400).json({
                error: "Missing required field: question"
            })
        }

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
            })
        })

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
            })
        })

        const completionData = await completionRes.json()
        const answer = completionData.choices[0].message.content

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
        console.error("[Ask Hélio Error]", error)
        return res.status(500).json({
            error: error.message || "Internal server error"
        })
    }
}
