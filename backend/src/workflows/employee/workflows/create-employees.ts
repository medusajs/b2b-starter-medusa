import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { EmployeeDTO } from "../../../modules/company/types/common";
import { CreateEmployeeDTO } from "../../../modules/company/types/mutations";
import { createEmployeesStep, linkEmployeeToCustomerStep } from "../steps";

type WorkflowInput = {
  employeeData: CreateEmployeeDTO | WorkflowData<CreateEmployeeDTO>;
  customerId: string;
}[];

export const createEmployeesWorkflow = createWorkflow(
  "create-employees",
  function (
    input: WorkflowInput
  ): WorkflowResponse<EmployeeDTO | EmployeeDTO[]> {
    const employeesData = transform(input, (input) =>
      input.map(({ employeeData }) => employeeData)
    );

    const employees = createEmployeesStep(employeesData);

    const linkCustomerData = transform(
      [employees, input],
      ([createdEmployees, originalInput]) =>
        createdEmployees.map((employee, index: number) => ({
          employeeId: employee.id,
          customerId: (originalInput as WorkflowInput)[index].customerId,
        }))
    ) as WorkflowData<{ employeeId: string; customerId: string }[]>;

    linkEmployeeToCustomerStep(linkCustomerData);

    return new WorkflowResponse(employees);
  }
);
