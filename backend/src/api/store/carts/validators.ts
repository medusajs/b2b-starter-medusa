import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export const GetCartLineItemsBulkParams = createSelectParams();
export type GetCartLineItemsBulkParamsType = z.infer<
  typeof GetCartLineItemsBulkParams
>;

export type StoreAddLineItemsBulkType = z.infer<typeof StoreAddLineItemsBulk>;
export const StoreAddLineItemsBulk = z
  .object({
    line_items: z.array(
      z.object({
        variant_id: z.string(),
        quantity: z.number(),
      }).transform((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      }))
    ),
  })
  .strict();
