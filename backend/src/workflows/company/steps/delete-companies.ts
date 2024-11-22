import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService } from "@starter/types";
import { COMPANY_MODULE } from "../../../modules/company";

export const deleteCompaniesStep = createStep(
  "delete-companies",
  async (id: string[], { container }) => {
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModule.softDeleteCompanies(id);

    return new StepResponse(id);
  },
  async (companyId: string[], { container }) => {
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
  }
);
