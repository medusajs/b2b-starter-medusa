import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { updateApprovalsWorkflow } from "../../../../workflows/approval/workflows";
import { AdminUpdateApproval } from "../../../../types/approval/http";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateApproval>,
  res: MedusaResponse
) => {
  const { user_id } = req.auth_context.app_metadata as {
    user_id: string;
  };

  const { id: approvalId } = req.params;
  const { status } = req.validatedBody;

  const { result: approval, errors } = await updateApprovalsWorkflow.run({
    input: {
      status,
      handled_by: user_id,
      id: approvalId,
    },
    container: req.scope,
  });

  if (errors.length > 0) {
    res.status(400).json({
      message: errors[0].error.message,
      code: "INVALID_DATA",
    });
    return;
  }
  res.json({ approval });
};
