import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type StoreGetFreeShippingPricesParamsType = z.infer<
  typeof StoreGetFreeShippingPricesParams
>;
export const StoreGetFreeShippingPricesParams = createFindParams({
  limit: 20,
  offset: 0,
}).merge(
  z
    .object({
      cart_id: z.string(),
    })
    .strict()
);
