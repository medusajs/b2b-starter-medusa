import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get[customerGroupId]ParamsType = z.infer<typeof Get[customerGroupId]Params>;
export const Get[customerGroupId]Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
