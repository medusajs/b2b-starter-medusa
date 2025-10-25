import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminGetApprovalsType } from "./validators";
import { APIResponse } from "../../../utils/api-response";
import { APIVersionManager } from "../../../utils/api-versioning";

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetApprovalsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { status } = req.validatedQuery || {};

  let filters: any = {};

  if (status) {
    filters = {
      status,
    };
  }

  const { data: approvalStatuses, metadata } = await query.graph({
    entity: "approval_status",
    ...req.queryConfig,
    fields: [
      "cart.*",
      "cart.approvals.*",
      "cart.approval_status.*",
      "cart.company.approval_settings.*",
      "cart.company.*",
      "cart.items.*",
      "cart.completed_at",
    ],
    filters: {
      ...filters,
    },
  });

  let carts = approvalStatuses
    .map((approvalStatus) => approvalStatus.cart)
    .filter(Boolean);

  res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
  APIResponse.success(res, { carts_with_approvals: carts }, metadata);
};
