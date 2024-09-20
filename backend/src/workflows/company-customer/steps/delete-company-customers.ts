import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";

export const deleteCompanyCustomersStep = createStep(
  "delete-company-customers",
  async (
    id: string | string[],
    { container }
  ): Promise<StepResponse<string | string[], string | string[]>> => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    await companyModuleService.softDeleteCompanyCustomers(id);

    return new StepResponse(id, id);
  },
  async (companyCustomerId: string | string[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    const company = await companyModuleService.restoreCompanyCustomers(
      companyCustomerId
    );
    return new StepResponse("Company restored", company);
  }
);
