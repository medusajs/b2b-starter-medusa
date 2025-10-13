import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCalculate-savingsParamsType = z.infer<typeof GetCalculate-savingsParams>;
export const GetCalculate-savingsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
