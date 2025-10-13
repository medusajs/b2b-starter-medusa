import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { UNIFIED_CATALOG_MODULE } from "../../../../modules/unified-catalog";

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE) as any;

    try {
        const manufacturers = await catalogService.listManufacturers();

        res.json({
            manufacturers,
            total: manufacturers.length
        });
    } catch (error) {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch manufacturers");
    }
};