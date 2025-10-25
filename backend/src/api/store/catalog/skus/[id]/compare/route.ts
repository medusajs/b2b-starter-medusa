import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { UNIFIED_CATALOG_MODULE } from "../../../../../../modules/unified-catalog";

/**
 * GET /store/catalog/skus/:id/compare
 * Compara preços de um SKU entre distribuidores
 * Retorna ofertas ordenadas por preço + estatísticas
 */
export const GET = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE);

    const { id } = req.params;

    const comparison = await (catalogService as any).compareSKUPrices(id);

    res.json(comparison);
};
