import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { UpdateCompanyDTO } from "../../../modules/company/types/mutations";
import { updateCompaniesStep } from "../steps";
import { CompanyDTO } from "../../../modules/company/types/common";

export const updateCompaniesWorkflow = createWorkflow(
  "update-companies",
  function (
    input: UpdateCompanyDTO | UpdateCompanyDTO[]
  ): WorkflowResponse<{ company: CompanyDTO | CompanyDTO[] }> {
    const company = updateCompaniesStep(input);

    return new WorkflowResponse({ company });
  }
);
