import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import { ApprovalStatusType, IApprovalModuleService } from "../../../types";

export const createApprovalStatusStep = createStep(
  "create-approval-status",
  async (cartIds: string[], { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    console.log("cartIds", cartIds);
    const {
      data: [existingApprovalStatus],
    } = await query.graph({
      entity: "approval_status",
      fields: ["*"],
      filters: {
        cart_id: cartIds[0],
      },
    });

    console.log("existingApprovalStatus", existingApprovalStatus);

    if (existingApprovalStatus) {
      const [approvalStatus] =
        await approvalModuleService.updateApprovalStatuses([
          {
            id: existingApprovalStatus.id,
            status: ApprovalStatusType.PENDING,
          },
        ]);

      console.log("approvalStatus", approvalStatus);

      return new StepResponse(approvalStatus, [approvalStatus.id]);
    }

    const approvalStatusesToCreate = cartIds.map((cartId) => ({
      cart_id: cartId,
      status: ApprovalStatusType.PENDING,
    }));

    const [approvalStatus] = await approvalModuleService.createApprovalStatuses(
      approvalStatusesToCreate
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
