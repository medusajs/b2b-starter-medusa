import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UNIFIED_CATALOG_MODULE } from "../../../../modules/unified-catalog";

export const GET = async (
    req: MedusaRequest,
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
        res.status(500).json({
            error: "Erro interno do servidor",
            message: error.message
        });
    }
};