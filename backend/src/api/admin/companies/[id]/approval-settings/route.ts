import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateApprovalSettingsWorkflow } from "../../../../../workflows/approval/workflows";
import { adminApprovalSettingsFields } from "../../query-config";
import { AdminCreateApprovalSettingsType } from "../../validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: approvalSettings, metadata } = await query.graph({
    entity: "approval_settings",
    fields: adminApprovalSettingsFields,
    filters: req.filterableFields,
    pagination: {
      ...req.remoteQueryConfig.pagination,
    },
  });

  res.json({
    approvalSettings,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateApprovalSettingsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { result: updatedApprovalSettings } =
    await updateApprovalSettingsWorkflow.run({
      input: req.validatedBody,
      container: req.scope,
    });

  const { data: approvalSettings } = await query.graph(
    {
      entity: "approval_settings",
      fields: adminApprovalSettingsFields,
      filters: {
        id: updatedApprovalSettings.id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ approvalSettings });
};
