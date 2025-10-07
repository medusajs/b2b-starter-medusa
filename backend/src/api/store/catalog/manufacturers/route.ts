import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import YshCatalogModuleService from "../../../../modules/ysh-catalog/service";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const yshCatalogService = req.scope.resolve("yshCatalog") as YshCatalogModuleService;

    try {
        const manufacturers = await yshCatalogService.getManufacturers();

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