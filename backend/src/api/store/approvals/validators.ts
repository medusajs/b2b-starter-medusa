import {
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";
import { ApprovalType } from "../../../types/approval";

export type StoreGetApprovalsType = z.infer<typeof StoreGetApprovals>;
export const StoreGetApprovals = createFindParams()
  .merge(
    z.object({
      status: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      type: z
        .union([
          z.nativeEnum(ApprovalType),
          z.array(z.nativeEnum(ApprovalType)),
          createOperatorMap(),
        ])
        .optional(),
    })
  )
  .strict();

export type StoreUpdateApprovalType = z.infer<typeof StoreUpdateApproval>;
export const StoreUpdateApproval = z.object({
  status: z.string(),
});
