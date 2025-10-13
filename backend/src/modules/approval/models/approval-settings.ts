import { model } from "@medusajs/framework/utils";

export const ApprovalSettings = model.define("approval_settings", {
  id: model
    .id({
      prefix: "apprset",
    })
    .primaryKey(),
  company_id: model.text(),
  requires_admin_approval: model.boolean().default(false),
  requires_sales_manager_approval: model.boolean().default(false),

  // Monetary thresholds for approval requirements
  admin_approval_threshold: model.bigNumber().nullable(),
  sales_manager_approval_threshold: model.bigNumber().nullable(),

  // Multiple approvers configuration
  requires_multiple_approvers: model.boolean().default(false),
  min_approvers_count: model.number().default(1),

  // Escalation rules
  escalation_enabled: model.boolean().default(false),
  escalation_timeout_hours: model.number().default(24),
  escalation_role: model.text().nullable(), // Role to escalate to after timeout

  // Priority handling
  priority_threshold: model.bigNumber().nullable(), // High-value orders get priority
  auto_approve_below_threshold: model.boolean().default(false),
  auto_approve_threshold: model.bigNumber().nullable(),
});
