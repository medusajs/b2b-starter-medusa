import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { FINANCING_MODULE } from "../../../modules/financing";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const proposals = await financingModuleService.getProposalsByCustomer(customerId);

  res.json({ proposals });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const proposal = await financingModuleService.createProposal({
    ...req.body,
    customer_id: customerId,
  });

  res.status(201).json({ proposal });
};