import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleUpdateApproval } from "@starter/types";
import { updateApprovalStep } from "../steps";

export const updateApprovalsWorkflow = createWorkflow(
  "update-approvals",
  function (input: ModuleUpdateApproval) {
    return new WorkflowResponse(updateApprovalStep(input));
  }
);
