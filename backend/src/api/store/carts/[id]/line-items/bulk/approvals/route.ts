import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { createApprovalsWorkflow } from "../../../../../workflows/approval/workflows";
import { StoreCreateApprovalType } from "../../validators";
import { ApprovalStatus } from "@starter/types/approval";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: cartId } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: approvals } = await query.graph({
    entity: "approval",
    fields: ["*"],
    filters: { cart_id: cartId },
  });

  res.json({ approvals });
};

export const POST = async (
  req: MedusaRequest<StoreCreateApprovalType>,
  res: MedusaResponse
) => {
  const data = req.validatedBody;
  const { id: cartId } = req.params;

  console.log("data", data);
  console.log("req.body", req.body);

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
