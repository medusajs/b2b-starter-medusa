import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { ModuleUpdateCompanyAddress } from "../../../types";
import { updateCompanyAddressStep } from "../steps";

export const updateCompanyAddressWorkflow = createWorkflow(
  "update-company-addresses",
  function (input: ModuleUpdateCompanyAddress) {
    const address = updateCompanyAddressStep(input);

    return new WorkflowResponse(address);
  }
);