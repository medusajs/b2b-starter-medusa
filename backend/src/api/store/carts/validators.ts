import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { ApprovalType } from "@starter/types/approval";
import { z } from "zod";

export type GetCartLineItemsBulkParamsType = z.infer<
  typeof GetCartLineItemsBulkParams
>;
export const GetCartLineItemsBulkParams = createSelectParams();

export type StoreAddLineItemsBulkType = z.infer<typeof StoreAddLineItemsBulk>;
export const StoreAddLineItemsBulk = z
  .object({
    line_items: z.array(
      z.object({
        variant_id: z.string(),
        quantity: z.number(),
      })
    ),
  })
  .strict();

/* Approval Validators */
export type StoreCreateApprovalType = z.infer<typeof StoreCreateApproval>;
export const StoreCreateApproval = z.object({
  type: z.nativeEnum(ApprovalType),
  created_by: z.string(),
});
