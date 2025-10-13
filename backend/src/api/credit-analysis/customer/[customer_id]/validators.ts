import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get[customer_id]ParamsType = z.infer<typeof Get[customer_id]Params>;
export const Get[customer_id]Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
