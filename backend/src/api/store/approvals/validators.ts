import { z } from "zod";
import { ApprovalType } from "../../../types/approval";

export type StoreGetApprovalsType = z.infer<typeof StoreGetApprovals>;
export const StoreGetApprovals = z
  .object({
    limit: z.coerce.number().positive().default(15),
    offset: z.coerce.number().nonnegative().default(0),
    status: z.union([z.string(), z.array(z.string())]).optional(),
    type: z
      .union([
        z.nativeEnum(ApprovalType),
        z.array(z.nativeEnum(ApprovalType)),
      ])
      .optional(),
  })
  .strict();

export type StoreUpdateApprovalType = z.infer<typeof StoreUpdateApproval>;
export const StoreUpdateApproval = z.object({
  status: z.string(),
});
