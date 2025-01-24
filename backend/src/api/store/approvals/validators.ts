import {
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type StoreGetApprovalsType = z.infer<typeof StoreGetApprovals>;
export const StoreGetApprovals = createFindParams()
  .merge(
    z.object({
      filters: z
        .object({
          company: z.string().optional(),
          status: z.string().optional(),
          handled_by: z.string().optional(),
          created_by: z.string().optional(),
          created_at: createOperatorMap().optional(),
          updated_at: createOperatorMap().optional(),
        })
        .optional(),
    })
  )
  .strict();

export type StoreUpdateApprovalType = z.infer<typeof StoreUpdateApproval>;
export const StoreUpdateApproval = z.object({
  status: z.string(),
});
