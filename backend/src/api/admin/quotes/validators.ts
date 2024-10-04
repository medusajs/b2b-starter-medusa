import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type AdminGetQuoteParamsType = z.infer<typeof AdminGetQuoteParams>;
export const AdminGetQuoteParams = createSelectParams();

export type AdminSendQuoteType = z.infer<typeof AdminSendQuote>;
export const AdminSendQuote = z.object({}).strict();

export type AdminRejectQuoteType = z.infer<typeof AdminRejectQuote>;
export const AdminRejectQuote = z.object({}).strict();

export type AdminCreateQuoteCommentType = z.infer<
  typeof AdminCreateQuoteComment
>;
export const AdminCreateQuoteComment = z
  .object({
    text: z.string(),
    item_id: z.string().nullish(),
  })
  .strict();
