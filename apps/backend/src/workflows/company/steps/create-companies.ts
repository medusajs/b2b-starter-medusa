import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { CreateCompanyDTO } from "../../../modules/company/types/mutations";
import { COMPANY_MODULE } from "../../../modules/company";
import { CompanyDTO } from "src/modules/company/types/common";

export const createCompaniesStep = createStep(
  "create-companies",
  async (
    input: CreateCompanyDTO | CreateCompanyDTO[],
    { container }
  ): Promise<StepResponse<CompanyDTO | CompanyDTO[], string[]>> => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    const companies = await companyModuleService.createCompanies(
      Array.isArray(input) ? input : [input]
    );

    return new StepResponse(
      companies,
      companies.map((company) => company.id)
    );
  },
  async (companyIds: string[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    await companyModuleService.deleteCompanies(companyIds);
    return new StepResponse("Company deleted", companyIds);
  }
);
