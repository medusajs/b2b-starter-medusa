import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { UNIFIED_CATALOG_MODULE } from "../../../modules/unified-catalog";
import { GetCatalogParamsType } from "./validators";

export const GET = async (
  req: MedusaRequest<GetCatalogParamsType>,
  res: MedusaResponse
) => {
  const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE);
  const { category, manufacturer, source } = req.validatedQuery;

  const filters: any = {};
  if (category) filters.category = category;
  if (manufacturer) filters.manufacturer = manufacturer;
  if (source === "internal") filters.is_internal = true;

  const [products, manufacturers] = await Promise.all([
    catalogService.listProducts(filters, {
      skip: req.validatedQuery.offset,
      take: req.validatedQuery.limit,
    }),
    catalogService.getManufacturers(),
  ]);

  res.json({
    products: products.data,
    manufacturers,
    count: products.count,
    offset: req.validatedQuery.offset,
    limit: req.validatedQuery.limit,
  });
};