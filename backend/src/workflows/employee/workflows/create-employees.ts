import { Modules } from "@medusajs/framework/utils";
import { when } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ModuleCreateEmployee, ModuleEmployee } from "../../../types";
import { createEmployeesStep, setAdminRoleStep } from "../steps";
import { addEmployeeToCustomerGroupStep } from "../steps/add-employee-to-customer-group";

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

    when(input.employeeData, (employee) => !!employee.is_admin).then(() => {
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
