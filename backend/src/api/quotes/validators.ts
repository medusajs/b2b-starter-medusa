import { z } from "zod";

export type GetQuoteParamsType = z.infer<typeof GetQuoteParams>;
export const GetQuoteParams = z
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

export type CreateQuoteType = z.infer<typeof CreateQuote>;
export const CreateQuote = z
    .object({
        cart_id: z.string(),
    })
    .strict();