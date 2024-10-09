import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { EmployeeDTO } from "src/modules/company/types/common";
import { COMPANY_MODULE } from "../../../modules/company";
import { UpdateEmployeeDTO } from "../../../modules/company/types/mutations";

export const updateEmployeesStep = createStep(
  "update-employees",
  async (
    input: UpdateEmployeeDTO | UpdateEmployeeDTO[],
    { container }
  ): Promise<StepResponse<EmployeeDTO | EmployeeDTO[], EmployeeDTO[]>> => {
    const companyModuleService = container.resolve(COMPANY_MODULE);

    const ids = Array.isArray(input)
      ? input.map((company) => company.id)
      : [input.id];

    const currentData = await companyModuleService.listEmployees({
      id: ids,
    });

    const updatedEmployees = await companyModuleService.updateEmployees(input);

    return new StepResponse(updatedEmployees, currentData);
  },
  async (currentData: UpdateEmployeeDTO[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);

    await companyModuleService.updateEmployees(currentData);
    return new StepResponse("Company customer data restored", currentData);
  }
);
