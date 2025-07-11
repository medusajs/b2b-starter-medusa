import { featureFlagRouter } from "@medusajs/framework";
import { MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes, QueryContextType } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  isPresent,
  QueryContext,
  remoteQueryObjectFromString,
} from "@medusajs/framework/utils";
import {
  RequestWithContext,
  wrapProductsWithTaxPrices,
} from "@medusajs/medusa/api/store/products/helpers";
import { wrapVariantsWithInventoryQuantityForSalesChannel } from "@medusajs/medusa/api/utils/middlewares/index";
import IndexEngineFeatureFlag from "@medusajs/medusa/loaders/feature-flags/index-engine";

export const GET = async (
  req: RequestWithContext<HttpTypes.StoreProductListParams>,
  res: MedusaResponse<HttpTypes.StoreProductListResponse>
) => {
  if (featureFlagRouter.isFeatureEnabled(IndexEngineFeatureFlag.key)) {
    // TODO: These filters are not supported by the index engine yet
    if (
      isPresent(req.filterableFields.tags) ||
      isPresent(req.filterableFields.categories)
    ) {
      return await getProducts(req, res);
    }

    return await getProductsWithIndexEngine(req, res);
  }

  return await getProducts(req, res);
};

async function getProductsWithIndexEngine(
  req: RequestWithContext<HttpTypes.StoreProductListParams>,
  res: MedusaResponse<HttpTypes.StoreProductListResponse>
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const context: QueryContextType = {};
  const withInventoryQuantity = req.queryConfig.fields.some((field) =>
    field.includes("variants.inventory_quantity")
  );

  if (withInventoryQuantity) {
    req.queryConfig.fields = req.queryConfig.fields.filter(
      (field) => !field.includes("variants.inventory_quantity")
    );
  }

  if (isPresent(req.pricingContext)) {
    context["variants"] ??= {};
    context["variants"]["calculated_price"] = QueryContext(req.pricingContext!);
  }

  const filters: Record<string, any> = req.filterableFields;
  if (isPresent(filters.sales_channel_id)) {
    const salesChannelIds = filters.sales_channel_id;

    filters["sales_channels"] ??= {};
    filters["sales_channels"]["id"] = salesChannelIds;

    delete filters.sales_channel_id;
  }

  const { data: products = [], metadata } = await query.index({
    entity: "product",
    fields: req.queryConfig.fields,
    filters,
    pagination: req.queryConfig.pagination,
    context,
  });

  if (withInventoryQuantity) {
    await wrapVariantsWithInventoryQuantityForSalesChannel(
      req,
      products.map((product) => product.variants).flat(1)
    );
  }

  await wrapProductsWithTaxPrices(req, products);
  res.json({
    products,
    count: metadata!.estimate_count,
    estimate_count: metadata!.estimate_count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
}

async function getProducts(
  req: RequestWithContext<HttpTypes.StoreProductListParams>,
  res: MedusaResponse<HttpTypes.StoreProductListResponse>
) {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const context: object = {};
  const withInventoryQuantity = req.queryConfig.fields.some((field) =>
    field.includes("variants.inventory_quantity")
  );

  if (withInventoryQuantity) {
    req.queryConfig.fields = req.queryConfig.fields.filter(
      (field) => !field.includes("variants.inventory_quantity")
    );
  }

  if (isPresent(req.pricingContext)) {
    context["variants.calculated_price"] = {
      context: req.pricingContext,
    };
  }

  const queryObject = remoteQueryObjectFromString({
    entryPoint: "product",
    variables: {
      filters: req.filterableFields,
      ...req.queryConfig.pagination,
      ...context,
    },
    fields: [...req.queryConfig.fields, "company.id"],
  });

  const { rows: allProducts, metadata } = await remoteQuery(queryObject);

  if (withInventoryQuantity) {
    await wrapVariantsWithInventoryQuantityForSalesChannel(
      req,
      allProducts.map((product) => product.variants).flat(1)
    );
  }

  const [{ employee }] = await remoteQuery({
    entryPoint: "customer",
    fields: ["employee.company.id"],
    variables: {
      filters: { id: req.auth_context?.actor_id },
    },
  });

  if (!employee) {
    throw new Error("No employee");
  }

  const products = allProducts.filter(
    (p) => p.company.id === employee.company_id
  );

  await wrapProductsWithTaxPrices(req, allProducts);
  res.json({
    products,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
}
