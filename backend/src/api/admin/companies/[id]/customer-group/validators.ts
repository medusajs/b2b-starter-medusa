import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCustomer-groupParamsType = z.infer<typeof GetCustomer-groupParams>;
export const GetCustomer-groupParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
