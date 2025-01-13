import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { IApprovalModuleService, ModuleCreateApproval } from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";

export const createApprovalStep = createStep(
  "create-approval",
  async (
    input: ModuleCreateApproval | ModuleCreateApproval[],
    { container }
  ) => {
    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const approvals = await approvalModuleService.createApprovals(
      Array.isArray(input) ? input : [input]
    );

    return new StepResponse(
      approvals,
      approvals.map((approval) => approval.id)
    );
  },
  async (approvalIds: string[], { container }) => {
    if (!approvalIds) {
      return;
    }

    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModuleService.deleteApprovals(approvalIds);
  }
);
