import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";

export const deleteEmployeesStep = createStep(
  "delete-employees",
  async (
    id: string | string[],
    { container }
  ): Promise<StepResponse<string | string[], string | string[]>> => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    await companyModuleService.softDeleteEmployees(id);

    return new StepResponse(id, id);
  },
  async (employeeId: string | string[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    const company = await companyModuleService.restoreEmployees(employeeId);
    return new StepResponse("Company restored", company);
  }
);
