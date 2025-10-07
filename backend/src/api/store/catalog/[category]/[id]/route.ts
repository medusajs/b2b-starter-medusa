import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import YshCatalogModuleService from "../../../../../modules/ysh-catalog/service";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const yshCatalogService = req.scope.resolve("yshCatalog") as YshCatalogModuleService;
    const { category, id } = req.params;

    try {
        const product = await yshCatalogService.getProductById(category, id);

        if (!product) {
            return res.status(404).json({
                error: "Produto não encontrado",
                message: `Produto ${id} não encontrado na categoria ${category}`
            });
        }

        res.json({ product });
    } catch (error) {
        res.status(400).json({
            error: "Erro ao buscar produto",
            message: error.message
        });
    }
};