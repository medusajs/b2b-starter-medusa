/**
 * Fallback Product by ID API - TypeScript
 * GET /store/fallback/products/:category/:id
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { APIResponse } from "../../../../../../utils/api-response";
import { APIVersionManager } from "../../../../../../utils/api-versioning";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DATA_PATH = path.join(__dirname, '../../../../../../../data/catalog/fallback_exports');

/**
 * GET /store/fallback/products/:category/:id
 * Returns single product by ID
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { category, id } = req.params as any;

        const categoryPath = path.join(FALLBACK_DATA_PATH, `${category}.json`);

        if (!fs.existsSync(categoryPath)) {
            APIResponse.notFound(res, `Category '${category}' not found`);
            return;
        }

        const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
        const products = categoryData.products || [];

        const product = products.find((p: any) => p.id === id || p.sku === id);

        if (!product) {
            APIResponse.notFound(res, `Product '${id}' not found in category '${category}'`);
            return;
        }

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
        res.setHeader("X-Data-Source", "fallback-export");
        res.setHeader("X-Category", category);

        APIResponse.success(res, { product });

    } catch (error: any) {
        console.error("[Fallback Product API] Error:", error);
        APIResponse.internalError(res, error.message);
    }
}
