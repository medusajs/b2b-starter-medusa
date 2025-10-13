/**
 * Internal Catalog API - Main Route
 * GET /store/internal-catalog
 * 
 * Returns catalog overview and available categories
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { getInternalCatalogService } from "./catalog-service";

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

export const GET = async (
  req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const catalogService = getInternalCatalogService();

    try {
        // Get cache stats
        const cacheStats = catalogService.getCacheStats();

        // Get stats for all categories (cached)
        const categoryStats = await Promise.all(
            CATEGORIES.map(async (cat) => {
                try {
                    return await catalogService.getCategoryStats(cat);
                } catch (error) {
                    return null;
                }
            })
        );

        const validStats = categoryStats.filter(s => s !== null);
        const totalProducts = validStats.reduce((sum, s) => sum + (s?.total_products || 0), 0);
        const totalWithImages = validStats.reduce((sum, s) => sum + (s?.with_images || 0), 0);

        res.status(200).json({
            version: '1.0.0',
            status: 'operational',
            categories: CATEGORIES,
            total_categories: CATEGORIES.length,
            total_products: totalProducts,
            total_with_images: totalWithImages,
            image_coverage: totalProducts > 0 ? (totalWithImages / totalProducts * 100).toFixed(2) + '%' : '0%',
            cache: {
                ...cacheStats,
                hit_rate: (cacheStats.hit_rate * 100).toFixed(2) + '%'
            },
            endpoints: {
                category: '/store/internal-catalog/:category?page=1&limit=100',
                health: '/store/internal-catalog/health',
                preload: '/store/internal-catalog/preload',
                images: '/store/internal-catalog/images/:sku'
            },
            features: [
                'Pre-loaded images',
                'In-memory caching',
                'Optimized pagination',
                'Sub-50ms response time',
                'Independent from backend startup'
            ]
        });
    } catch (error: any) {
        console.error('Error loading catalog overview:', error);
        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message);
    }
};
