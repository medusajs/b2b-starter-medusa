import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import {
  ApprovalStatusType,
  IApprovalModuleService,
  ModuleApproval,
  ModuleUpdateApproval,
} from "../../../types";

export const updateApprovalStep = createStep(
  "update-approval",
  async (
    input: ModuleUpdateApproval,
    { container }
  ): Promise<StepResponse<ModuleApproval, ModuleUpdateApproval>> => {
    const query = container.resolve("query");
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const {
      data: [approval],
    } = await query.graph({
      entity: "approval",
      fields: ["*"],
      filters: {
        id: input.id,
      },
    });

    if (input.status === ApprovalStatusType.REJECTED) {
      const { data: approvalsToReject } = await query.graph({
        entity: "approval",
        fields: ["*"],
        filters: {
          cart_id: approval.cart_id,
          id: {
            $ne: approval.id,
          },
        },
      });

      const updateData = approvalsToReject.map((approval) => ({
        id: approval.id,
        status: ApprovalStatusType.REJECTED,
        handled_by: input.handled_by,
      }));

      await approvalModule.updateApprovals(updateData);
    }

    const previousData = {
      id: approval.id,
      status: approval.status as unknown as ApprovalStatusType,
      handled_by: approval.handled_by,
    } as ModuleUpdateApproval;

    const [updatedApproval] = await approvalModule.updateApprovals([input]);

    return new StepResponse(updatedApproval, previousData);
  },
  async (previousData: ModuleUpdateApproval, { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const updateData = Array.isArray(previousData)
      ? previousData
      : [previousData];

    await approvalModule.updateApprovals(updateData);
  }
);
