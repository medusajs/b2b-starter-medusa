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
  const fulfillmentService = container.resolve(Modules.FULFILLMENT);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const orderId = data.id;

  const order = await orderService.retrieveOrder(orderId, {
    select: ["*"],
    relations: ["items", "shipping_address", "shipping_methods"],
  });

  if (!order.items) {
    logger.error(`Order does not have items. OrderId=${order.id}.`);
    return;
  }

  if (!order.shipping_methods?.[0].shipping_option_id) {
    logger.error(`Order does not have shipping methods. OrderId=${order.id}.`);
    return;
  }

  const shippingOption = await fulfillmentService.retrieveShippingOption(
    order.shipping_methods[0].shipping_option_id,
    {
      select: ["service_zone.fulfillment_set_id"],
      relations: ["service_zone"],
    }
  );

  const {
    data: [{ stock_location_id }],
  } = await query.graph({
    entity: "location_fulfillment_set",
    fields: ["stock_location_id"],
    filters: {
      fulfillment_set_id: shippingOption.service_zone.fulfillment_set_id,
    },
  });

  const { result: fulfillment } = await createOrderFulfillmentWorkflow(
    container
  ).run({
    input: {
      order_id: order.id,
      items: order.items,
      location_id: stock_location_id,
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
