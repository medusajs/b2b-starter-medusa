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

  const { limit = 100, offset = 0 } = req.validatedQuery || {};

  const {
    data: [company],
  } = await query.graph({
    entity: "company",
    fields: [
      "id",
      "carts.*",
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
    (cart) => cart?.approvals?.filter(Boolean)?.length
  );

  if (!carts) {
    return res.json({ approvals: [], count: 0 });
  }

  carts = carts.slice(offset, offset + limit);

  res.json({
    carts_with_approvals: carts,
    count: carts.length,
  });
};
