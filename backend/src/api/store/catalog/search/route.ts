import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import YshCatalogModuleService from "../../../../modules/ysh-catalog/service";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const yshCatalogService = req.scope.resolve("yshCatalog") as YshCatalogModuleService;

    try {
        const { q: query, category, limit = 20 } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: "Parâmetro de busca obrigatório",
                message: "Use o parâmetro 'q' para especificar o termo de busca"
            });
        }

        const options = {
            category: category as string,
            limit: parseInt(limit as string) || 20
        };

        const products = await yshCatalogService.searchProducts(query, options);

        res.json({
            query,
            results: products.length,
            products
        });
    } catch (error) {
        res.status(400).json({
            error: "Erro na busca",
            message: error.message
        });
    }
};