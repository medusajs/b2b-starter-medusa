import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { FINANCING_MODULE, FinancingModuleServiceType } from "../../../modules/financing";
import { CreateFinancingProposalType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const proposals = await financingModuleService.getProposalsByCustomer(customerId);

  res.json({ proposals });
};

export const POST = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const validatedBody = req.body as {
    quote_id?: string;
    credit_analysis_id?: string;
    modality: "CDC" | "LEASING" | "EAAS";
    requested_amount: number;
    down_payment_amount?: number;
    requested_term_months: number;
    amortization_system?: "PRICE" | "SAC";
    notes?: string;
  };
  const proposal = await financingModuleService.createProposal({
    ...validatedBody,
    customer_id: customerId,
  });

  res.status(201).json({ proposal });
};