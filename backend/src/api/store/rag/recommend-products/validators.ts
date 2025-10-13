import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetRecommend-productsParamsType = z.infer<typeof GetRecommend-productsParams>;
export const GetRecommend-productsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
