import { Modules } from "@medusajs/framework/utils";
import { transform } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import { ModuleCreateApproval } from "../../../types";
import { createApprovalStep } from "../steps";
import { createApprovalStatusStep } from "../steps/create-approval-status";

export const createApprovalsWorkflow = createWorkflow(
  "create-approvals",
  function (input: ModuleCreateApproval | ModuleCreateApproval[]) {
    const result = createApprovalStep(input);

    const cartIds = transform(input, (input) => {
      const approvals = Array.isArray(input) ? input : [input];
      return approvals.map((approval) => approval.cart_id);
    });

    const approvalStatusResult = createApprovalStatusStep(cartIds);

    const approvalLinkData = transform(result, (approval) => {
      const approvals = Array.isArray(approval) ? approval : [approval];
      return approvals.map((approval) => ({
        [Modules.CART]: {
          cart_id: approval.cart_id,
        },
        [APPROVAL_MODULE]: {
          approval_id: approval.id,
        },
      }));
    });

    const approvalStatusLinkData = transform(approvalStatusResult, (status) => {
      const statuses = Array.isArray(status) ? status : [status];
      return statuses.map((status) => ({
        [Modules.CART]: {
          cart_id: status.cart_id,
        },
        [APPROVAL_MODULE]: {
          approval_status_id: status.id,
        },
      }));
    });

    const linkData = transform(
      [approvalLinkData, approvalStatusLinkData],
      (data) => {
        return data.flat();
      }
    );

    createRemoteLinkStep(linkData);

    return new WorkflowResponse(result);
  }
);
