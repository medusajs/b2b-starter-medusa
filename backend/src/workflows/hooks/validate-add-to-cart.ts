import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ApprovalStatus } from "@starter/types";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";

addToCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  console.log("addToCartWorkflow.hooks.validate");
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [queryCart],
  } = await query.graph({
    entity: "cart",
    fields: ["approval.*"],
    filters: {
      id: cart.id,
    },
  });

  const approval = queryCart.approval;
  const status = approval?.status as unknown as ApprovalStatus;

  if (approval && status === ApprovalStatus.PENDING) {
    throw new Error("Cart is pending approval");
  }

  return new StepResponse(undefined, null);
});
