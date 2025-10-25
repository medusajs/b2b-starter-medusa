import { z } from "zod";

export type GetThermalAnalysisParamsType = z.infer<typeof GetThermalAnalysisParams>;
export const GetThermalAnalysisParams = z.object({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
