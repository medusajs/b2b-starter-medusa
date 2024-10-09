import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";

export const deleteCompaniesStep = createStep(
  "delete-companies",
  async (
    id: string | string[],
    { container }
  ): Promise<StepResponse<string | string[], string | string[]>> => {
    const companyModuleService: any = container.resolve(COMPANY_MODULE);
    await companyModuleService.softDeleteCompanies(id);

    return new StepResponse(id, id);
  },
  async (companyId: string | string[], { container }) => {
    const companyModuleService: any = container.resolve(COMPANY_MODULE);
    const company = await companyModuleService.restoreCompanies(companyId);
    return new StepResponse("Company restored", company);
  }
);
