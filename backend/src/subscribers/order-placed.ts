import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IOrderModuleService, ICustomerModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  
  const orderId = event.data?.id;
  logger.info("[SUBSCRIBER] 📦 Order event received!", {
    eventName: event.name,
    orderId,
    eventData: JSON.stringify(event.data),
    allEventKeys: Object.keys(event),
  });

  if (!orderId) {
    logger.error("[SUBSCRIBER] No order ID in event data", { event });
    return;
  }

  const emailService = container.resolve("emailService") as EmailService;
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER);
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);

  try {
    
    logger.debug("[SUBSCRIBER] Retrieving order data", { orderId });
    
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: [
        "items",
        "items.variant",
        "items.product",
        "shipping_address",
        "billing_address",
        "shipping_methods",
        "payment_collections",
      ],
    });

    logger.debug("[SUBSCRIBER] Order data retrieved", {
      orderId: order.id,
      displayId: order.display_id,
      customerId: order.customer_id,
      total: order.total,
      itemCount: order.items?.length || 0,
    });

    if (!order?.customer_id) {
      logger.warn(`[SUBSCRIBER] Order ${orderId} has no customer - skipping email`);
      return;
    }

    logger.debug("[SUBSCRIBER] Retrieving customer data", { customerId: order.customer_id });
    
    const customer = await customerModuleService.retrieveCustomer(order.customer_id, {
      relations: ["addresses"],
    });

    logger.debug("[SUBSCRIBER] Customer data retrieved", {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    if (!customer?.email) {
      logger.warn(`[SUBSCRIBER] Customer ${order.customer_id} has no email address - skipping email`);
      return;
    }

    logger.info("[SUBSCRIBER] Sending order placed email", {
      to: customer.email,
      orderId,
      orderDisplayId: order.display_id,
    });

    const emailSent = await emailService.sendOrderPlacedEmail({
      to: customer.email,
      order: order,
      customer: customer,
    });

    if (emailSent) {
      logger.info(`[SUBSCRIBER] ✅ Order placed email successfully sent`, {
        orderId,
        orderDisplayId: order.display_id,
        email: customer.email,
      });
    } else {
      logger.warn(`[SUBSCRIBER] ⚠️ Order placed email was NOT sent (check email service logs)`, {
        orderId,
        orderDisplayId: order.display_id,
        email: customer.email,
      });
    }
  } catch (error: any) {
    logger.error(`[SUBSCRIBER] ❌ Failed to handle order placed event`, {
      orderId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.completed", 
    "order.confirmed",
    "order.payment_captured",
    "order.payment_authorized",
    "order.payment_collection_created",
    "order.payment_required",
    "order.fulfillment_created",
  ],
};