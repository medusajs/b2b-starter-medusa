import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ApprovalStatusType, IApprovalModuleService } from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";

export const createApprovalStatusStep = createStep(
  "create-approval-status",
  async (cartIds: string[], { container }) => {
    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const approvalStatuses = cartIds.map((cartId) => ({
      cart_id: cartId,
      status: ApprovalStatusType.PENDING,
    }));

    const [approvalStatus] = await approvalModuleService.createApprovalStatuses(
      approvalStatuses
    );

    return new StepResponse(approvalStatus, [approvalStatus.id]);
  },
  async (statusIds: string[], { container }) => {
    if (!statusIds) {
      return;
    }

    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModuleService.deleteApprovalStatuses(statusIds);
  }
);
