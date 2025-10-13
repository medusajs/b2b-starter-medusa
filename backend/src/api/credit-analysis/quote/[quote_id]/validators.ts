import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetQuoteIdParamsType = z.infer<typeof GetQuoteIdParams>;
export const GetQuoteIdParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
