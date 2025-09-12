import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { algoliasearch } from "algoliasearch"

const searchProductsSchema = z.object({
  q: z.string().min(1),
})

export const OPTIONS = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.status(200).end()
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  try {
    const validatedBody = searchProductsSchema.parse(req.body)

    // Use Algolia client directly for now
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID!,
      process.env.ALGOLIA_API_KEY!
    )

    const results = await client.search({
      requests: [
        {
          indexName: process.env.ALGOLIA_PRODUCT_INDEX_NAME!,
          query: validatedBody.q,
        },
      ],
    })

    res.json({
      hits: results.results[0].hits,
      nbHits: results.results[0].nbHits,
    })
  } catch (error) {
    res.status(500).json({
      error: "Search failed",
      message: error.message,
    })
  }
}