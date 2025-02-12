import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import { getCartApprovalStatus } from "../../utils/get-cart-approval-status";

addToCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [queryCart],
  } = await query.graph({
    entity: "cart",
    fields: ["approvals.*"],
    filters: {
      id: cart.id,
    },
  });

  const { isPendingApproval } = getCartApprovalStatus(queryCart);

  if (isPendingApproval) {
    throw new Error("Cart is pending approval");
  }

  return new StepResponse(undefined, null);
});
