import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { FINANCING_MODULE, FinancingModuleServiceType } from "../../../../modules/financing";
import { ApproveProposalType, ContractProposalType, CancelProposalType, UpdateProposalType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;
  const { id } = req.params;

  const proposal = await financingModuleService.getProposal(id);

  if (!proposal) {
    return res.status(404).json({ message: "Proposal not found" });
  }

  res.json({ proposal });
};

export const POST = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;
  const { id } = req.params;
  const body = req.body as { action?: string;[key: string]: any };
  const { action, ...data } = body;

  let result;

  switch (action) {
    case "approve":
      result = await financingModuleService.approveProposal({
        id,
        approved_amount: data.approved_amount,
        approved_term_months: data.approved_term_months,
        interest_rate_annual: data.interest_rate_annual,
        approval_conditions: data.approval_conditions,
        expires_in_days: data.expires_in_days,
      });
      break;
    case "contract":
      result = await financingModuleService.contractProposal({
        id,
        contract_terms: data.contract_terms,
      });
      break;
    case "cancel":
      result = await financingModuleService.cancelProposal({
        id,
        cancellation_reason: data.cancellation_reason,
      });
      break;
    default:
      result = await financingModuleService.updateProposal({
        id,
        ...data
      });
  }

  res.json({ proposal: result });
};