import { z } from "zod";

export type StoreGetFreeShippingPricesParamsType = z.infer<
  typeof StoreGetFreeShippingPricesParams
>;
export const StoreGetFreeShippingPricesParams = z
  .object({
    limit: z.coerce.number().positive().default(20),
    offset: z.coerce.number().nonnegative().default(0),
    cart_id: z.string(),
  })
  .strict();
