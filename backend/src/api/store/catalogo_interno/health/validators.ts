import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetHealthParamsType = z.infer<typeof GetHealthParams>;
export const GetHealthParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
