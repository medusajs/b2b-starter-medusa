import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
    StoreGetCatalogKitsParams,
    StoreGetCatalogKitsParamsType,
} from "../validators";

// Module key for resolution
const UNIFIED_CATALOG_MODULE = "unifiedCatalog";

/**
 * GET /store/catalog/kits
 * Lista kits solares com filtros
 */
export const GET = async (
    req: MedusaRequest<StoreGetCatalogKitsParamsType>,
    res: MedusaResponse
) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE);

    const validatedQuery = StoreGetCatalogKitsParams.parse(req.query);

    const { limit, offset, ...filters } = validatedQuery;

    const [kits, count] = await (catalogService as any).listAndCountKits(
        {
            ...(filters.category && { category: filters.category }),
            ...(filters.target_consumer_class && {
                target_consumer_class: filters.target_consumer_class,
            }),
            ...(filters.min_capacity_kwp && {
                system_capacity_kwp: { $gte: filters.min_capacity_kwp },
            }),
            ...(filters.max_capacity_kwp && {
                system_capacity_kwp: { $lte: filters.max_capacity_kwp },
            }),
            is_active: true,
        },
        {
            skip: offset,
            take: limit,
            order: { system_capacity_kwp: "ASC" },
        }
    );

    res.json({
        kits,
        count,
        limit,
        offset,
    });
};
