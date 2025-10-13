import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UNIFIED_CATALOG_MODULE } from "../../../modules/unified-catalog";

/**
 * GET /store/catalog/skus/:id
 * Retorna detalhes de um SKU com todas as ofertas de distribuidores
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const unifiedCatalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE);

    const { id } = req.params;

    // Buscar SKU
    const sku = await unifiedCatalogService.retrieveSKU(id);

    if (!sku) {
        return res.status(404).json({ error: "SKU não encontrado" });
    }

    // Buscar ofertas
    const offers = await unifiedCatalogService.listDistributorOffers({
        where: { sku_id: id },
    });

    res.json({
        sku,
        offers,
    });
};
