import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService } from "../../../types";
import { COMPANY_MODULE } from "../../../modules/company";

export const deleteCompaniesStep = createStep(
  "delete-companies",
  async (ids: string[], { container }) => {
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModule.softDeleteCompanies(ids);

    return new StepResponse(ids, ids);
  },
  async (companyIds: string[], { container }) => {
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModule.restoreCompanies(companyIds);
  }
);
