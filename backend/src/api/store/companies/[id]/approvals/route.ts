import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ApprovalStatus } from "@starter/types/approval";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: companyId } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [company],
  } = await query.graph({
    entity: "company",
    fields: ["cart.approval.*"],
    filters: {
      id: companyId,
    },
  });

  const approvals = company.cart
    ?.map(({ approval }) => approval)
    .filter(Boolean);

  // console.log("approvals", approvals);
  // console.log("approvals", approvals);

  res.json({ approvals });
};
