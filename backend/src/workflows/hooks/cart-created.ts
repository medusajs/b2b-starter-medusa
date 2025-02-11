import { createCartWorkflow } from "@medusajs/core-flows";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../modules/company";
import { CartDTO } from "@medusajs/framework/types";

createCartWorkflow.hooks.cartCreated(
  async (
    { cart },
    { container }
  ): Promise<
    | StepResponse<undefined, null>
    | StepResponse<undefined, { cart_id: string; company_id: string }>
  > => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.LINK);

    const cartInputdata = cart as CartDTO;

    if (!cartInputdata.metadata?.company_id) {
      return new StepResponse(undefined, null);
    }

    await remoteLink.create({
      [COMPANY_MODULE]: {
        company_id: cartInputdata.metadata?.company_id,
      },
      [Modules.CART]: {
        cart_id: cartInputdata.id,
      },
    });

    return new StepResponse(undefined, {
      cart_id: cartInputdata.id,
      company_id: cartInputdata.metadata?.company_id as string,
    });
  },
  async (
    input: { cart_id: string; company_id: string } | null,
    { container }
  ) => {
    if (!input) {
      return;
    }

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    await remoteLink.dismiss({
      [COMPANY_MODULE]: {
        company_id: input.company_id,
      },
      [Modules.CART]: {
        cart_id: input.cart_id,
      },
    });
  }
);
