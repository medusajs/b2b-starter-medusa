import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get[category]ParamsType = z.infer<typeof Get[category]Params>;
export const Get[category]Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
