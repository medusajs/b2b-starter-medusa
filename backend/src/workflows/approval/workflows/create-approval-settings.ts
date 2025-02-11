import { transform } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import { COMPANY_MODULE } from "../../../modules/company";
import { ModuleCompany } from "../../../types";
import { createApprovalSettingsStep } from "../steps";

export const createApprovalSettingsWorkflow = createWorkflow(
  "create-approval-settings",
  function (input: ModuleCompany[]) {
    const approvalSettings = createApprovalSettingsStep(input);

    const linkData = transform(approvalSettings, (settings) =>
      settings.map((setting) => ({
        [COMPANY_MODULE]: {
          company_id: setting.company_id,
        },
        [APPROVAL_MODULE]: {
          approval_settings_id: setting.id,
        },
      }))
    );

    createRemoteLinkStep(linkData);

    return new WorkflowResponse(approvalSettings);
  }
);
