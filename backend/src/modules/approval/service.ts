import { MedusaService } from "@medusajs/framework/utils";
import { ApprovalStatusType } from "../../types";
import {
  Approval,
  ApprovalSettings,
  ApprovalStatus,
  ApprovalRule,
  ApprovalHistory
} from "./models";
import crypto from "crypto";

class ApprovalModuleService extends MedusaService({
  Approval,
  ApprovalSettings,
  ApprovalStatus,
  ApprovalRule,
  ApprovalHistory,
}) {
  /**
   * Check if cart has pending approvals (idempotent)
   */
  async hasPendingApprovals(cartId: string): Promise<boolean> {
    const [_, count] = await this.listAndCountApprovals_({
      cart_id: cartId,
      status: ApprovalStatusType.PENDING,
    });

    return count > 0;
  }

  /**
   * Evaluate approval rules for a cart (idempotent)
   * Returns required approval types based on active rules
   */
  async evaluateApprovalRules(
    companyId: string,
    cartContext: {
      total: number;
      itemCount: number;
      dayOfWeek?: string;
      timeOfDay?: string;
    }
  ): Promise<{ type: string; count: number }[]> {
    const rules = await this.listApprovalRules_(
      {
        company_id: companyId,
        is_active: true,
      },
      {
        order: { priority: "DESC" },
      }
    );

    const requiredApprovals: { type: string; count: number }[] = [];

    for (const rule of rules) {
      // Check if rule is within effective date range
      const now = new Date();
      if (rule.effective_from && new Date(rule.effective_from) > now) continue;
      if (rule.effective_until && new Date(rule.effective_until) < now) continue;

      // Evaluate conditions (simplified - production should use JSONSchema validator)
      const conditions = rule.conditions as any;
      let matches = true;

      if (conditions.cart_total_gte && cartContext.total < conditions.cart_total_gte) {
        matches = false;
      }
      if (conditions.cart_total_lte && cartContext.total > conditions.cart_total_lte) {
        matches = false;
      }
      if (conditions.item_count_gte && cartContext.itemCount < conditions.item_count_gte) {
        matches = false;
      }
      if (conditions.day_of_week && cartContext.dayOfWeek) {
        if (!conditions.day_of_week.includes(cartContext.dayOfWeek)) {
          matches = false;
        }
      }

      if (matches) {
        requiredApprovals.push({
          type: rule.required_approval_type,
          count: rule.required_approvers_count,
        });
      }
    }

    return requiredApprovals;
  }

  /**
   * Record approval state change in immutable history (audit trail)
   */
  async recordApprovalHistory(data: {
    approval_id: string;
    previous_status: ApprovalStatusType | null;
    new_status: ApprovalStatusType;
    actor_id: string;
    actor_role: string;
    actor_ip?: string; // Will be hashed
    actor_user_agent?: string; // Will be hashed
    reason?: string;
    comment?: string;
    cart_total_at_action?: number;
    is_escalation?: boolean;
    is_system_action?: boolean;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const historyEntry = {
      approval_id: data.approval_id,
      previous_status: data.previous_status,
      new_status: data.new_status,
      actor_id: data.actor_id,
      actor_role: data.actor_role,
      actor_ip_hash: data.actor_ip
        ? crypto.createHash("sha256").update(data.actor_ip).digest("hex")
        : null,
      actor_user_agent_hash: data.actor_user_agent
        ? crypto.createHash("sha256").update(data.actor_user_agent).digest("hex")
        : null,
      reason: data.reason,
      comment: data.comment,
      cart_total_at_action: data.cart_total_at_action,
      action_timestamp: new Date(),
      is_escalation: data.is_escalation || false,
      is_system_action: data.is_system_action || false,
      metadata: data.metadata,
    };

    await this.createApprovalHistories_([historyEntry]);
  }

  /**
   * Check if approval should be auto-escalated (idempotent)
   */
  async checkEscalation(approvalId: string): Promise<boolean> {
    const approval = await this.retrieveApproval_(approvalId);

    if (approval.escalated || approval.status !== ApprovalStatusType.PENDING) {
      return false;
    }

    // Get company settings
    const settings = await this.listApprovalSettingses_({
      // Need to get company_id from cart - would require graph query in real implementation
    });

    if (!settings[0]?.escalation_enabled) {
      return false;
    }

    const timeoutHours = settings[0].escalation_timeout_hours || 24;
    const createdAt = new Date(approval.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceCreation >= timeoutHours;
  }

  /**
   * Generate idempotency key for approval request
   */
  generateIdempotencyKey(cartId: string, approvalType: string): string {
    return crypto
      .createHash("sha256")
      .update(`${cartId}:${approvalType}`)
      .digest("hex");
  }

  // Missing methods for financing integration
  async createApproval(data: {
    cart_id: string;
    type: string;
    status: string;
    created_by: string;
    cart_total_snapshot?: number;
    priority?: number;
  }): Promise<any> {
    const idempotencyKey = this.generateIdempotencyKey(data.cart_id, data.type);

    // Check for existing approval
    const existing = await this.listApprovals_({
      idempotency_key: idempotencyKey,
    });

    if (existing.length > 0) {
      return existing[0]; // Idempotent
    }

    const [created] = await this.createApprovals_([
      {
        ...data,
        idempotency_key: idempotencyKey,
      }
    ]);
    return created;
  }

  async updateApproval(id: string, data: {
    status?: string;
    rejection_reason?: string;
    handled_by?: string;
    handled_at?: Date;
  }): Promise<any> {
    const [updated] = await this.updateApprovals_([
      {
        id,
        ...data,
        handled_at: data.handled_at || new Date(),
      }
    ]);
    return updated;
  }
}

export default ApprovalModuleService;
