import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getCatalogService } from "../_catalog-service";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const catalogService = getCatalogService();

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