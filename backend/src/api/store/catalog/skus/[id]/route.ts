import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// Module key for resolution
const UNIFIED_CATALOG_MODULE = "unifiedCatalog";

/**
 * GET /store/catalog/skus/:id
 * Retorna detalhes de um SKU com todas as ofertas de distribuidores
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE) as any;

    const { id } = req.params;

    // Buscar SKU
    const sku = await catalogService.retrieveSKU(id, {
        relations: [],
    });

    // Buscar ofertas
    const offers = await catalogService.listDistributorOffers({
        sku_id: id,
    });

    // Buscar manufacturer
    const manufacturer = sku.manufacturer_id
        ? await catalogService.listManufacturers({
            slug: sku.manufacturer_id,
        })
        : null;

    res.json({
        sku: {
            ...sku,
            manufacturer: manufacturer?.[0] || null,
        },
        offers,
    });
};
