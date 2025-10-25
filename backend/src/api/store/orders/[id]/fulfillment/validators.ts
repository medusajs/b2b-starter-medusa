import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetFulfillmentParamsType = z.infer<typeof GetFulfillmentParams>;
export const GetFulfillmentParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
