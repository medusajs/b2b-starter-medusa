import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetIdParamsType = z.infer<typeof GetIdParams>;
export const GetIdParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});

export type ApproveProposalType = z.infer<typeof ApproveProposal>;
export const ApproveProposal = z.object({
  approved_amount: z.number().positive(),
  approved_term_months: z.number().positive(),
  interest_rate_annual: z.number().positive(),
  approval_conditions: z.array(z.string()).optional(),
  expires_in_days: z.number().positive().optional(),
});

export type ContractProposalType = z.infer<typeof ContractProposal>;
export const ContractProposal = z.object({
  contract_terms: z.any().optional(),
});

export type CancelProposalType = z.infer<typeof CancelProposal>;
export const CancelProposal = z.object({
  cancellation_reason: z.string().min(1),
});

export type UpdateProposalType = z.infer<typeof UpdateProposal>;
export const UpdateProposal = z.object({
  approved_amount: z.number().positive().optional(),
  approved_term_months: z.number().positive().optional(),
  interest_rate_monthly: z.number().positive().optional(),
  interest_rate_annual: z.number().positive().optional(),
  cet_rate: z.number().positive().optional(),
  approval_conditions: z.any().optional(),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
});
