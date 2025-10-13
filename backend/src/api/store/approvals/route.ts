import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StoreGetApprovalsType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<StoreGetApprovalsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const filters: any = {
    "cart.company.employees.customer_id": req.auth_context.actor_id,
  };

  if (req.validatedQuery.status) {
    filters.status = req.validatedQuery.status;
  }

  if (req.validatedQuery.type) {
    filters.type = req.validatedQuery.type;
  }

  const { data: approvals, metadata } = await query.graph({
    entity: "approval",
    fields: req.queryConfig.fields,
    filters,
    pagination: req.queryConfig.pagination,
  });

  res.json({
    approvals,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};
