import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ApprovalStatus } from "@starter/types/approval";
import { createApprovalsWorkflow } from "../../../../../workflows/approval/workflows";
import { StoreCreateApprovalType } from "../../validators";

export const POST = async (
  req: MedusaRequest<StoreCreateApprovalType>,
  res: MedusaResponse
) => {
  const data = req.validatedBody;
  const { id: cartId } = req.params;

  const { result: approvals } = await createApprovalsWorkflow.run({
    input: {
      ...data,
      cart_id: cartId,
      status: ApprovalStatus.PENDING,
    },
    container: req.scope,
  });

  res.json({ approvals });
};
