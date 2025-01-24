import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ApprovalStatus,
  IApprovalModuleService,
  ModuleUpdateApproval,
} from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";

export const updateApprovalStep = createStep(
  "update-approval",
  async (input: ModuleUpdateApproval, { container }) => {
    const query = container.resolve("query");
    const approvalModule = container.resolve(APPROVAL_MODULE);

    const {
      data: [approval],
    } = await query.graph({
      entity: "approval",
      fields: ["*"],
      filters: {
        id: input.id,
      },
    });

    const previousData = {
      id: approval.id,
      status: approval.status as unknown as ApprovalStatus,
      handled_by: approval.handled_by,
    } as ModuleUpdateApproval;

    const updatedApprovals = await approvalModule.updateApprovals([input]);

    return new StepResponse(updatedApprovals, previousData);
  },
  async (previousData: ModuleUpdateApproval, { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.updateApproval(previousData);
  }
);
