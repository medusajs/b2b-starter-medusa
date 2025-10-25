/**
 * Fallback Product by Category API - TypeScript
 * GET /store/fallback/products/:category
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { APIResponse } from "../../../../../utils/api-response";
import { APIVersionManager } from "../../../../../utils/api-versioning";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DATA_PATH = path.join(__dirname, '../../../../../../data/catalog/fallback_exports');

/**
 * GET /store/fallback/products/:category
 * Returns products for specific category
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { category } = req.params as any;
        const { limit = 50, offset = 0, q, manufacturer } = req.query as any;

        const categoryPath = path.join(FALLBACK_DATA_PATH, `${category}.json`);

        if (!fs.existsSync(categoryPath)) {
            APIResponse.notFound(res, `Category '${category}' not found`);
            return;
        }

        const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
        let products = categoryData.products || [];

        // Apply manufacturer filter
        if (manufacturer) {
            products = products.filter((p: any) =>
                p.manufacturer?.toLowerCase() === String(manufacturer).toLowerCase()
            );
        }

        // Apply search filter
        if (q) {
            const searchTerm = String(q).toLowerCase();
            products = products.filter((p: any) =>
                p.name?.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm) ||
                p.model?.toLowerCase().includes(searchTerm)
            );
        }

        // Apply pagination
        const paginatedProducts = products.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
        res.setHeader("X-Data-Source", "fallback-export");
        res.setHeader("X-Category", category);

        APIResponse.paginated(res, paginatedProducts, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            count: paginatedProducts.length,
            total: products.length
        });

    } catch (error: any) {
        console.error("[Fallback Category API] Error:", error);
        APIResponse.internalError(res, error.message);
    }
}
