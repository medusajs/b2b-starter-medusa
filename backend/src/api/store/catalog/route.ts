import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { YSH_CATALOG_MODULE } from "../../../modules/ysh-catalog";
import YshCatalogModuleService from "../../../modules/ysh-catalog/service";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const yshCatalogService = req.scope.resolve(YSH_CATALOG_MODULE) as YshCatalogModuleService;

    try {
        const manufacturers = await yshCatalogService.getManufacturers();

        res.json({
            categories: [
                "kits",
                "panels",
                "inverters",
                "cables",
                "chargers",
                "controllers",
                "accessories",
                "structures",
                "batteries",
                "stringboxes",
                "posts",
                "others"
            ],
            manufacturers,
            total_categories: 12,
            total_manufacturers: manufacturers.length,
            endpoints: {
                categories: "/api/store/catalog/categories",
                manufacturers: "/api/store/catalog/manufacturers",
                search: "/api/store/catalog/search?q={query}",
                category: "/api/store/catalog/{category}",
                product: "/api/store/catalog/{category}/{id}"
            }
        });
    } catch (error) {
        res.status(500).json({
            error: "Erro interno do servidor",
            message: error.message
        });
    }
};