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
  req: AuthenticatedMedusaRequest<HttpTypes.AdminCollectionListParams>,
  res: MedusaResponse<HttpTypes.AdminCollectionListResponse>
) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [{ employee }],
  } = await query.graph({
    entity: "customer",
    fields: ["employee.company.id"],
    filters: { id: req.auth_context.actor_id },
  });

  if (!employee) {
    throw new Error("No employee");
  }

  const collectionQuery = remoteQueryObjectFromString({
    entryPoint: "product_collection",
    variables: {
      filters: req.filterableFields,
      ...req.queryConfig.pagination,
    },
    fields: [...req.queryConfig.fields, "company.id", "products.company.id"],
  });

  const { rows: allCollections, metadata } = await remoteQuery(collectionQuery);

  const collections = allCollections.reduce((acc, el) => {
    if (el.company.id !== employee.company_id) {
      return acc;
    }

    el.products = el.products.filter(
      (p) => p.company.id === employee.company_id
    );

    acc.push(el);

    return acc;
  }, []);

  res.json({
    collections,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};
