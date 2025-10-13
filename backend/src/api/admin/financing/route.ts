import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { FINANCING_MODULE } from "../../../modules/financing";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);

  const stats = await financingModuleService.getProposalStats();

  res.json({ stats });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);

  const proposal = await financingModuleService.createProposal(req.body);

  res.status(201).json({ proposal });
};