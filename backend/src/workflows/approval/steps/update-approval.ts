import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ApprovalStatusType,
  IApprovalModuleService,
  ModuleApproval,
  ModuleUpdateApproval,
} from "@starter/types";
import { APPROVAL_MODULE } from "../../../modules/approval";

export const updateApprovalStep = createStep(
  "update-approval",
  async (
    input: ModuleUpdateApproval,
    { container }
  ): Promise<StepResponse<ModuleApproval, ModuleUpdateApproval>> => {
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
      status: approval.status as unknown as ApprovalStatusType,
      handled_by: approval.handled_by,
    } as ModuleUpdateApproval;

    const [updatedApproval] = await approvalModule.updateApprovals([input]);

    return new StepResponse(updatedApproval, previousData);
  },
  async (previousData: ModuleUpdateApproval, { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.updateApproval(previousData);
  }
);
