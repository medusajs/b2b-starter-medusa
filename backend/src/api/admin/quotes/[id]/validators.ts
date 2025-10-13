import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get[id]ParamsType = z.infer<typeof Get[id]Params>;
export const Get[id]Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
