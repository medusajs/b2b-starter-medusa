import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import {
  StoreProductCategoryListParams,
  StoreProductCategoryListResponse,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/framework/utils";

export const GET = async (
  req: AuthenticatedMedusaRequest<StoreProductCategoryListParams>,
  res: MedusaResponse<StoreProductCategoryListResponse>
) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const queryObject = remoteQueryObjectFromString({
    entryPoint: "product_category",
    variables: {
      filters: req.filterableFields,
      ...req.queryConfig.pagination,
    },
    fields: [...req.queryConfig.fields, "products.company.id"],
  });

  const { rows: allProductCategories, metadata } = await remoteQuery(
    queryObject
  );

  const [{ employee }] = await remoteQuery(
    {
      entryPoint: "customer",
      fields: ["employee.company.id"],
      variables: {
        filters: { id: req.auth_context?.actor_id },
      },
    },
    { throwIfKeyNotFound: true }
  );

  if (!employee) {
    throw new Error("No employee");
  }

  const product_categories = allProductCategories.reduce((acc, el) => {
    const products = el.products.filter(
      (p) => p.company?.id === employee.company_id
    );

    if (products.length > 0) {
      acc.push({
        ...el,
        products,
      });
    }

    return acc;
  }, [] as typeof allProductCategories);

  res.json({
    product_categories,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};
