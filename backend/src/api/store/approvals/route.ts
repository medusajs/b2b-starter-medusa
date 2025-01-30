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
      "id",
      "carts.*",
      "carts.items.*",
      "carts.approvals.*",
      "carts.approval_status.status",
      "approval_settings.*",
    ],
    filters: {
      id: companyId,
      carts: {
        approvals: {
          ...req.filterableFields,
        },
      },
    },
  });

  let carts = company?.carts?.filter(
    (cart) => cart?.approvals?.filter(Boolean).length
  );

  carts = carts?.map((cart) => {
    if (!cart) return null;
    cart.approvals = cart?.approvals?.filter(Boolean) || [];
    cart.approval_status = Array.isArray(cart?.approval_status)
      ? cart?.approval_status.filter(Boolean)[0]
      : cart?.approval_status;
    return cart;
  });

  if (!carts) {
    return res.json({ carts_with_approvals: [], count: 0 });
  }

  // Store total count before pagination
  const totalCount = carts.length;

  console.log("no of carts before", totalCount);

  const { limit, offset } = req.validatedQuery || {};

  if (offset !== undefined && limit !== undefined) {
    const numericOffset = Number(offset);
    const numericLimit = Number(limit);
    const paginatedCarts = carts.slice(
      numericOffset,
      numericOffset + numericLimit
    );
    carts = paginatedCarts;
  }

  console.log("no of carts after", carts.length);

  res.json({
    carts_with_approvals: carts,
    count: totalCount,
  });
};
