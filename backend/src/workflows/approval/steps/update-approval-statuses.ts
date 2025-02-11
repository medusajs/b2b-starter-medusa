import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import {
  ApprovalStatusType,
  IApprovalModuleService,
  ModuleApproval,
  ModuleApprovalStatus,
} from "../../../types";

export const updateApprovalStatusStep = createStep(
  "update-approval-status",
  async (
    input: ModuleApproval,
    { container }
  ): Promise<StepResponse<undefined, ModuleApprovalStatus>> => {
    const query = container.resolve("query");
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const {
      data: [approvalStatus],
    } = await query.graph({
      entity: "approval_status",
      fields: ["*", "status"],
      filters: {
        cart_id: input.cart_id,
      },
      pagination: {
        skip: 0,
        take: 1,
      },
    });

    const previousData = approvalStatus;

    const hasPendingApprovals = await approvalModule.hasPendingApprovals(
      input.cart_id
    );

    if (input.status === ApprovalStatusType.APPROVED && !hasPendingApprovals) {
      await approvalModule.updateApprovalStatuses([
        {
          id: approvalStatus.id,
          status: ApprovalStatusType.APPROVED,
        },
      ]);
    }

    if (input.status === ApprovalStatusType.REJECTED) {
      await approvalModule.updateApprovalStatuses([
        {
          id: approvalStatus.id,
          status: ApprovalStatusType.REJECTED,
        },
      ]);
    }

    return new StepResponse(
      undefined,
      previousData as unknown as ModuleApprovalStatus
    );
  },
  async (previousData: ModuleApprovalStatus, { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.updateApprovalStatuses([
      {
        id: previousData.id,
        status: previousData.status,
      },
    ]);
  }
);
