/**
 * Internal Catalog API - Health Check
 * GET /store/internal-catalog/health
 * 
 * Returns catalog health status and metrics
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getInternalCatalogService } from "../catalog-service";
import { getImageCache } from "../image-cache";
import { CatalogHealthCheck } from "../types";
import fs from 'fs/promises';
import path from 'path';

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
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const catalogService = getInternalCatalogService();
    const imageCache = getImageCache();

    try {
        // Check categories health
        const categoryStats: any = {};
        let totalProducts = 0;
        let totalWithImages = 0;

        for (const category of CATEGORIES) {
            try {
                const stats = await catalogService.getCategoryStats(category);
                categoryStats[category] = stats;
                totalProducts += stats.total_products;
                totalWithImages += stats.with_images;
            } catch (error) {
                categoryStats[category] = {
                    error: 'Failed to load category',
                    category
                };
            }
        }

        // Check image sync status
        const IMAGE_MAP_PATH = path.join(__dirname, '../../../../static/images-catálogo_distribuidores/IMAGE_MAP.json');
        let imageSyncStatus: any = {
            total_images: 0,
            synced: 0,
            missing: 0,
            pending: 0,
            errors: 0,
            sync_time_ms: 0,
            last_sync: new Date().toISOString()
        };

        try {
            const imageMapContent = await fs.readFile(IMAGE_MAP_PATH, 'utf-8');
            const imageMap = JSON.parse(imageMapContent);
            imageSyncStatus.total_images = imageMap.total_images || 0;
            imageSyncStatus.synced = imageMap.total_skus || 0;
            imageSyncStatus.last_sync = imageMap.generated_at || new Date().toISOString();
        } catch (error) {
            console.error('Failed to read image map:', error);
        }

        // Cache stats
        const cacheStats = catalogService.getCacheStats();

        // Determine health status
        const imageCoverage = totalProducts > 0 ? totalWithImages / totalProducts : 0;
        let status: 'healthy' | 'degraded' | 'unhealthy';

        if (imageCoverage > 0.8 && cacheStats.entries > 0) {
            status = 'healthy';
        } else if (imageCoverage > 0.5) {
            status = 'degraded';
        } else {
            status = 'unhealthy';
        }

        const healthCheck: CatalogHealthCheck = {
            status,
            categories: categoryStats,
            images: imageSyncStatus,
            cache: {
                ...cacheStats,
                hit_rate: cacheStats.hit_rate
            },
            uptime_seconds: imageCache.getUptimeSeconds(),
            last_updated: new Date().toISOString()
        };

        res.status(200).json(healthCheck);
    } catch (error: any) {
        console.error('Error in health check:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
};
