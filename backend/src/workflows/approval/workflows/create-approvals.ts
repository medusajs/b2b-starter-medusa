import { Modules } from "@medusajs/framework/utils";
import { transform } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleCreateApproval } from "@starter/types";
import { APPROVAL_MODULE } from "src/modules/approval";
import { createApprovalStep } from "../steps";

export const createApprovalsWorkflow = createWorkflow(
  "create-approvals",
  function (input: ModuleCreateApproval[]) {
    const approval = createApprovalStep(input);

    const linkData = transform(approval, (approval) =>
      approval.map((approval) => ({
        [Modules.CART]: {
          cart_id: approval.cart_id,
        },
        [APPROVAL_MODULE]: {
          approval_id: approval.id,
        },
      }))
    );

    createRemoteLinkStep(linkData);

    return new WorkflowResponse(approval);
  }
);
