import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { UpdateCompanyCustomerDTO } from "../../../modules/company/types/mutations";
import { COMPANY_MODULE } from "../../../modules/company";
import { CompanyCustomerDTO } from "src/modules/company/types/common";

export const updateCompanyCustomersStep = createStep(
  "update-company-customers",
  async (
    input: UpdateCompanyCustomerDTO | UpdateCompanyCustomerDTO[],
    { container }
  ): Promise<
    StepResponse<
      CompanyCustomerDTO | CompanyCustomerDTO[],
      CompanyCustomerDTO[]
    >
  > => {
    const companyModuleService = container.resolve(COMPANY_MODULE);

    const ids = Array.isArray(input)
      ? input.map((company) => company.id)
      : [input.id];

    const currentData = await companyModuleService.listCompanyCustomers({
      id: ids,
    });

    const updatedCompanyCustomers =
      await companyModuleService.updateCompanyCustomers(input);

    return new StepResponse(updatedCompanyCustomers, currentData);
  },
  async (currentData: UpdateCompanyCustomerDTO[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    await companyModuleService.updateCompanyCustomers(currentData);
    return new StepResponse("Company customer data restored", currentData);
  }
);
