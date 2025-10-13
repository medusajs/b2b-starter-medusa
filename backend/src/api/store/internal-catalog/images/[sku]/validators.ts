import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get[sku]ParamsType = z.infer<typeof Get[sku]Params>;
export const Get[sku]Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
