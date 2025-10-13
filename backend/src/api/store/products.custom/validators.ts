import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetProductsCustomParamsType = z.infer<typeof GetProductsCustomParams>;
export const GetProductsCustomParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
