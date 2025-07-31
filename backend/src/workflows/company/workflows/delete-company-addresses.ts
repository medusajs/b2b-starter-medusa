import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { deleteCompanyAddressStep } from "../steps";

export const deleteCompanyAddressWorkflow = createWorkflow(
  "delete-company-addresses",
  function (input: { id: string }) {
    const result = deleteCompanyAddressStep(input);

    return new WorkflowResponse(result);
  }
);