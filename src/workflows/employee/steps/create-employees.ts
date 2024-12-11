import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ICompanyModuleService,
  ModuleCreateEmployee,
  ModuleEmployee,
} from "@starter/types";
import { COMPANY_MODULE } from "../../../modules/company";

export const createEmployeesStep = createStep(
  "create-employees",
  async (
    input: ModuleCreateEmployee,
    { container }
  ): Promise<StepResponse<ModuleEmployee, string>> => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const employee = await companyModuleService.createEmployees(input);

    return new StepResponse(employee, employee.id);
  },
  async (employeeId: string, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    await companyModuleService.deleteEmployees([employeeId]);
  }
);
