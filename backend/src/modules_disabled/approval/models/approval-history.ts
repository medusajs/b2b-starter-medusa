import { model } from "@medusajs/framework/utils";
import { ApprovalStatusType } from "../../../types/approval";

/**
 * ApprovalHistory - Immutable audit trail
 * 
 * Every state change in an approval creates a history entry.
 * This ensures:
 * - Complete audit trail for compliance
 * - Non-repudiation (cannot alter past events)
 * - Forensic analysis of approval flows
 * - PII is redacted/hashed before storage
 */
export const ApprovalHistory = model.define("approval_history", {
    id: model
        .id({
            prefix: "apprhist",
        })
        .primaryKey(),

    approval_id: model.text(), // Foreign key to Approval

    // State transition
    previous_status: model.enum(ApprovalStatusType).nullable(),
    new_status: model.enum(ApprovalStatusType),

    // Actor information (PII redacted)
    actor_id: model.text(), // Customer/employee ID
    actor_role: model.text(), // Role at time of action
    actor_ip_hash: model.text().nullable(), // SHA-256
    actor_user_agent_hash: model.text().nullable(), // SHA-256

    // Business context (immutable snapshot)
    reason: model.text().nullable(),
    comment: model.text().nullable(),
    cart_total_at_action: model.bigNumber().nullable(),

    // Metadata
    action_timestamp: model.dateTime(), // Explicit timestamp (not just created_at)
    is_escalation: model.boolean().default(false),
    is_system_action: model.boolean().default(false), // Auto-approval/rejection

    // Forensics
    metadata: model.json().nullable(), // Additional context, already sanitized
});
