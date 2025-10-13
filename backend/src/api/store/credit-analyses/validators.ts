import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCredit-analysesParamsType = z.infer<typeof GetCredit-analysesParams>;
export const GetCredit-analysesParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
