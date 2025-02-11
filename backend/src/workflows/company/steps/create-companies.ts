import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService, ModuleCreateCompany } from "../../../types";
import { COMPANY_MODULE } from "../../../modules/company";

export const createCompaniesStep = createStep(
  "create-companies",
  async (input: ModuleCreateCompany[], { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const companies = await companyModuleService.createCompanies(input);

    return new StepResponse(
      companies,
      companies.map((company) => company.id)
    );
  },
  async (companyIds: string[], { container }) => {
    if (!companyIds) {
      return;
    }

    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModuleService.deleteCompanies(companyIds);
  }
);
