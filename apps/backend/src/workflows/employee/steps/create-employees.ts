import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { CreateEmployeeDTO } from "../../../modules/company/types/mutations";
import { COMPANY_MODULE } from "../../../modules/company";
import { EmployeeDTO } from "../../../modules/company/types/common";

export const createEmployeesStep = createStep(
  "create-employees",
  async (
    input: CreateEmployeeDTO | CreateEmployeeDTO[],
    { container }
  ): Promise<StepResponse<EmployeeDTO[], string[]>> => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    const employees = await companyModuleService.createEmployees(
      Array.isArray(input) ? input : [input]
    );

    return new StepResponse(
      employees,
      employees.map((employee) => employee.id)
    );
  },
  async (companyIds: string[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    await companyModuleService.deleteEmployees(companyIds);
    return new StepResponse("Company deleted", companyIds);
  }
);
