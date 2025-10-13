import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetFinancingParamsType = z.infer<typeof GetFinancingParams>;
export const GetFinancingParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});

export type CreateFinancingProposalType = z.infer<typeof CreateFinancingProposal>;
export const CreateFinancingProposal = z.object({
  quote_id: z.string().optional(),
  credit_analysis_id: z.string().optional(),
  modality: z.enum(["CDC", "LEASING", "EAAS"]),
  requested_amount: z.number().positive(),
  down_payment_amount: z.number().min(0).optional(),
  requested_term_months: z.number().positive(),
  amortization_system: z.enum(["PRICE", "SAC"]).optional(),
  notes: z.string().optional(),
});
