import { when } from "@medusajs/framework/workflows-sdk";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleCreateEmployee, ModuleEmployee } from "@starter/types";
import {
  createEmployeesStep,
  linkEmployeeToCustomerStep,
  setAdminRoleStep,
} from "../steps";

type WorkflowInput = {
  employeeData: ModuleCreateEmployee;
  customerId: string;
};

export const createEmployeesWorkflow = createWorkflow(
  "create-employees",
  function (input: WorkflowInput): WorkflowResponse<ModuleEmployee> {
    const employee = createEmployeesStep(input.employeeData);

    linkEmployeeToCustomerStep({
      employeeId: employee.id,
      customerId: input.customerId,
    });

    when(employee, ({ is_admin }) => {
      return !!is_admin;
    }).then(() => {
      setAdminRoleStep({ employeeId: employee.id });
    });

    return new WorkflowResponse(employee);
  }
);
