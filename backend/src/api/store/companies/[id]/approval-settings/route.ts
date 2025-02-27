import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateApprovalSettingsWorkflow } from "../../../../../workflows/approval/workflows/update-approval-settings";
import { storeApprovalSettingsFields } from "../../query-config";
import { StoreUpdateApprovalSettingsType } from "../../validators";

export const POST = async (
  req: MedusaRequest<StoreUpdateApprovalSettingsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { id } = req.params;

  const {
    data: [approval_settings],
  } = await query.graph({
    entity: "approval_settings",
    fields: storeApprovalSettingsFields,
    filters: { company_id: id },
  });

  const { requires_admin_approval } = req.validatedBody;

  await updateApprovalSettingsWorkflow.run({
    input: {
      id: approval_settings.id,
      requires_admin_approval,
    },
  });

  res.status(201).send();
};
