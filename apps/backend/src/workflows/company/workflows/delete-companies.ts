import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { DeleteCompanyDTO } from "../../../modules/company/types/mutations";
import { deleteCompaniesStep } from "../steps";

export const deleteCompaniesWorkflow = createWorkflow(
  "delete-companies",
  function (input: DeleteCompanyDTO): WorkflowResponse<string> {
    deleteCompaniesStep(input.id);

    return new WorkflowResponse(`Company deleted`);
  }
);
