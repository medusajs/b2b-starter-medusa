import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ICompanyModuleService } from "../../../types";

export const deleteEmployeesStep = createStep(
  "delete-employees",
  async (
    id: string | string[],
    { container }
  ): Promise<StepResponse<string[], string[]>> => {
    const ids = Array.isArray(id) ? id : [id];

    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    await companyModuleService.softDeleteEmployees(ids);

    return new StepResponse(ids);
  },
  async (ids: string[], { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    await companyModuleService.restoreEmployees(ids);
  }
);
