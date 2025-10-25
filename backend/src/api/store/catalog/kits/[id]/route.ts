import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { UNIFIED_CATALOG_MODULE, UnifiedCatalogModuleServiceType } from "../../../../../modules/unified-catalog";

/**
 * GET /store/catalog/kits/:id
 * Retorna detalhes de um kit com componentes expandidos
 */
export const GET = async (
    req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const unifiedCatalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE) as UnifiedCatalogModuleServiceType;

    const { id } = req.params;

    const kit = await unifiedCatalogService.getKitWithComponents(id);

    res.json({ kit });
};
