import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UNIFIED_CATALOG_MODULE } from "../../../modules/unified-catalog";

/**
 * GET /store/catalog/kits/:id
 * Retorna detalhes de um kit com componentes expandidos
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const unifiedCatalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE);

    const { id } = req.params;

    const kit = await unifiedCatalogService.getKitWithComponents(id);

    res.json({ kit });
};
