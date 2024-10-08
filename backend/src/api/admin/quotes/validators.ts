import {
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type AdminGetQuoteParamsType = z.infer<typeof AdminGetQuoteParams>;
export const AdminGetQuoteParams = createFindParams({
  limit: 15,
  offset: 0,
})
  .merge(
    z.object({
      q: z.string().optional(),
      id: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      draft_order_id: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      status: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      created_at: createOperatorMap().optional(),
      updated_at: createOperatorMap().optional(),
    })
  )
  .strict();

export type AdminSendQuoteType = z.infer<typeof AdminSendQuote>;
export const AdminSendQuote = z.object({}).strict();

export type AdminRejectQuoteType = z.infer<typeof AdminRejectQuote>;
export const AdminRejectQuote = z.object({}).strict();

export type AdminCreateQuoteMessageType = z.infer<
  typeof AdminCreateQuoteMessage
>;
export const AdminCreateQuoteMessage = z
  .object({
    text: z.string(),
    item_id: z.string().nullish(),
  })
  .strict();
