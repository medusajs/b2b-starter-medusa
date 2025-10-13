import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import {
  ApprovalStatusType,
  ApprovalType,
  IApprovalModuleService,
  ModuleCreateApproval,
} from "../../../types";

export const createApprovalStep = createStep(
  "create-approval",
  async (
    input:
      | Omit<ModuleCreateApproval, "type">
      | Omit<ModuleCreateApproval, "type">[],
    { container }
  ) => {
    const query = container.resolve("query");

    const approvalData = Array.isArray(input) ? input : [input];

    const {
      data: [cart],
    } = await query.graph(
      {
        entity: "cart",
        fields: [
          "id",
          "total",
          "approvals.*",
          "approval_status.*",
          "company.id",
          "company.approval_settings.*",
        ],
        filters: {
          id: approvalData[0].cart_id,
        },
      },
      {
        throwIfKeyNotFound: true,
      }
    );

    if (
      ((cart as any).approval_status?.status as unknown as ApprovalStatusType) ===
      ApprovalStatusType.PENDING
    ) {
      throw new Error("Cart already has a pending approval");
    }

    if (
      ((cart as any).approval_status?.status as unknown as ApprovalStatusType) ===
      ApprovalStatusType.APPROVED
    ) {
      throw new Error("Cart is already approved");
    }

    const settings = (cart as any)?.company?.approval_settings || {};
    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    // Check for auto-approval below threshold
    if (
      settings.auto_approve_below_threshold &&
      settings.auto_approve_threshold &&
      (cart as any).total < settings.auto_approve_threshold
    ) {
      // Auto-approve - no approval objects created, just update status
      return new StepResponse({ autoApproved: true, approvals: [] }, []);
    }

    const {
      requires_admin_approval,
      requires_sales_manager_approval,
      admin_approval_threshold,
      sales_manager_approval_threshold,
      requires_multiple_approvers,
      min_approvers_count,
    } = settings;

    const cartTotal = (cart as any).total;
    const approvalsToCreate = [] as ModuleCreateApproval[];

    // Evaluate threshold-based approvals
    if (requires_admin_approval) {
      const needsAdminApproval =
        !admin_approval_threshold || cartTotal >= admin_approval_threshold;

      if (needsAdminApproval) {
        const count = requires_multiple_approvers ? min_approvers_count : 1;
        for (let i = 0; i < count; i++) {
          const idempotencyKey = approvalModuleService.generateIdempotencyKey(
            approvalData[0].cart_id,
            `${ApprovalType.ADMIN}-${i}`
          );

          // Check if approval already exists (idempotency)
          const existing = await approvalModuleService.listApprovals({
            idempotency_key: idempotencyKey,
          });

          if (existing.length === 0) {
            approvalsToCreate.push({
              ...approvalData[0],
              type: ApprovalType.ADMIN,
              cart_total_snapshot: cartTotal,
              idempotency_key: idempotencyKey,
            });
          }
        }
      }
    }

    if (requires_sales_manager_approval) {
      const needsSalesApproval =
        !sales_manager_approval_threshold ||
        cartTotal >= sales_manager_approval_threshold;

      if (needsSalesApproval) {
        const count = requires_multiple_approvers ? min_approvers_count : 1;
        for (let i = 0; i < count; i++) {
          const idempotencyKey = approvalModuleService.generateIdempotencyKey(
            approvalData[0].cart_id,
            `${ApprovalType.SALES_MANAGER}-${i}`
          );

          const existing = await approvalModuleService.listApprovals({
            idempotency_key: idempotencyKey,
          });

          if (existing.length === 0) {
            approvalsToCreate.push({
              ...approvalData[0],
              type: ApprovalType.SALES_MANAGER,
              cart_total_snapshot: cartTotal,
              idempotency_key: idempotencyKey,
            });
          }
        }
      }
    }

    if (approvalsToCreate.length === 0) {
      // Either no approvals needed or all already exist (idempotent)
      const existingApprovals = await approvalModuleService.listApprovals({
        cart_id: approvalData[0].cart_id,
      });

      if (existingApprovals.length === 0) {
        throw new Error("No enabled approval types found");
      }

      // Return existing approvals (idempotent behavior)
      return new StepResponse(
        { autoApproved: false, approvals: existingApprovals },
        []
      );
    }

    const approvals = await approvalModuleService.createApprovals(
      approvalsToCreate
    );

    // Record creation in audit trail
    for (const approval of approvals) {
      await approvalModuleService.recordApprovalHistory({
        approval_id: approval.id,
        previous_status: null,
        new_status: ApprovalStatusType.PENDING,
        actor_id: approvalData[0].created_by,
        actor_role: "requester",
        is_system_action: false,
        cart_total_at_action: cartTotal,
        metadata: {
          cart_id: approvalData[0].cart_id,
          approval_type: approval.type,
        },
      });
    }

    return new StepResponse(
      { autoApproved: false, approvals },
      approvals.map((approval) => approval.id)
    );
  },
  async (approvalIds: string[], { container }) => {
    if (!approvalIds || approvalIds.length === 0) return;

    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    // Record deletion in audit trail before actual deletion
    for (const id of approvalIds) {
      try {
        const approval = await approvalModuleService.retrieveApproval(id);
        await approvalModuleService.recordApprovalHistory({
          approval_id: id,
          previous_status: approval.status as ApprovalStatusType,
          new_status: ApprovalStatusType.PENDING, // Rolled back to pending
          actor_id: "system",
          actor_role: "system",
          is_system_action: true,
          reason: "Workflow compensation - approval rolled back",
        });
      } catch (error) {
        // Approval might already be deleted - safe to ignore
      }
    }

    await approvalModuleService.deleteApprovals(approvalIds);
  }
);
