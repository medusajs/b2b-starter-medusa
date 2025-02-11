import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import { COMPANY_MODULE } from "../../../modules/company";
import { ModuleCreateCompany } from "../../../types";
import { createApprovalSettingsStep } from "../../../workflows/approval/steps/create-approval-settings";
import { createCompaniesStep } from "../steps";

export const createCompaniesWorkflow = createWorkflow(
  "create-companies",
  function (input: ModuleCreateCompany[]) {
    const companies = createCompaniesStep(input);

    const approvalSettings = createApprovalSettingsStep(companies);

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

    return new WorkflowResponse(companies);
  }
);
