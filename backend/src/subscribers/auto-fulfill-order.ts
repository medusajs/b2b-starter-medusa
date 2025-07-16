import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { type SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa";
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
} from "@medusajs/medusa/core-flows";

function generateTrackingCode(countryCode: string = "XX"): string {
  // Generate a random tracking number in the format: XX123456789YY
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const prefix = countryCode.toUpperCase();
  const numbers = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0");
  const suffix =
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)];
  return `${prefix}${numbers}${suffix}`;
}

export default async function autoFulfillOrder({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve(Modules.ORDER);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const orderId = data.id;

  const order = await orderService.retrieveOrder(orderId, {
    select: ["*"],
    relations: ["items", "shipping_address"],
  });

  if (!order.items) {
    logger.error(`Order does not have items. OrderId=${order.id}.`);
    return;
  }

  const { result: fulfillment } = await createOrderFulfillmentWorkflow(
    container
  ).run({
    input: {
      order_id: order.id,
      items: order.items,
    },
  });

  await createOrderShipmentWorkflow(container).run({
    input: {
      order_id: order.id,
      fulfillment_id: fulfillment.id,
      items: order.items,
      labels: [
        {
          label_url: "",
          tracking_number: generateTrackingCode(
            order.shipping_address?.country_code?.toUpperCase()
          ),
          tracking_url: "",
        },
      ],
    },
  });

  logger.info(`Order auto-fulfilled. OrderId=${order.id}.`);
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
