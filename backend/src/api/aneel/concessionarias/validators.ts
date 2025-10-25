import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetConcessionariasParamsType = z.infer<typeof GetConcessionariasParams>;
export const GetConcessionariasParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
