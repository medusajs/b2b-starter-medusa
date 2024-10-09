import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";

export const deleteEmployeesStep = createStep(
  "delete-employees",
  async (
    id: string | string[],
    { container }
  ): Promise<StepResponse<string | string[], string | string[]>> => {
    // TODO: Add type here
    const companyModuleService: any = container.resolve(COMPANY_MODULE);
    await companyModuleService.softDeleteEmployees(id);

    return new StepResponse(id, id);
  },
  async (employeeId: string | string[], { container }) => {
    // TODO: Add type here
    const companyModuleService: any = container.resolve(COMPANY_MODULE);
    const company = await companyModuleService.restoreEmployees(employeeId);
    return new StepResponse("Company restored", company);
  }
);
