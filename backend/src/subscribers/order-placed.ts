import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IOrderModuleService, ICustomerModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("========== ORDER PLACED SUBSCRIBER START ==========");
  console.log("[OrderPlaced] Subscriber triggered with order ID:", data.id);
  
  const orderId = data?.id;
  console.log("[OrderPlaced] Event details:", {
    orderId,
    eventData: JSON.stringify(data),
  });

  if (!orderId) {
    console.error("[OrderPlaced] No order ID in event data", { data });
    return;
  }

  const emailService = container.resolve("emailService") as EmailService;
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER);
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);
  
  console.log("[OrderPlaced] Services resolved:", {
    emailService: !!emailService,
    orderModuleService: !!orderModuleService,
    customerModuleService: !!customerModuleService,
  });

  try {
    console.log("[OrderPlaced] Retrieving order details...");
    
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

    console.log("[OrderPlaced] Order details:", {
      id: order.id,
      display_id: order.display_id,
      customer_id: order.customer_id,
      total: order.total,
      items_count: order.items?.length || 0,
    });

    if (!order?.customer_id) {
      console.log(`[OrderPlaced] Order ${orderId} has no customer - skipping email`);
      return;
    }

    console.log("[OrderPlaced] Retrieving customer data...");
    
    const customer = await customerModuleService.retrieveCustomer(order.customer_id, {
      relations: ["addresses"],
    });

    console.log("[OrderPlaced] Customer data retrieved:", {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    if (!customer?.email) {
      console.log(`[OrderPlaced] Customer ${order.customer_id} has no email address - skipping email`);
      return;
    }

    console.log("[OrderPlaced] Sending order placed email...");

    const emailSent = await emailService.sendOrderPlacedEmail({
      to: customer.email,
      order: order,
      customer: customer,
    });

    if (emailSent) {
      console.log("[OrderPlaced] ✅ Order placed email successfully sent!", {
        orderId,
        orderDisplayId: order.display_id,
        email: customer.email,
      });
    } else {
      console.log("[OrderPlaced] ⚠️ Order placed email was NOT sent (check email service logs)", {
        orderId,
        orderDisplayId: order.display_id,
        email: customer.email,
      });
    }
  } catch (error: any) {
    console.error("[OrderPlaced] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    console.error("[OrderPlaced] Full error object:", error);
    throw error;
  } finally {
    console.log("========== ORDER PLACED SUBSCRIBER END ==========");
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: {
    subscriberId: "order-placed-handler",
  },
};