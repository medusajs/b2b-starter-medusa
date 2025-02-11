import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleUpdateApproval } from "../../../types";
import { updateApprovalStatusStep, updateApprovalStep } from "../steps";

export const updateApprovalsWorkflow = createWorkflow(
  "update-approvals",
  function (input: ModuleUpdateApproval) {
    const updatedApproval = updateApprovalStep(input);

    updateApprovalStatusStep(updatedApproval);

    return new WorkflowResponse(updatedApproval);
  }
);
