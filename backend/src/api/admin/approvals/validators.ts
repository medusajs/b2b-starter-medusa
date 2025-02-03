import {
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type AdminGetApprovalsType = z.infer<typeof AdminGetApprovals>;
export const AdminGetApprovals = createFindParams()
  .merge(
    z.object({
      status: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
    })
  )
  .strict();

export type AdminUpdateApprovalType = z.infer<typeof AdminUpdateApproval>;
export const AdminUpdateApproval = z.object({
  status: z.string(),
});
