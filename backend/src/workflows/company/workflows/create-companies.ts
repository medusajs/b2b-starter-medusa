import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleCreateCompany } from "@starter/types";
import { createCompaniesStep } from "../steps";

export const createCompaniesWorkflow = createWorkflow(
  "create-company",
  function (input: ModuleCreateCompany) {
    return new WorkflowResponse(createCompaniesStep(input));
  }
);
