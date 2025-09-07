import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IFulfillmentModuleService, IOrderModuleService, ICustomerModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

console.log("==========================================");
console.log("LOADING FULFILLMENT-SHIPPED SUBSCRIBER");
console.log("Subscribing to event: shipment.created");
console.log("==========================================");

export default async function fulfillmentShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const emailService = container.resolve("emailService") as EmailService;
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER);
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const fulfillmentId = data.id;
  console.log("========== SHIPMENT CREATED SUBSCRIBER START ==========");
  console.log("[ShipmentCreated] Subscriber triggered with shipment/fulfillment ID:", fulfillmentId);
  console.log("[ShipmentCreated] Event data:", JSON.stringify(data, null, 2));

  try {
    
    console.debug("[SUBSCRIBER] Retrieving fulfillment data", { fulfillmentId });
    
    const fulfillment = await fulfillmentModuleService.retrieveFulfillment(fulfillmentId, {
      relations: ["items", "items.line_item"],
    });

    if (!fulfillment) {
      console.warn(`[SUBSCRIBER] Fulfillment ${fulfillmentId} not found - skipping email`);
      return;
    }

    console.debug("[SUBSCRIBER] Fulfillment data retrieved", {
      fulfillmentId: fulfillment.id,
      itemCount: fulfillment.items?.length || 0,
      trackingNumbers: fulfillment.tracking_numbers,
      provider: fulfillment.provider_id,
    });

    // Get the order ID through the remote link query
    console.debug("[SUBSCRIBER] Querying for order link", { fulfillmentId });
    
    const { data } = await query.graph({
      entity: "order_fulfillment",
      fields: ["order_id", "fulfillment_id"],
      filters: {
        fulfillment_id: fulfillmentId,
      },
    });

    if (!data || data.length === 0) {
      console.warn(`[SUBSCRIBER] No order found for fulfillment ${fulfillmentId} - skipping email`);
      return;
    }

    const orderId = data[0].order_id;
    console.debug("[SUBSCRIBER] Order link found", { orderId, fulfillmentId });

    console.debug("[SUBSCRIBER] Retrieving order data", { orderId });
    
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: [
        "items",
        "shipping_address",
        "billing_address",
        "customer",
      ],
    });

    console.debug("[SUBSCRIBER] Order data retrieved", {
      orderId: order.id,
      displayId: order.display_id,
      customerId: order.customer_id,
    });

    if (!order?.customer_id) {
      console.warn(`[SUBSCRIBER] Order ${orderId} has no customer - skipping email`);
      return;
    }

    console.debug("[SUBSCRIBER] Retrieving customer data", { customerId: order.customer_id });
    
    const customer = await customerModuleService.retrieveCustomer(order.customer_id);

    console.debug("[SUBSCRIBER] Customer data retrieved", {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    if (!customer?.email) {
      console.warn(`[SUBSCRIBER] Customer ${order.customer_id} has no email address - skipping email`);
      return;
    }

    console.info("╔════════════════════════════════════════════════════════════════╗");
    console.info("║       PROCESSING FULFILLMENT SHIPPED EMAIL NOTIFICATION         ║");
    console.info("╚════════════════════════════════════════════════════════════════╝");
    console.info("[SUBSCRIBER] Email Details:", {
      to: customer.email,
      customerName: `${customer.first_name} ${customer.last_name}`,
      fulfillmentId,
      orderId,
      orderDisplayId: order.display_id,
      trackingNumbers: fulfillment.tracking_numbers,
      itemsCount: fulfillment.items?.length || 0,
      shippingAddress: `${order.shipping_address?.address_1}, ${order.shipping_address?.city}, ${order.shipping_address?.province} ${order.shipping_address?.postal_code}`,
    });

    await emailService.sendOrderShippedEmail({
      to: customer.email,
      order: order,
      fulfillment: fulfillment,
      customer: customer,
    });

    console.info("╔════════════════════════════════════════════════════════════════╗");
    console.info("║     ✅ FULFILLMENT SHIPPED EMAIL SUCCESSFULLY PROCESSED!        ║");
    console.info("╚════════════════════════════════════════════════════════════════╝");
    console.info(`[SUBSCRIBER] Email sent to: ${customer.email}`);
  } catch (error: any) {
    console.error("[ShipmentCreated] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    console.error("[ShipmentCreated] Full error object:", error);
    throw error;
  } finally {
    console.log("========== SHIPMENT CREATED SUBSCRIBER END ==========");
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
  context: {
    subscriberId: "fulfillment-shipped-handler",
  },
};