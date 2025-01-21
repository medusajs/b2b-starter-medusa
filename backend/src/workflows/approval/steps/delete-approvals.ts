import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { IApprovalModuleService } from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";

export const deleteApprovalsStep = createStep(
  "delete-approvals",
  async (input: string[], { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.softDeleteApprovals(input);

    return new StepResponse(undefined, input);
  },
  async (approvalIds: string[], { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.restoreApprovals(approvalIds);
  }
);
