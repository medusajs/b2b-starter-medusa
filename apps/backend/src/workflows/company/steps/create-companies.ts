import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { CompanyDTO } from "src/modules/company/types/common";
import { COMPANY_MODULE } from "../../../modules/company";
import { CreateCompanyDTO } from "../../../modules/company/types/mutations";

export const createCompaniesStep = createStep(
  "create-companies",
  async (
    input: CreateCompanyDTO | CreateCompanyDTO[],
    { container }
  ): Promise<StepResponse<CompanyDTO | CompanyDTO[], string[]>> => {
    // TODO: add type here
    const companyModuleService: any = container.resolve(COMPANY_MODULE);
    const companies = await companyModuleService.createCompanies(
      Array.isArray(input) ? input : [input]
    );

    return new StepResponse(
      companies,
      companies.map((company) => company.id)
    );
  },
  async (companyIds: string[], { container }) => {
    // TODO: add type here
    const companyModuleService: any = container.resolve(COMPANY_MODULE);
    await companyModuleService.deleteCompanies(companyIds);
    return new StepResponse("Company deleted", companyIds);
  }
);
