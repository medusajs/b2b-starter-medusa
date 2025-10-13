/**
 * Fallback Products API - TypeScript
 * Serves product data from pre-generated exports with image synchronization
 * 
 * GET /store/fallback/products
 * GET /store/fallback/products/:category
 * GET /store/fallback/products/:category/:id
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { APIResponse } from "../../../../utils/api-response";
import { APIVersionManager } from "../../../../utils/api-versioning";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DATA_PATH = path.join(__dirname, '../../../../../data/catalog/fallback_exports');
const MASTER_JSON_PATH = path.join(FALLBACK_DATA_PATH, 'products_master.json');

// Cache for loaded data
let masterDataCache: any = null;
let categoryDataCache: Map<string, any> = new Map();

/**
 * Load master product data
 */
function loadMasterData() {
    if (masterDataCache) return masterDataCache;

    try {
        if (fs.existsSync(MASTER_JSON_PATH)) {
            masterDataCache = JSON.parse(fs.readFileSync(MASTER_JSON_PATH, 'utf8'));
            return masterDataCache;
        }
    } catch (error) {
        console.error('[Fallback API] Error loading master data:', error);
    }

    return null;
}

/**
 * Load category-specific data
 */
function loadCategoryData(category: string) {
    if (categoryDataCache.has(category)) {
        return categoryDataCache.get(category);
    }

    try {
        const categoryPath = path.join(FALLBACK_DATA_PATH, `${category}.json`);
        if (fs.existsSync(categoryPath)) {
            const data = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
            categoryDataCache.set(category, data);
            return data;
        }
    } catch (error) {
        console.error(`[Fallback API] Error loading category ${category}:`, error);
    }

    return null;
}

/**
 * GET /store/fallback/products
 * Returns all products or filters by category
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { category, limit = 50, offset = 0, q } = req.query as any;

        // If category specified, load category data
        if (category) {
            const categoryData = loadCategoryData(category);

            if (!categoryData) {
                APIResponse.notFound(res, `Category '${category}' not found`);
                return;
            }

            let products = categoryData.products || [];

            // Apply search filter if provided
            if (q) {
                const searchTerm = String(q).toLowerCase();
                products = products.filter((p: any) =>
                    p.name?.toLowerCase().includes(searchTerm) ||
                    p.manufacturer?.toLowerCase().includes(searchTerm) ||
                    p.description?.toLowerCase().includes(searchTerm)
                );
            }

            // Apply pagination
            const paginatedProducts = products.slice(
                parseInt(offset),
                parseInt(offset) + parseInt(limit)
            );

            res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
            res.setHeader("X-Data-Source", "fallback-export");

            APIResponse.paginated(res, paginatedProducts, {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: paginatedProducts.length,
                total: products.length
            });
            return;
        }

        // Load master data
        const masterData = loadMasterData();

        if (!masterData) {
            APIResponse.serviceUnavailable(res, "Fallback data not available");
            return;
        }

        let products = masterData.products || [];

        // Apply search filter
        if (q) {
            const searchTerm = String(q).toLowerCase();
            products = products.filter((p: any) =>
                p.name?.toLowerCase().includes(searchTerm) ||
                p.manufacturer?.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm)
            );
        }

        // Apply pagination
        const paginatedProducts = products.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
        res.setHeader("X-Data-Source", "fallback-export");
        res.setHeader("X-Total-Products", String(masterData.total_products));
        res.setHeader("X-Image-Coverage", masterData.image_coverage_percent);

        APIResponse.paginated(res, paginatedProducts, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            count: paginatedProducts.length,
            total: products.length
        });

    } catch (error: any) {
        console.error("[Fallback API] Error:", error);
        APIResponse.internalError(res, error.message);
    }
}
