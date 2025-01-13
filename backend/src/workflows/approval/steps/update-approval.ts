import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { IApprovalModuleService, ModuleUpdateApproval } from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";

export const updateApprovalStep = createStep(
  "update-approval",
  async (input: ModuleUpdateApproval, { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const previousData = await approvalModule.retrieveApproval(input.id);

    const updatedApproval = await approvalModule.updateApproval(input);

    return new StepResponse(updatedApproval, previousData);
  },
  async (previousData: ModuleUpdateApproval, { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.updateApproval(previousData);
  }
);
