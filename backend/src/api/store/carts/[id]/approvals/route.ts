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

  const { result: approvals, errors } = await createApprovalsWorkflow.run({
    input: {
      ...data,
      cart_id: cartId,
      status: ApprovalStatus.PENDING,
    },
    container: req.scope,
    throwOnError: false,
  });

  if (errors.length > 0) {
    res.status(400).json({
      message: errors[0].error.message,
      code: "INVALID_DATA",
    });
    return;
  }

  res.json({ approvals });
};
