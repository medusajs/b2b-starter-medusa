/**
 * API Route: /rag/recommend-products
 * Recomendação inteligente de produtos usando RAG
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

type RecommendProductsRequest = {
    kwp_target: number
    tipo_sistema?: 'on-grid' | 'off-grid' | 'hibrido'
    fase?: 'mono' | 'bi' | 'tri'
    budget_max?: number
    preferencias?: string[]
    top_k?: number
}

export async function POST(
    req: MedusaRequest<RecommendProductsRequest>,
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
        const {
            kwp_target,
            tipo_sistema = 'on-grid',
            fase = 'mono',
            budget_max,
            preferencias = [],
            top_k = 5
        } = req.body

        if (!kwp_target || typeof kwp_target !== 'number' || kwp_target <= 0 || kwp_target > 1000) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "kwp_target is required and must be a number between 0.1 and 1000"
            )
        }

        if (top_k < 1 || top_k > 20) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "top_k must be between 1 and 20"
            )
        }

        const allowedTipos = ['on-grid', 'off-grid', 'hibrido']
        if (!allowedTipos.includes(tipo_sistema)) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `tipo_sistema must be one of: ${allowedTipos.join(', ')}`
            )
        }

        const allowedFases = ['mono', 'bi', 'tri']
        if (!allowedFases.includes(fase)) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `fase must be one of: ${allowedFases.join(', ')}`
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

            // Construir query semântica
            const query_parts = [
                `sistema fotovoltaico ${kwp_target} kWp`,
                tipo_sistema,
                `${fase}fásico`,
                ...preferencias
            ]

            if (budget_max) {
                query_parts.push(`até R$ ${budget_max}`)
            }

            const query = query_parts.join(" ")

            // Gerar embedding
            const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "text-embedding-3-large",
                    input: query
                })
            })

            const embeddingData = await embeddingRes.json()
            const query_vector = embeddingData.data[0].embedding

            // Buscar painéis e inversores
            const [paineis, inversores] = await Promise.all([
                qdrant.search("ysh-catalog", {
                    vector: query_vector,
                    limit: top_k,
                    with_payload: true,
                    filter: {
                        must: [
                            { key: "type", match: { value: "panel" } }
                        ]
                    }
                }).catch(() => []),

                qdrant.search("ysh-catalog", {
                    vector: query_vector,
                    limit: top_k,
                    with_payload: true,
                    filter: {
                        must: [
                            { key: "type", match: { value: "inverter" } }
                        ]
                    }
                }).catch(() => [])
            ])

            // Formatar recomendações
            const recommendations = {
                paineis: paineis.map(p => ({
                    product_id: p.id,
                    score: p.score,
                    title: (p.payload as any).title,
                    handle: (p.payload as any).handle,
                    metadata: (p.payload as any).metadata,
                    match_reason: p.score > 0.85 ? "Alta compatibilidade" :
                        p.score > 0.75 ? "Boa compatibilidade" :
                            "Compatibilidade moderada"
                })),
                inversores: inversores.map(i => ({
                    product_id: i.id,
                    score: i.score,
                    title: (i.payload as any).title,
                    handle: (i.payload as any).handle,
                    metadata: (i.payload as any).metadata,
                    match_reason: i.score > 0.85 ? "Alta compatibilidade" :
                        i.score > 0.75 ? "Boa compatibilidade" :
                            "Compatibilidade moderada"
                }))
            }

            // Calcular kit sugerido
            const painel_top = paineis[0]
            const inversor_top = inversores[0]

            let kit_suggestion = null
            if (painel_top && inversor_top) {
                const painel_wp = (painel_top.payload as any).metadata?.potencia_wp || 550
                const num_paineis = Math.ceil((kwp_target * 1000) / painel_wp)

                kit_suggestion = {
                    painel: {
                        product_id: painel_top.id,
                        title: (painel_top.payload as any).title,
                        quantidade: num_paineis,
                        potencia_total_kwp: (num_paineis * painel_wp) / 1000
                    },
                    inversor: {
                        product_id: inversor_top.id,
                        title: (inversor_top.payload as any).title,
                        quantidade: 1
                    },
                    potencia_sistema_kwp: (num_paineis * painel_wp) / 1000,
                    oversizing_ratio: ((num_paineis * painel_wp) / 1000) / kwp_target
                }
            }

            return res.json({
                query: {
                    kwp_target,
                    tipo_sistema,
                    fase,
                    budget_max
                },
                recommendations,
                kit_suggestion,
                helio_note: kit_suggestion
                    ? `Hélio sugere ${kit_suggestion.painel.quantidade}x ${kit_suggestion.painel.title} + ${kit_suggestion.inversor.title} para ${kit_suggestion.potencia_sistema_kwp.toFixed(2)} kWp (oversizing ${(kit_suggestion.oversizing_ratio * 100).toFixed(0)}%)`
                    : "Não foi possível montar kit com os critérios fornecidos"
            })

        } catch (error: any) {
            console.error("[Recommend Products Error]", error)
            return res.status(500).json({ error: error.message })
        } finally {
            clearTimeout(timeoutId)
        }
    } catch (error: any) {
        if (error instanceof MedusaError) {
            const statusCode = error.type === MedusaError.Types.INVALID_DATA ? 400 : 500
            return res.status(statusCode).json({
                error: error.type,
                message: error.message,
            })
        }

        console.error("[Recommend Products Error]", error)
        return res.status(500).json({
            error: "INTERNAL_ERROR",
            message: error?.message ?? "Unexpected error",
        })
    }
}
