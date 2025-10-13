import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetImport-catalogParamsType = z.infer<typeof GetImport-catalogParams>;
export const GetImport-catalogParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
