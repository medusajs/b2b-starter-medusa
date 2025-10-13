import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetCustomerGroupIdParamsType = z.infer<typeof GetCustomerGroupIdParams>;
export const GetCustomerGroupIdParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
