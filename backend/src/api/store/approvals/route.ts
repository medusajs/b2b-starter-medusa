import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StoreGetApprovalsType } from "./validators";

export const GET = async (
  req: MedusaRequest<StoreGetApprovalsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // TODO: Use the correct fields
  const { fields } = req.query;

  const fieldsArray = (Array.isArray(fields) ? fields : [fields]).filter(
    (field) => field
  );

  const { data: approvals } = await query.graph({
    entity: "approval",
    fields: fieldsArray,
    filters: req.filterableFields,
  });

  res.json({ approvals });
};
