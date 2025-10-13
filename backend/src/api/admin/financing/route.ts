import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { FINANCING_MODULE } from "../../../modules/financing";
import { validateCreateProposal } from "../../../modules/financing/validators";

export const GET = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const financingModuleService = req.scope.resolve(FINANCING_MODULE);
    const stats = await financingModuleService.getProposalStats();
    res.json({ stats });
  } catch (error: any) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to retrieve financing stats");
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
  } catch (error: any) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to create financing proposal");
  }
};