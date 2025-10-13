import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../../modules_disabled/approval";
import { IApprovalModuleService } from "../../../../types/approval/service";

export interface CreateApprovalStepInput {
  financing_proposal_id: string;
  customer_id: string;
  requested_amount: number;
  type: "financing_proposal";
}

/**
 * Create approval step - gracefully handles disabled approval module
 * Returns null if approval module is not available (non-blocking)
 */
export const createApprovalStep = createStep(
  "create-approval-step",
  async (data: CreateApprovalStepInput, { container }) => {
    // Check if approval module is registered
    let approvalModuleService: IApprovalModuleService | null = null;
    try {
      approvalModuleService = container.resolve(APPROVAL_MODULE) as IApprovalModuleService;
    } catch (error) {
      console.info("[CreateApprovalStep] Approval module not available - skipping approval creation");
      return new StepResponse(null, null); // Non-blocking: return null
    }

    if (!approvalModuleService) {
      console.info("[CreateApprovalStep] Approval service not resolved - skipping");
      return new StepResponse(null, null);
    }

    // Create approval request for financing proposal
    try {
      const approval = await approvalModuleService.createApproval({
        cart_id: data.financing_proposal_id, // Using financing_proposal_id as cart_id
        type: "admin" as any, // ApprovalType.ADMIN
        status: "pending",
        created_by: data.customer_id,
        cart_total_snapshot: data.requested_amount,
        priority: data.requested_amount > 100000 ? 1 : 0, // High priority for large amounts
      });

      return new StepResponse(approval, approval.id);
    } catch (error) {
      console.error("[CreateApprovalStep] Failed to create approval:", error);
      throw error; // Blocking: approval creation failed unexpectedly
    }
  },
  async (approvalId: string | null, { container }) => {
    // Compensation: cancel approval if workflow fails
    // Skip if approval was not created (module disabled)
    if (!approvalId) {
      console.info("[CreateApprovalStep] No approval to compensate - approval module disabled");
      return;
    }

    try {
      const approvalModuleService = container.resolve(APPROVAL_MODULE) as IApprovalModuleService;
      await approvalModuleService.updateApproval({
        id: approvalId,
        status: "cancelled" as any,
        rejection_reason: "Workflow compensation",
        handled_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("[CreateApprovalStep] Failed to compensate approval (non-critical):", error);
      // Non-blocking in compensation phase
    }
  }
);