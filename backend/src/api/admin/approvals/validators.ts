import { z } from "zod";

export type AdminGetApprovalsType = z.infer<typeof AdminGetApprovals>;
export const AdminGetApprovals = z
  .object({
    limit: z.coerce.number().positive().default(15),
    offset: z.coerce.number().nonnegative().default(0),
    status: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .strict();

export type AdminUpdateApprovalType = z.infer<typeof AdminUpdateApproval>;
export const AdminUpdateApproval = z.object({
  status: z.string(),
});
