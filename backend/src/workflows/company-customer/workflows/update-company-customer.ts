import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { CompanyCustomerDTO } from "src/modules/company/types/common";
import { UpdateCompanyCustomerDTO } from "src/modules/company/types/mutations";
import { updateCompanyCustomersStep } from "../steps";

export const updateCompanyCustomersWorkflow = createWorkflow(
  "update-company-customers",
  (
    input: WorkflowData<UpdateCompanyCustomerDTO | UpdateCompanyCustomerDTO[]>
  ): WorkflowResponse<CompanyCustomerDTO | CompanyCustomerDTO[]> => {
    const updatedCompanyCustomers = updateCompanyCustomersStep(input);

    return new WorkflowResponse(updatedCompanyCustomers);
  }
);
