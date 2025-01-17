import {
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type StoreGetApprovalsType = z.infer<typeof StoreGetApprovals>;

export const StoreGetApprovals = createFindParams({
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
