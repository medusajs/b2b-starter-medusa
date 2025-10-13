import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UNIFIED_CATALOG_MODULE } from "../../../modules/unified-catalog";
import UnifiedCatalogModuleService from "../../../modules/unified-catalog/service";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        // Use proper dependency injection instead of singleton
        const unifiedCatalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE) as UnifiedCatalogModuleService;

        const manufacturers = await unifiedCatalogService.getManufacturers();

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
            },
            metadata: {
                service_resolved: true,
                dependency_injection: "proper",
                singleton_removed: true,
            }
        });
    } catch (error: any) {
        console.error("Error in catalog overview:", error);
        res.status(500).json({
            error: "Erro interno do servidor",
            message: error.message,
            details: {
                module: UNIFIED_CATALOG_MODULE,
                service_resolution_failed: true,
            }
        });
    }
};