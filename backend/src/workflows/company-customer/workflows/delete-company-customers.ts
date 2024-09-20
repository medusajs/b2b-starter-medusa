import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { deleteCompanyCustomersStep } from "../steps";

export const deleteCompanyCustomersWorkflow = createWorkflow(
  "delete-company-customers",
  (input: WorkflowData<string | string[]>): WorkflowResponse<string> => {
    deleteCompanyCustomersStep(input);

    return new WorkflowResponse("Company customers deleted");
  }
);
