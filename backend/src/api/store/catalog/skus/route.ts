import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UNIFIED_CATALOG_MODULE } from "../../../modules/unified-catalog";
import {
    StoreGetCatalogSKUsParams,
    StoreGetCatalogSKUsParamsType,
} from "./validators";

/**
 * GET /store/catalog/skus
 * Lista SKUs com filtros avançados
 */
export const GET = async (
    req: MedusaRequest<StoreGetCatalogSKUsParamsType>,
    res: MedusaResponse
) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE);

    const validatedQuery = StoreGetCatalogSKUsParams.parse(req.query);

    const { limit, offset, ...filters } = validatedQuery;

    // Buscar SKUs
    const [skus, count] = await catalogService.listAndCountSKUs(
        {
            ...(filters.category && { category: filters.category }),
            ...(filters.manufacturer_id && {
                manufacturer_id: filters.manufacturer_id,
            }),
            ...(filters.min_price && {
                average_price: { $gte: filters.min_price },
            }),
            ...(filters.max_price && {
                average_price: { $lte: filters.max_price },
            }),
            is_active: true,
        },
        {
            skip: offset,
            take: limit,
            order: { average_price: "ASC" },
        }
    );

    res.json({
        skus,
        count,
        limit,
        offset,
    });
};
