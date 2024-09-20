import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { CreateCompanyCustomerDTO } from "../../../modules/company/types/mutations";
import { COMPANY_MODULE } from "../../../modules/company";
import { CompanyCustomerDTO } from "../../../modules/company/types/common";

export const createCompanyCustomersStep = createStep(
  "create-company-customers",
  async (
    input: CreateCompanyCustomerDTO | CreateCompanyCustomerDTO[],
    { container }
  ): Promise<StepResponse<CompanyCustomerDTO[], string[]>> => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    const companyCustomers = await companyModuleService.createCompanyCustomers(
      Array.isArray(input) ? input : [input]
    );

    return new StepResponse(
      companyCustomers,
      companyCustomers.map((companyCustomer) => companyCustomer.id)
    );
  },
  async (companyIds: string[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    await companyModuleService.deleteCompanyCustomers(companyIds);
    return new StepResponse("Company deleted", companyIds);
  }
);
