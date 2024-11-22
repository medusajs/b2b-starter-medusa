import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { deleteEmployeesStep } from "../steps";

export const deleteEmployeesWorkflow = createWorkflow(
  "delete-employees",
  (input: WorkflowData<string | string[]>): WorkflowResponse<string> => {
    deleteEmployeesStep(input);

    return new WorkflowResponse("Company customers deleted");
  }
);
