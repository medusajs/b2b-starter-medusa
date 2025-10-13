import { z } from "zod";
import { createSelectParams } from "@medusajs/framework/utils";

export type GetThermalAnalysisParamsType = z.infer<typeof GetThermalAnalysisParams>;
export const GetThermalAnalysisParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
