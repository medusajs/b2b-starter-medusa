import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import {
  ApprovalStatusType,
  IApprovalModuleService,
  ModuleApproval,
  ModuleUpdateApproval,
} from "../../../types";

export const updateApprovalStep = createStep(
  "update-approval",
  async (
    input: ModuleUpdateApproval & {
      actor_role?: string;
      actor_ip?: string;
      actor_user_agent?: string;
    },
    { container }
  ): Promise<
    StepResponse<
      ModuleApproval,
      ModuleUpdateApproval & { related_approvals?: ModuleUpdateApproval[] }
    >
  > => {
    const query = container.resolve("query");
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const {
      data: [approval],
    } = await query.graph({
      entity: "approval",
      fields: ["*", "cart.total"],
      filters: {
        id: input.id,
      },
    });

    // Idempotency check - if already in target status, return without changes
    if (
      input.status &&
      approval.status === input.status
    ) {
      return new StepResponse(approval as ModuleApproval, {
        id: approval.id,
        status: approval.status,
        handled_by: approval.handled_by,
        idempotent: true,
      } as any);
    }

    const previousData = {
      id: approval.id,
      status: approval.status as unknown as ApprovalStatusType,
      handled_by: approval.handled_by,
      rejection_reason: approval.rejection_reason,
      approval_comment: approval.approval_comment,
      handled_at: approval.handled_at,
    } as ModuleUpdateApproval;

    const relatedUpdates: ModuleUpdateApproval[] = [];

    // Cascade rejection to related approvals
    if (input.status === ApprovalStatusType.REJECTED) {
      const { data: approvalsToReject } = await query.graph({
        entity: "approval",
        fields: ["*"],
        filters: {
          cart_id: approval.cart_id,
          id: {
            $ne: approval.id,
          },
          status: ApprovalStatusType.PENDING,
        },
      });

      for (const relatedApproval of approvalsToReject) {
        relatedUpdates.push({
          id: relatedApproval.id,
          status: relatedApproval.status,
          handled_by: relatedApproval.handled_by,
        });
      }

      const updateData = approvalsToReject.map((relatedApproval) => ({
        id: relatedApproval.id,
        status: ApprovalStatusType.REJECTED,
        handled_by: input.handled_by,
        rejection_reason: `Cascaded rejection from approval ${input.id}`,
        handled_at: new Date().toISOString(),
      }));

      await approvalModule.updateApprovals(updateData);

      // Record audit trail for cascaded rejections
      for (const relatedApproval of approvalsToReject) {
        await approvalModule.recordApprovalHistory({
          approval_id: relatedApproval.id,
          previous_status: relatedApproval.status as ApprovalStatusType,
          new_status: ApprovalStatusType.REJECTED,
          actor_id: input.handled_by || "system",
          actor_role: input.actor_role || "system",
          actor_ip: input.actor_ip,
          actor_user_agent: input.actor_user_agent,
          reason: `Cascaded rejection from approval ${input.id}`,
          cart_total_at_action: (approval as any).cart?.total,
          is_system_action: true,
        });
      }
    }

    // Update primary approval with timestamp
    const updatePayload = {
      ...input,
      handled_at: input.handled_at || new Date().toISOString(),
    };

    const [updatedApproval] = await approvalModule.updateApprovals([
      updatePayload,
    ]);

    // Record audit trail for primary approval
    await approvalModule.recordApprovalHistory({
      approval_id: input.id,
      previous_status: approval.status as ApprovalStatusType,
      new_status: input.status || (approval.status as ApprovalStatusType),
      actor_id: input.handled_by || "system",
      actor_role: input.actor_role || "unknown",
      actor_ip: input.actor_ip,
      actor_user_agent: input.actor_user_agent,
      reason: input.rejection_reason,
      comment: input.approval_comment,
      cart_total_at_action: (approval as any).cart?.total,
      is_escalation: input.escalated || false,
      is_system_action: false,
    });

    return new StepResponse(updatedApproval, {
      ...previousData,
      related_approvals: relatedUpdates,
    });
  },
  async (
    previousData: ModuleUpdateApproval & {
      related_approvals?: ModuleUpdateApproval[];
      idempotent?: boolean;
    },
    { container }
  ) => {
    if ((previousData as any).idempotent) {
      // Was idempotent, no rollback needed
      return;
    }

    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    // Rollback primary approval
    await approvalModule.updateApprovals([previousData]);

    // Rollback related approvals
    if (previousData.related_approvals && previousData.related_approvals.length > 0) {
      await approvalModule.updateApprovals(previousData.related_approvals);
    }

    // Record rollback in audit trail
    await approvalModule.recordApprovalHistory({
      approval_id: previousData.id,
      previous_status: previousData.status || ApprovalStatusType.PENDING,
      new_status: previousData.status || ApprovalStatusType.PENDING,
      actor_id: "system",
      actor_role: "system",
      is_system_action: true,
      reason: "Workflow compensation - approval state rolled back",
    });
  }
);
