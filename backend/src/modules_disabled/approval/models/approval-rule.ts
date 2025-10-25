import { model } from "@medusajs/framework/utils";
import { ApprovalType } from "../../../types/approval";

/**
 * ApprovalRule - Granular approval policies
 * 
 * Allows defining complex approval logic based on:
 * - Cart characteristics (total, item count, specific products)
 * - Customer attributes (role, company, region)
 * - Temporal conditions (time of day, day of week)
 * - Custom business rules
 * 
 * Example: "Orders over $10k on weekends require 2 admin approvals"
 */
export const ApprovalRule = model.define("approval_rule", {
    id: model
        .id({
            prefix: "apprrule",
        })
        .primaryKey(),

    company_id: model.text(),
    rule_name: model.text(),
    description: model.text().nullable(),

    // Rule conditions (JSON schema validator)
    conditions: model.json(), // { cart_total_gte: 10000, day_of_week: ["SAT", "SUN"] }

    // Required approval type and count
    required_approval_type: model.enum(ApprovalType),
    required_approvers_count: model.number().default(1),

    // Priority (higher number = evaluated first)
    priority: model.number().default(0),

    // Active state
    is_active: model.boolean().default(true),

    // Effective date range
    effective_from: model.dateTime().nullable(),
    effective_until: model.dateTime().nullable(),
});
