import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { ALGOLIA_MODULE } from "../../../../modules/algolia"

const searchProductsSchema = z.object({
  q: z.string().min(1),
})

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const validatedBody = searchProductsSchema.parse(req.body)

  const algoliaModuleService = req.scope.resolve(ALGOLIA_MODULE)

  const results = await algoliaModuleService.search(
    validatedBody.q,
    "product"
  )

  res.json({
    hits: results.results[0].hits,
  })
}