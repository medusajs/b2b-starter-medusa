import { createCartWorkflow } from "@medusajs/core-flows";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../modules/company";

createCartWorkflow.hooks.cartCreated(
  async ({ cart }, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    if (!cart.metadata?.company_id) {
      return new StepResponse(undefined, null);
    }

    await remoteLink.create({
      [Modules.CART]: {
        cart_id: cart.id,
      },
      [COMPANY_MODULE]: {
        company_id: cart.metadata?.company_id,
      },
    });

    return new StepResponse(undefined, cart.id);
  },
  async (cartId: string | null, { container }) => {
    if (!cartId) {
      return;
    }

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    await remoteLink.dismiss({
      [Modules.CART]: {
        cart_id: cartId,
      },
    });
  }
);
