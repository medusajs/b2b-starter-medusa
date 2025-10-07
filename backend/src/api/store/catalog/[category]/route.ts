import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import YshCatalogModuleService from "../../../../modules/ysh-catalog/service";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const yshCatalogService = req.scope.resolve("yshCatalog") as YshCatalogModuleService;
    const { category } = req.params;

    try {
        const {
            page = 1,
            limit = 20,
            manufacturer,
            minPrice,
            maxPrice,
            availability
        } = req.query;

        const options = {
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 20,
            manufacturer: manufacturer as string,
            minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
            availability: availability as string
        };

        const result = await yshCatalogService.listProductsByCategory(category, options);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            error: "Erro ao buscar produtos",
            message: error.message
        });
    }
};