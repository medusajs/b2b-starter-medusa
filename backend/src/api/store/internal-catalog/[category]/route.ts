/**
 * Internal Catalog API - Category Products
 * GET /store/internal-catalog/:category
 * 
 * Returns ~100 products per category with optimized image loading
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getInternalCatalogService } from "../catalog-service";
import { CatalogResponse } from "../types";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const startTime = Date.now();
  const catalogService = getInternalCatalogService();
  const { category } = req.params;

  try {
    const {
      page = '1',
      limit = '100',
      manufacturer,
      minPrice,
      maxPrice,
      hasImage
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 100, 200); // Max 200 per request

    const filters = {
      manufacturer: manufacturer as string | undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      hasImage: hasImage === 'true'
    };

    // Load products
    const queryStart = Date.now();
    const { products, total } = await catalogService.getCategoryProducts(
      category,
      pageNum,
      limitNum,
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
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
        has_next: pageNum * limitNum < total,
        has_prev: pageNum > 1
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
    res.status(500).json({
      error: 'Failed to load catalog',
      message: error.message,
      category
    });
  }
};
