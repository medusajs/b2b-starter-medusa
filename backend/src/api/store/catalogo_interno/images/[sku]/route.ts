/**
 * Internal Catalog API - Image Endpoint
 * GET /store/internal-catalog/images/:sku
 * 
 * Returns image information for a specific SKU
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { getInternalCatalogService } from "../../catalog-service";
import fs from 'fs/promises';
import path from 'path';

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const catalogService = getInternalCatalogService();
    const { sku } = req.params;

    try {
        const image = await catalogService.getImageForSku(sku);

        // Check if image files exist
        const imageDir = path.join(__dirname, '../../../../../static/images-catálogo_distribuidores');
        const checks = await Promise.all(
            Object.entries(image.sizes).map(async ([size, url]: [string, string]) => {
                try {
                    const fullPath = path.join(imageDir, url.replace('/static/images-catálogo_distribuidores/', ''));
                    await fs.access(fullPath);
                    return { size, exists: true, url };
                } catch {
                    return { size, exists: false, url };
                }
            })
        );

        const allExist = checks.every(c => c.exists);

        res.status(200).json({
            sku,
            image,
            file_checks: checks,
            all_files_exist: allExist,
            recommendations: {
                use_cdn: allExist,
                fallback_needed: !allExist
            }
        });
    } catch (error: any) {
        console.error(`Error loading image for SKU ${sku}:`, error);
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to load image for SKU");
    }
};
