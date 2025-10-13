import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetRecommendProductsParamsType = z.infer<typeof GetRecommendProductsParams>;
export const GetRecommendProductsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
