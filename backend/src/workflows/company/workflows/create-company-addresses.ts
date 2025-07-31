import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { ModuleCreateCompanyAddress } from "../../../types";
import { createCompanyAddressStep } from "../steps";

export const createCompanyAddressWorkflow = createWorkflow(
  "create-company-addresses",
  function (input: ModuleCreateCompanyAddress) {
    const address = createCompanyAddressStep(input);

    return new WorkflowResponse(address);
  }
);