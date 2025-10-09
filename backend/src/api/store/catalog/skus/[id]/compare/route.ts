import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UNIFIED_CATALOG_MODULE } from "../../../../../../modules/unified-catalog";

/**
 * GET /store/catalog/skus/:id/compare
 * Compara preços de um SKU entre distribuidores
 * Retorna ofertas ordenadas por preço + estatísticas
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE);

    const { id } = req.params;

    const comparison = await catalogService.compareSKUPrices(id);

    res.json(comparison);
};
