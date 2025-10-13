/**
 * API Route: /rag/search
 * Semantic search nas Knowledge Bases do Hélio via Qdrant
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QdrantClient } from "@qdrant/js-client-rest"
import { APIResponse } from "../../../../utils/api-response"

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333"
const QDRANT_API_KEY = process.env.QDRANT_API_KEY

const client = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
})

type SearchRequest = {
    collection: string
    query: string
    top_k?: number
    filters?: Record<string, any>
}

export async function POST(
    req: MedusaRequest<SearchRequest>,
    res: MedusaResponse
) {
    try {
        const { collection, query, top_k = 5, filters } = req.body

        if (!collection || !query) {
            return APIResponse.validationError(res, "Missing required fields: collection, query");
        }

        // Gerar embedding da query usando OpenAI
        const openai_key = process.env.OPENAI_API_KEY
        if (!openai_key) {
            throw new Error("OPENAI_API_KEY not configured")
        }

        const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openai_key}`
            },
            body: JSON.stringify({
                model: "text-embedding-3-large",
                input: query
            })
        })

        if (!embeddingRes.ok) {
            throw new Error(`OpenAI API error: ${embeddingRes.statusText}`)
        }

        const embeddingData = await embeddingRes.json()
        const query_vector = embeddingData.data[0].embedding

        // Buscar no Qdrant
        const searchResult = await client.search(collection, {
            vector: query_vector,
            limit: top_k,
            with_payload: true,
            filter: filters
        })

        return APIResponse.success(res, {
            query,
            collection,
            matches: searchResult.map(result => ({
                id: result.id,
                score: result.score,
                payload: result.payload
            }))
        });

    } catch (error: any) {
        console.error("[RAG Search Error]", error)
        return res.status(500).json({ error: error.message })
    }
}

/**
 * GET method para listar collections disponíveis
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const collections = await client.getCollections()

        return res.json({
            collections: collections.collections.map(c => ({
                name: c.name,
                vectors_count: (c as any).vectors_count,
                points_count: (c as any).points_count
            }))
        })

    } catch (error: any) {
        console.error("[RAG Collections Error]", error)
        return res.status(500).json({ error: error.message })
    }
}
