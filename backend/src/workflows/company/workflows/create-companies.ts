import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { CreateCompanyDTO } from "../../../modules/company/types/mutations";
import { createCompaniesStep } from "../steps";
import { CompanyDTO } from "../../../modules/company/types/common";

export const createCompaniesWorkflow = createWorkflow(
  "create-company",
  function (
    input: CreateCompanyDTO | CreateCompanyDTO[]
  ): WorkflowResponse<{ company: CompanyDTO | CompanyDTO[] }> {
    const company = createCompaniesStep(input);

    return new WorkflowResponse({ company });
  }
);
