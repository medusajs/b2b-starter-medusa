import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UNIFIED_CATALOG_MODULE } from "../../../modules/unified-catalog";
import {
    StoreGetCatalogKitsParams,
    StoreGetCatalogKitsParamsType,
} from "./validators";

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

    const [kits, count] = await catalogService.listAndCountKits(
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
