import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { FINANCING_MODULE } from "../../../modules/financing";
import { validateCreateProposal } from "../../../modules/financing/validators";

export const GET = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const financingModuleService = req.scope.resolve(FINANCING_MODULE);
    const stats = await financingModuleService.getProposalStats();
    res.json({ stats });
  } catch (error) {
    throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message);
  }
};

export const POST = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const errors = validateCreateProposal(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const financingModuleService = req.scope.resolve(FINANCING_MODULE);
    const proposal = await financingModuleService.createProposal(req.body);
    res.status(201).json({ proposal });
  } catch (error) {
    throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message);
  }
};