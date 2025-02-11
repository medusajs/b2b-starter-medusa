import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import {
  IApprovalModuleService,
  ModuleUpdateApprovalSettings,
} from "../../../types";

export const updateApprovalSettingsStep = createStep(
  "update-approval-settings",
  async (input: ModuleUpdateApprovalSettings, { container }) => {
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
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.updateApprovalSettings(previousData);
  }
);
