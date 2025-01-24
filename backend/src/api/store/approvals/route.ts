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
    return res.json({ approvals: [] });
  }

  const { filters } = req.filterableFields as { filters: Record<string, any> };

  const {
    data: [company],
  } = await query.graph({
    entity: "company",
    fields: ["carts.approvals.*"],
    filters: {
      id: companyId,
      carts: {
        approvals: {
          ...filters,
        },
      },
    },
    pagination: {
      skip: 0,
      take: 1,
    },
  });

  const approvals = company?.carts
    ?.flatMap((cart) => cart?.approvals?.flatMap((a) => a).filter(Boolean))
    .filter(Boolean);

  const { pagination } = req.queryConfig;

  const skip = pagination?.skip || 0;
  const take = pagination?.take || 10;

  const paginatedApprovals = approvals?.slice(skip, skip + take);

  res.json({ approvals: paginatedApprovals, count: approvals?.length || 0 });
};
