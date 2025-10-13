import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCompanyIdParamsType = z.infer<typeof GetCompanyIdParams>;
export const GetCompanyIdParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
