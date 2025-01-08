import { createWorkflow } from "@medusajs/workflows-sdk";
import { ModuleDeleteCompany } from "@starter/types";
import { deleteCompaniesStep } from "../steps";
import { WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { deleteApprovalSettingsStep } from "src/workflows/approval/steps/delete-approval-settings";

export const deleteCompaniesWorkflow = createWorkflow(
  "delete-companies",
  function (input: ModuleDeleteCompany) {
    deleteCompaniesStep([input.id]);

    deleteApprovalSettingsStep({
      companyIds: [input.id],
    });

    return new WorkflowResponse(undefined);
  }
);
