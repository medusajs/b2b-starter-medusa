import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IOrderModuleService, ICustomerModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function orderCreatedEmailHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("========== ORDER CREATED EMAIL SUBSCRIBER ==========");
  console.log("[OrderCreated] 📦 Order created event received!");
  console.log("[OrderCreated] Order ID:", data.id);
  console.log("[OrderCreated] Timestamp:", new Date().toISOString());
  
  const orderId = data?.id;
  
  if (!orderId) {
    console.error("[OrderCreated] No order ID in event data");
    return;
  }

  const emailService = container.resolve("emailService") as EmailService;
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER);
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);
  
  try {
    console.log("[OrderCreated] Retrieving order details...");
    
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

    console.log("[OrderCreated] Order retrieved:", {
      id: order.id,
      display_id: order.display_id,
      customer_id: order.customer_id,
      total: order.total,
      items_count: order.items?.length || 0,
    });

    if (!order?.customer_id) {
      console.log(`[OrderCreated] Order ${orderId} has no customer - skipping email`);
      return;
    }

    console.log("[OrderCreated] Retrieving customer data...");
    
    const customer = await customerModuleService.retrieveCustomer(order.customer_id, {
      relations: ["addresses"],
    });

    console.log("[OrderCreated] Customer retrieved:", {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    if (!customer?.email) {
      console.log(`[OrderCreated] Customer ${order.customer_id} has no email - skipping`);
      return;
    }

    console.log("[OrderCreated] 📧 SENDING ORDER CONFIRMATION EMAIL...");
    console.log("  📬 TO:", customer.email);
    console.log("  🛒 ORDER:", order.display_id);
    console.log("  💰 TOTAL:", (order.total / 100).toFixed(2));

    const emailSent = await emailService.sendOrderPlacedEmail({
      to: customer.email,
      order: order,
      customer: customer,
    });

    if (emailSent) {
      console.log("[OrderCreated] ✅ ORDER EMAIL SENT SUCCESSFULLY!");
    } else {
      console.log("[OrderCreated] ❌ ORDER EMAIL FAILED TO SEND!");
    }
  } catch (error: any) {
    console.error("[OrderCreated] ❌ Error in order email handler:", {
      message: error.message,
      stack: error.stack,
    });
    // Don't throw - we don't want to break the order process
  } finally {
    console.log("========== ORDER CREATED EMAIL SUBSCRIBER END ==========");
  }
}

export const config: SubscriberConfig = {
  event: "order.created",
  context: {
    subscriberId: "order-created-email-handler",
  },
};