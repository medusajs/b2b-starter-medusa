import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ApprovalStatus,
  IApprovalModuleService,
  ModuleCreateApproval,
} from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";
import { getCartApprovalStatus } from "src/utils/get-cart-approval-status";

export const createApprovalStep = createStep(
  "create-approval",
  async (
    input: ModuleCreateApproval | ModuleCreateApproval[],
    { container }
  ) => {
    const query = container.resolve("query");

    const approvalData = Array.isArray(input) ? input : [input];

    const {
      data: [cart],
    } = await query.graph(
      {
        entity: "cart",
        fields: ["id", "approvals.*"],
        filters: {
          id: approvalData[0].cart_id,
        },
      },
      {
        throwIfKeyNotFound: true,
      }
    );

    const { isPendingApproval, isApproved } = getCartApprovalStatus(cart);

    if (isPendingApproval) {
      throw new Error("Cart already has a pending approval");
    }

    if (isApproved) {
      throw new Error("Cart is already approved");
    }

    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const approvals = await approvalModuleService.createApprovals(
      Array.isArray(input) ? input : [input]
    );

    return new StepResponse(
      approvals,
      approvals.map((approval) => approval.id)
    );
  },
  async (approvalIds: string[], { container }) => {
    if (!approvalIds) {
      return;
    }

    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModuleService.deleteApprovals(approvalIds);
  }
);
