import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../approval";
import { IApprovalModuleService } from "../../../../types/approval/service";

export interface CreateApprovalStepInput {
  financing_proposal_id: string;
  customer_id: string;
  requested_amount: number;
  type: "financing_proposal";
}

export const createApprovalStep = createStep(
  "create-approval-step",
  async (data: CreateApprovalStepInput, { container }) => {
    const approvalModuleService = container.resolve(APPROVAL_MODULE) as IApprovalModuleService;

    // Create approval request for financing proposal
    const approval = await approvalModuleService.createApproval({
      cart_id: data.financing_proposal_id, // Using financing_proposal_id as cart_id
      type: "admin" as any, // ApprovalType.ADMIN
      status: "pending",
      created_by: data.customer_id,
      cart_total_snapshot: data.requested_amount,
      priority: data.requested_amount > 100000 ? 1 : 0, // High priority for large amounts
    });

    return new StepResponse(approval, approval.id);
  },
  async (approvalId: string, { container }) => {
    // Compensation: cancel approval if workflow fails
    const approvalModuleService = container.resolve(APPROVAL_MODULE) as IApprovalModuleService;
    await approvalModuleService.updateApproval({
      id: approvalId,
      status: "cancelled" as any,
      rejection_reason: "Workflow compensation",
      handled_at: new Date().toISOString(),
    });
  }
);