import { transform, when } from "@medusajs/framework/workflows-sdk";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleCreateEmployee, ModuleEmployee } from "@starter/types";
import {
  createEmployeesStep,
  linkEmployeeToCustomerStep,
  setAdminRoleStep,
} from "../steps";
import { linkCustomerGroupsToCustomerStep } from "@medusajs/core-flows";
import { addEmployeeToCustomerGroupStep } from "../steps/add-employee-to-customer-group";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { COMPANY_MODULE } from "src/modules/company";

type WorkflowInput = {
  employeeData: ModuleCreateEmployee;
  customerId: string;
};

export const createEmployeesWorkflow = createWorkflow(
  "create-employees",
  function (input: WorkflowInput): WorkflowResponse<ModuleEmployee> {
    const employee = createEmployeesStep(input.employeeData);

    createRemoteLinkStep([
      {
        [COMPANY_MODULE]: {
          employee_id: employee.id,
        },
        [Modules.CUSTOMER]: {
          customer_id: input.customerId,
        },
      },
    ]);

    when(employee, (employee) => !!employee.is_admin).then(() => {
      setAdminRoleStep({
        employeeId: employee.id,
        customerId: input.customerId,
      });
    });

    addEmployeeToCustomerGroupStep({
      employee_id: employee.id,
    });

    return new WorkflowResponse(employee);
  }
);
