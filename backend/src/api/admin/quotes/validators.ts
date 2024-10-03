import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type AdminGetQuoteParamsType = z.infer<typeof AdminGetQuoteParams>;
export const AdminGetQuoteParams = createSelectParams();

export type AdminSendQuoteType = z.infer<typeof AdminSendQuote>;
export const AdminSendQuote = z.object({}).strict();
