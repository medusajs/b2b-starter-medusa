import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetInternal-catalogParamsType = z.infer<typeof GetInternal-catalogParams>;
export const GetInternal-catalogParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
