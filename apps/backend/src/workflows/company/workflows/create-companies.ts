import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleCreateCompany, QueryCompany } from "@starter/types";
import { createCompaniesStep } from "../steps";

export const createCompaniesWorkflow = createWorkflow(
  "create-company",
  function (
    input: ModuleCreateCompany
  ): WorkflowResponse<{ company: QueryCompany }> {
    const company = createCompaniesStep(input);

    return new WorkflowResponse({ company });
  }
);
