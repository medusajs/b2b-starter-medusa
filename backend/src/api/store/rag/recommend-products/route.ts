/**
 * API Route: /rag/recommend-products
 * Recomendação inteligente de produtos usando RAG
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
        const {
            kwp_target,
            tipo_sistema = 'on-grid',
            fase = 'mono',
            budget_max,
            preferencias = [],
            top_k = 5
        } = req.body

        if (!kwp_target) {
            return res.status(400).json({
                error: "Missing required field: kwp_target"
            })
        }

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
    }
}
