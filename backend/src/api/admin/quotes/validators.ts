import { z } from "zod";

export type AdminGetQuoteParamsType = z.infer<typeof AdminGetQuoteParams>;
export const AdminGetQuoteParams = z
  .object({
    limit: z.coerce.number().positive().default(15),
    offset: z.coerce.number().nonnegative().default(0),
    q: z.string().optional(),
    id: z.union([z.string(), z.array(z.string())]).optional(),
    draft_order_id: z.union([z.string(), z.array(z.string())]).optional(),
    status: z.union([z.string(), z.array(z.string())]).optional(),
    created_at: z.object({
      $gt: z.string().optional(),
      $lt: z.string().optional(),
      $gte: z.string().optional(),
      $lte: z.string().optional(),
    }).optional(),
    updated_at: z.object({
      $gt: z.string().optional(),
      $lt: z.string().optional(),
      $gte: z.string().optional(),
      $lte: z.string().optional(),
    }).optional(),
  })
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
