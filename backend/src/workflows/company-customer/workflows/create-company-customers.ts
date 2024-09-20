import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { CompanyCustomerDTO } from "../../../modules/company/types/common";
import { CreateCompanyCustomerDTO } from "../../../modules/company/types/mutations";
import {
  createCompanyCustomersStep,
  linkCompanyCustomerToCustomerStep,
} from "../steps";

type WorkflowInput = {
  companyCustomerData:
    | CreateCompanyCustomerDTO
    | WorkflowData<CreateCompanyCustomerDTO>;
  customerId: string;
}[];

export const createCompanyCustomersWorkflow = createWorkflow(
  "create-company-customers",
  function (
    input: WorkflowInput
  ): WorkflowResponse<CompanyCustomerDTO | CompanyCustomerDTO[]> {
    const companyCustomersData = transform(input, (input) =>
      input.map(({ companyCustomerData }) => companyCustomerData)
    );

    const companyCustomers = createCompanyCustomersStep(companyCustomersData);

    const linkCustomerData = transform(
      [companyCustomers, input],
      ([createdCompanyCustomers, originalInput]) =>
        createdCompanyCustomers.map((companyCustomer, index: number) => ({
          companyCustomerId: companyCustomer.id,
          customerId: (originalInput as WorkflowInput)[index].customerId,
        }))
    ) as WorkflowData<{ companyCustomerId: string; customerId: string }[]>;

    linkCompanyCustomerToCustomerStep(linkCustomerData);

    return new WorkflowResponse(companyCustomers);
  }
);
