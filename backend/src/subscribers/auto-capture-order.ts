import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { type SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa";
import { capturePaymentWorkflow } from "@medusajs/medusa/core-flows";

export default async function autoCaptureOrder({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const paymentService = container.resolve(Modules.PAYMENT);

  const orderId = data.id;

  const {
    data: [{ payment_collection_id }],
  } = await query.graph({
    entity: "order_payment_collection",
    fields: ["payment_collection_id"],
    filters: { order_id: orderId },
  });

  logger.log("payment_collection_id=" + payment_collection_id);

  const { payments } = await paymentService.retrievePaymentCollection(
    payment_collection_id,
    {
      select: [],
      relations: ["payments"],
    }
  );

  const payment = payments?.[0];

  if (!payment) {
    logger.error(`Order does not have payment. OrderId=${orderId}.`);
    return;
  }

  await capturePaymentWorkflow(container).run({
    input: {
      payment_id: payment.id,
      amount: payment?.amount,
    },
  });

  logger.info(`Order payment auto-captured. OrderId=${orderId}.`);
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
