import { createOrdersWorkflow } from "@medusajs/core-flows";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../modules/company";

createOrdersWorkflow.hooks.orderCreated(
  async ({ order }, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    if (!order.metadata?.company_id) {
      return new StepResponse(undefined, null);
    }

    await remoteLink.create({
      [Modules.ORDER]: {
        order_id: order.id,
      },
      [COMPANY_MODULE]: {
        company_id: order.metadata?.company_id,
      },
    });

    return new StepResponse(undefined, order.id);
  },
  async (orderId: string | null, { container }) => {
    if (!orderId) {
      return;
    }

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    await remoteLink.dismiss({
      [Modules.ORDER]: {
        order_id: orderId,
      },
    });
  }
);
