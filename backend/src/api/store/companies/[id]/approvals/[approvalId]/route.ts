import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { StoreUpdateApprovalType } from "../../../validators";
import { updateApprovalsWorkflow } from "../../../../../../workflows/approval/workflows";

export const POST = async (
  req: MedusaRequest<StoreUpdateApprovalType>,
  res: MedusaResponse
) => {
  const { id: approvalId } = req.params;
  const data = req.validatedBody;

  const { result: approval } = await updateApprovalsWorkflow.run({
    input: {
      ...data,
      id: approvalId,
    },
    container: req.scope,
  });

  res.json({ approval });
};
