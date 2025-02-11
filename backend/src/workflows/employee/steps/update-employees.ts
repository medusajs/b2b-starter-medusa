import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import {
  ICompanyModuleService,
  ModuleUpdateEmployee,
  QueryEmployee,
} from "../../../types";

export const updateEmployeesStep = createStep(
  "update-employees",
  async (
    input: ModuleUpdateEmployee,
    { container }
  ): Promise<StepResponse<QueryEmployee, QueryEmployee>> => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [currentData],
    } = await query.graph({
      entity: "employee",
      fields: ["*"],
      filters: {
        id: input.id,
      },
    });

    const updatedEmployee = await companyModuleService.updateEmployees(input);

    const {
      data: [employee],
    } = await query.graph({
      entity: "employee",
      fields: ["*", "customer.*", "company.*"],
      filters: {
        id: updatedEmployee.id,
      },
    });

    return new StepResponse(
      employee as unknown as QueryEmployee,
      currentData as unknown as QueryEmployee
    );
  },
  async (currentData: ModuleUpdateEmployee, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModuleService.updateEmployees(currentData);
  }
);
