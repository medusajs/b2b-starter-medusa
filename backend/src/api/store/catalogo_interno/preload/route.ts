/**
 * Internal Catalog API - Preload Endpoint
 * POST /store/internal-catalog/preload
 * 
 * Preloads all categories into cache for maximum performance
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { getInternalCatalogService } from "../catalog-service";

const CATEGORIES = [
    'accessories',
    'batteries',
    'cables',
    'controllers',
    'ev_chargers',
    'inverters',
    'kits',
    'others',
    'panels',
    'posts',
    'stringboxes',
    'structures'
];

export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const catalogService = getInternalCatalogService();
    const startTime = Date.now();

    try {
        const { categories = CATEGORIES } = req.body as { categories?: string[] };

        // Validate categories
        const validCategories = categories.filter(cat => CATEGORIES.includes(cat));

        if (validCategories.length === 0) {
            return res.status(400).json({
                error: 'No valid categories provided',
                available_categories: CATEGORIES
            });
        }

        // Preload all categories
        await catalogService.preloadAll(validCategories);

        const loadTime = Date.now() - startTime;
        const cacheStats = catalogService.getCacheStats();

        // Get stats for preloaded categories
        const categoryStats = await Promise.all(
            validCategories.map(cat => catalogService.getCategoryStats(cat))
        );

        const totalProducts = categoryStats.reduce((sum, s) => sum + s.total_products, 0);
        const totalWithImages = categoryStats.reduce((sum, s) => sum + s.with_images, 0);

        res.status(200).json({
            success: true,
            message: `Preloaded ${validCategories.length} categories`,
            categories: validCategories,
            total_products: totalProducts,
            total_with_images: totalWithImages,
            load_time_ms: loadTime,
            cache: {
                entries: cacheStats.entries,
                size_bytes: cacheStats.size,
                hit_rate: (cacheStats.hit_rate * 100).toFixed(2) + '%'
            },
            performance: {
                products_per_second: Math.floor(totalProducts / (loadTime / 1000)),
                avg_time_per_category_ms: Math.floor(loadTime / validCategories.length)
            }
        });
    } catch (error: any) {
        console.error('Error preloading catalog:', error);
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to preload catalog");
    }
};
