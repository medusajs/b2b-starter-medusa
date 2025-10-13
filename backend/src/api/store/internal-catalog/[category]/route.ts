/**
 * Internal Catalog API - Category Products
 * GET /store/internal-catalog/:category
 *
 * Returns ~100 products per category with optimized image loading
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { getInternalCatalogService } from "../catalog-service";
import { CatalogResponse } from "../types";
import { z } from "zod";

/**
 * Validation schema for category products
 */
const CategoryQuerySchema = z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(200).default(100),
    manufacturer: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    hasImage: z.enum(["true", "false"]).optional(),
});

export const GET = async (
  req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const startTime = Date.now();
    const catalogService = getInternalCatalogService();
    const { category } = req.params;

    try {
        // Validate query parameters
        const validatedQuery = CategoryQuerySchema.parse(req.query);
        const { page, limit, manufacturer, minPrice, maxPrice, hasImage } = validatedQuery;

        const filters = {
            manufacturer: manufacturer as string | undefined,
            minPrice: minPrice as number | undefined,
            maxPrice: maxPrice as number | undefined,
            hasImage: hasImage === 'true'
        };

        // Load products
        const queryStart = Date.now();
        const { products, total } = await catalogService.getCategoryProducts(
            category,
            page,
            limit,
            filters
        );
        const queryTime = Date.now() - queryStart;

        // Calculate image load time (simulated for preloaded images)
        const imageLoadTime = products.filter(p => p.image.preloaded).length * 0.5;

        // Get category stats
        const stats = await catalogService.getCategoryStats(category);

        // Get cache stats
        const cacheStats = catalogService.getCacheStats();
        const cacheHit = cacheStats.total_hits > 0;

        const response: CatalogResponse = {
            products,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                has_next: page * limit < total,
                has_prev: page > 1
            },
            stats,
            cache: {
                hit: cacheHit,
                age_seconds: cacheHit ? Math.floor(cacheStats.total_hits / 10) : undefined,
                preloaded: products.every(p => p.image.preloaded)
            },
            performance: {
                query_time_ms: queryTime,
                image_load_time_ms: imageLoadTime,
                total_time_ms: Date.now() - startTime
            }
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error(`Error loading category ${category}:`, error);

        // Handle validation errors
        if (error.name === "ZodError") {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: error.errors,
                message: "Please check your query parameters and try again",
                category
            });
        }

        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message);
    }
};
