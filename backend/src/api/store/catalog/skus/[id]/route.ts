import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getCatalogService } from "../../_catalog-service";

/**
 * GET /store/catalog/skus/:id
 * Retorna detalhes de um SKU com todas as ofertas de distribuidores
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const catalogService = getCatalogService();

    const { id } = req.params;

    // Buscar SKU
    const sku = await catalogService.retrieveSKU(id);

    if (!sku) {
        return res.status(404).json({ error: "SKU não encontrado" });
    }

    // Buscar ofertas
    const offers = await catalogService.listDistributorOffers({
        where: { sku_id: id },
    });

    res.json({
        sku,
        offers,
    });
};
