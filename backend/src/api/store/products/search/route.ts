import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ALGOLIA_MODULE } from "../../../../modules/algolia"
import { z } from "zod"
import { 
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

const searchSchema = z.object({
  q: z.string().min(1, "Query is required"),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  filters: z.string().optional(),
  facets: z.array(z.string()).optional(),
})

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const validated = searchSchema.parse({
      q: req.query.q,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      filters: req.query.filters as string | undefined,
      facets: req.query.facets ? (req.query.facets as string).split(',') : undefined,
    })

    const algoliaService = req.scope.resolve(ALGOLIA_MODULE)
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info(`Searching for products with query: ${validated.q}`)

    const searchOptions: any = {
      hitsPerPage: validated.limit,
      page: Math.floor(validated.offset / validated.limit),
    }

    if (validated.filters) {
      searchOptions.filters = validated.filters
    }

    if (validated.facets) {
      searchOptions.facets = validated.facets
    }

    const results = await algoliaService.search(
      process.env.ALGOLIA_PRODUCT_INDEX_NAME,
      validated.q,
      searchOptions
    )

    res.json({
      products: results.hits,
      count: results.nbHits,
      offset: validated.offset,
      limit: validated.limit,
      facets: results.facets,
      processingTimeMS: results.processingTimeMS,
    })
  } catch (error) {
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
    logger.error("Search error:", error)

    if (error instanceof z.ZodError) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid search parameters: ${error.errors.map(e => e.message).join(', ')}`
      )
    }

    throw error
  }
}