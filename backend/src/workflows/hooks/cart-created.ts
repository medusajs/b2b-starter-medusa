import { createCartWorkflow } from "@medusajs/core-flows";
import { Modules, ContainerRegistrationKeys } from "@medusajs/utils";
import { StepResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../modules/company";

createCartWorkflow.hooks.cartCreated(
  async ({ cart }, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    remoteLink.create({
      [Modules.CART]: {
        cart_id: cart.id,
      },
      [COMPANY_MODULE]: {
        company_id: cart.metadata?.company_id,
      },
    });

    return new StepResponse(undefined, cart.id);
  },
  async (cartId: string, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    remoteLink.dismiss({
      [Modules.CART]: {
        cart_id: cartId,
      },
    });
  }
);
