import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { ModuleCreateEmployee, ModuleEmployee } from "@starter/types";
import {
  createEmployeesStep,
  linkEmployeeToCustomerStep,
  setAdminRoleStep,
} from "../steps";
import { when } from "@medusajs/framework/workflows-sdk";

type WorkflowInput = {
  employeeData: ModuleCreateEmployee | WorkflowData<ModuleCreateEmployee>;
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
      return is_admin === true;
    }).then(() => {
      setAdminRoleStep({
        employeeId: employee.id,
      });
    });

    return new WorkflowResponse(employee);
  }
);
