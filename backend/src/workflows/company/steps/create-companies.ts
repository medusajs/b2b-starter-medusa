import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService, ModuleCreateCompany } from "@starter/types";
import { COMPANY_MODULE } from "../../../modules/company";

export const createCompaniesStep = createStep(
  "create-companies",
  async (input: ModuleCreateCompany, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const company = await companyModuleService.createCompanies(input);

    return new StepResponse(company, company.id);
  },
  async (companyId: string, { container }) => {
    if (!companyId) {
      return;
    }

    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
  }
);
