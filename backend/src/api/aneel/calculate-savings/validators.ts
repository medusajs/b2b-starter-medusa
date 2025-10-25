import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCalculateSavingsParamsType = z.infer<typeof GetCalculateSavingsParams>;
export const GetCalculateSavingsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
