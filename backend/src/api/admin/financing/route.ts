import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { FINANCING_MODULE, FinancingModuleServiceType } from "../../../modules/financing";
import { validateCreateProposal } from "../../../modules/financing/validators";
import { APIResponse } from "../../../utils/api-response";
import { APIVersionManager } from "../../../utils/api-versioning";

export const GET = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;
    const stats = await financingModuleService.getProposalStats();
    res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
    APIResponse.success(res, { stats });
  } catch (error: any) {
    APIResponse.internalError(res, error?.message ?? "Failed to retrieve financing stats");
  }
};

export const POST = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const errors = validateCreateProposal(req.body);
    if (errors.length > 0) {
      APIResponse.validationError(res, "Validation failed", { errors });
      return;
    }

    const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;
    const proposal = await financingModuleService.createProposal(req.body as any);
    res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
    APIResponse.success(res, { proposal }, undefined, 201);
  } catch (error: any) {
    APIResponse.internalError(res, error?.message ?? "Failed to create financing proposal");
  }
};