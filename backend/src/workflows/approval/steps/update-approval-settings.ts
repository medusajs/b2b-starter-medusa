import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  IApprovalModuleService,
  ModuleUpdateApprovalSettings,
} from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";

export const updateApprovalSettingsStep = createStep(
  "update-approval-settings",
  async (input: ModuleUpdateApprovalSettings, { container }) => {
    console.log("input", input);
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const previousData = await approvalModule.retrieveApprovalSettings(
      input.id
    );

    const updatedApprovalSettings = await approvalModule.updateApprovalSettings(
      input
    );

    return new StepResponse(updatedApprovalSettings, previousData);
  },
  async (previousData: ModuleUpdateApprovalSettings, { container }) => {
    console.log("previousData", previousData);
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.updateApprovalSettings(previousData);
  }
);
