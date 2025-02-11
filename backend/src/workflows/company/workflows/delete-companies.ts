import { WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { ModuleDeleteCompany } from "../../../types";
import { deleteApprovalSettingsStep } from "../../approval/steps/delete-approval-settings";
import { deleteCompaniesStep } from "../steps";

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
