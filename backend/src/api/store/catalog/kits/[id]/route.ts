import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// Module key for resolution
const UNIFIED_CATALOG_MODULE = "unifiedCatalog";

/**
 * GET /store/catalog/kits/:id
 * Retorna detalhes de um kit com componentes expandidos
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE) as any;

    const { id } = req.params;

    const kit = await catalogService.getKitWithComponents(id);

    res.json({ kit });
};
