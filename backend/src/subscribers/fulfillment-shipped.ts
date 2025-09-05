import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IFulfillmentModuleService, IOrderModuleService, ICustomerModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function fulfillmentShippedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const emailService = container.resolve("emailService") as EmailService;
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER);
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const fulfillmentId = event.data.id;
  logger.info("[SUBSCRIBER] Fulfillment shipped event triggered", {
    fulfillmentId,
    eventName: event.name,
  });

  try {
    
    logger.debug("[SUBSCRIBER] Retrieving fulfillment data", { fulfillmentId });
    
    const fulfillment = await fulfillmentModuleService.retrieveFulfillment(fulfillmentId, {
      relations: ["items", "items.line_item"],
    });

    if (!fulfillment) {
      logger.warn(`[SUBSCRIBER] Fulfillment ${fulfillmentId} not found - skipping email`);
      return;
    }

    logger.debug("[SUBSCRIBER] Fulfillment data retrieved", {
      fulfillmentId: fulfillment.id,
      itemCount: fulfillment.items?.length || 0,
      trackingNumbers: fulfillment.tracking_numbers,
      provider: fulfillment.provider_id,
    });

    // Get the order ID through the remote link query
    logger.debug("[SUBSCRIBER] Querying for order link", { fulfillmentId });
    
    const { data } = await query.graph({
      entity: "order_fulfillment",
      fields: ["order_id", "fulfillment_id"],
      filters: {
        fulfillment_id: fulfillmentId,
      },
    });

    if (!data || data.length === 0) {
      logger.warn(`[SUBSCRIBER] No order found for fulfillment ${fulfillmentId} - skipping email`);
      return;
    }

    const orderId = data[0].order_id;
    logger.debug("[SUBSCRIBER] Order link found", { orderId, fulfillmentId });

    logger.debug("[SUBSCRIBER] Retrieving order data", { orderId });
    
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: [
        "items",
        "shipping_address",
        "billing_address",
        "customer",
      ],
    });

    logger.debug("[SUBSCRIBER] Order data retrieved", {
      orderId: order.id,
      displayId: order.display_id,
      customerId: order.customer_id,
    });

    if (!order?.customer_id) {
      logger.warn(`[SUBSCRIBER] Order ${orderId} has no customer - skipping email`);
      return;
    }

    logger.debug("[SUBSCRIBER] Retrieving customer data", { customerId: order.customer_id });
    
    const customer = await customerModuleService.retrieveCustomer(order.customer_id);

    logger.debug("[SUBSCRIBER] Customer data retrieved", {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    if (!customer?.email) {
      logger.warn(`[SUBSCRIBER] Customer ${order.customer_id} has no email address - skipping email`);
      return;
    }

    logger.info("[SUBSCRIBER] Sending fulfillment shipped email", {
      to: customer.email,
      fulfillmentId,
      orderId,
      orderDisplayId: order.display_id,
    });

    await emailService.sendOrderShippedEmail({
      to: customer.email,
      order: order,
      fulfillment: fulfillment,
      customer: customer,
    });

    logger.info(`[SUBSCRIBER] ✅ Fulfillment shipped email successfully processed`, {
      fulfillmentId,
      orderId,
      orderDisplayId: order.display_id,
      email: customer.email,
    });
  } catch (error: any) {
    logger.error(`[SUBSCRIBER] ❌ Failed to handle fulfillment shipped event`, {
      fulfillmentId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: ["fulfillment.shipped", "fulfillment.delivered"],
};