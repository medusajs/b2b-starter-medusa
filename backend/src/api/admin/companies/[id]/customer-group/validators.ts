import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCustomerGroupParamsType = z.infer<typeof GetCustomerGroupParams>;
export const GetCustomerGroupParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
