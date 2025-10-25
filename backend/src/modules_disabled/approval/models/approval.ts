import { model } from "@medusajs/framework/utils";
import { ApprovalStatusType, ApprovalType } from "../../../types/approval";

export const Approval = model.define("approval", {
  id: model
    .id({
      prefix: "appr",
    })
    .primaryKey(),
  cart_id: model.text(),
  type: model.enum(ApprovalType),
  status: model.enum(ApprovalStatusType),
  created_by: model.text(),
  handled_by: model.text().nullable(),

  // Audit trail metadata (PII redacted)
  rejection_reason: model.text().nullable(),
  approval_comment: model.text().nullable(),
  handled_at: model.dateTime().nullable(),
  client_ip_hash: model.text().nullable(), // SHA-256 hash for audit, not raw IP
  user_agent_hash: model.text().nullable(), // SHA-256 hash

  // Business context
  cart_total_snapshot: model.bigNumber().nullable(), // Immutable snapshot at approval request
  priority: model.number().default(0), // 0=normal, 1=high, 2=urgent
  escalated: model.boolean().default(false),
  escalated_at: model.dateTime().nullable(),
  escalated_from: model.text().nullable(), // Original approver who timed out

  // Idempotency
  idempotency_key: model.text().nullable(), // Prevent duplicate approval requests
});
