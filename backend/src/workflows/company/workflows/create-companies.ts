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
import { emitEventsStep } from "../../common/steps";

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

    // Emit company.created events for each company after all setup is complete
    const eventData = transform(companies, (companies) =>
      companies.map((company) => ({
        name: "company.created",
        data: { id: company.id, name: company.name }
      }))
    );

    emitEventsStep(eventData);

    return new WorkflowResponse(companies);
  }
);
