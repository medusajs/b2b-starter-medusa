import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCreditAnalysisParamsType = z.infer<typeof GetCreditAnalysisParams>;
export const GetCreditAnalysisParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
