import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get[company_id]ParamsType = z.infer<typeof Get[company_id]Params>;
export const Get[company_id]Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
