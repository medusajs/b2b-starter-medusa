import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/framework/utils";

export const GET = async (
  req: AuthenticatedMedusaRequest<HttpTypes.StoreCollectionFilters>,
  res: MedusaResponse<HttpTypes.StoreCollectionListResponse>
) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const query = remoteQueryObjectFromString({
    entryPoint: "product_collection",
    variables: {
      filters: req.filterableFields,
      ...req.queryConfig.pagination,
    },
    fields: [...req.queryConfig.fields, "products.company.id"],
  });

  const { rows: allCollections, metadata } = await remoteQuery(query);

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

  const collections = allCollections.reduce((acc, el) => {
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
  }, [] as typeof allCollections);

  res.json({
    collections,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};
