import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCredit-analysisParamsType = z.infer<typeof GetCredit-analysisParams>;
export const GetCredit-analysisParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
