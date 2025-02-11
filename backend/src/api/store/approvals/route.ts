import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ApprovalType } from "../../../types/approval";
import { StoreGetApprovalsType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<StoreGetApprovalsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { customer_id } = req.auth_context.app_metadata as {
    customer_id: string;
  };

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["employee.company.id"],
    filters: { id: customer_id },
  });

  const companyId = customer?.employee?.company?.id as string;

  if (!companyId) {
    return res.json({ approvals: [], count: 0 });
  }

  const {
    data: [company],
  } = await query.graph({
    entity: "company",
    fields: [
      "carts.*",
      "carts.approval_status.*",
      "carts.company.approval_settings.*",
      "carts.company.*",
      "carts.items.*",
      "carts.completed_at",
    ],
    filters: { id: companyId },
  });

  if (!company?.carts) {
    return res.json({ carts_with_approvals: [], count: 0 });
  }

  const { status } = req.validatedQuery || {};

  const cartIds = company.carts
    .filter((cart) => cart !== undefined && cart !== null)
    .map((cart) => cart.id);

  let approvalStatusFilters: any = {
    cart_id: cartIds,
  };

  if (status) {
    approvalStatusFilters.status = status;
  }

  const { data: approvalStatuses, metadata } = await query.graph({
    entity: "approval_status",
    ...req.queryConfig,
    fields: ["*", "cart.approvals.id"],
    filters: approvalStatusFilters,
  });

  const approvalIds = approvalStatuses
    .flatMap((approvalStatus) =>
      approvalStatus.cart?.approvals?.map((approval) => approval?.id)
    )
    .filter(Boolean) as string[];

  const { data: approvals } = await query.graph({
    entity: "approval",
    fields: ["*"],
    filters: {
      id: approvalIds,
      type: ApprovalType.ADMIN as any,
    },
  });

  const cartsWithAdminApprovals = company.carts
    .map((cart) => {
      const cartApprovals = approvals.filter(
        (approval) => approval.cart_id === cart?.id
      );
      if (cartApprovals.length > 0) {
        cart && (cart.approvals = cartApprovals);
        return cart;
      }
      return null;
    })
    .filter(Boolean);

  if (!cartsWithAdminApprovals.length) {
    return res.json({ carts_with_approvals: [], count: 0 });
  }

  res.json({
    carts_with_approvals: cartsWithAdminApprovals,
    ...metadata,
  });
};
