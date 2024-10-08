import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { EmployeeDTO } from "src/modules/company/types/common";
import { UpdateEmployeeDTO } from "src/modules/company/types/mutations";
import { updateEmployeesStep } from "../steps";

export const updateEmployeesWorkflow = createWorkflow(
  "update-employees",
  (
    input: WorkflowData<UpdateEmployeeDTO | UpdateEmployeeDTO[]>
  ): WorkflowResponse<EmployeeDTO | EmployeeDTO[]> => {
    const updatedEmployees = updateEmployeesStep(input);

    return new WorkflowResponse(updatedEmployees);
  }
);
