import { createOrdersWorkflow } from "@medusajs/core-flows";
import { Modules, ContainerRegistrationKeys } from "@medusajs/utils";
import { StepResponse, WorkflowData } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../modules/company";

createOrdersWorkflow.hooks.orderCreated(
  async ({ order }, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    remoteLink.create({
      [Modules.ORDER]: {
        order_id: order.id,
      },
      [COMPANY_MODULE]: {
        company_id: order.metadata?.company_id,
      },
    });

    return new StepResponse(undefined, order.id);
  },
  async (orderId: string, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    remoteLink.dismiss({
      [Modules.ORDER]: {
        order_id: orderId,
      },
    });
  }
);
