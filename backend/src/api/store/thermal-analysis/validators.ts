import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetThermal-analysisParamsType = z.infer<typeof GetThermal-analysisParams>;
export const GetThermal-analysisParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
