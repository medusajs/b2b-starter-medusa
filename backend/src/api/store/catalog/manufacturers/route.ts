import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import UnifiedCatalogModuleService from "../../../../modules/unified-catalog/service";

// Temporary workaround: instantiate service directly
let catalogServiceInstance: UnifiedCatalogModuleService | null = null;

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    if (!catalogServiceInstance) {
        catalogServiceInstance = new UnifiedCatalogModuleService({}, {});
    }
    const catalogService = catalogServiceInstance;

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