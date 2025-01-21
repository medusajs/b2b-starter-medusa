import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StoreGetApprovalsType } from "./validators";

export const GET = async (
  req: MedusaRequest<StoreGetApprovalsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: approvals } = await query.graph({
    entity: "approval",
    fields: req.queryConfig.fields,
    filters: req.filterableFields,
  });

  res.json({ approvals });
};
