import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function debugAllEventsHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  console.log("🔔 EVENT TRIGGERED:", event.name);
  console.log("  📊 Event Data:", JSON.stringify(event.data, null, 2));
  console.log("  ⏰ Timestamp:", new Date().toISOString());
  
  // Check if this might be an order-related event
  if (event.name && (event.name.includes("order") || event.name.includes("complete"))) {
    console.log("  🎯 POTENTIAL ORDER EVENT DETECTED!");
    
    // Try to extract order ID from the event data
    const orderId = event.data?.order?.id || event.data?.order_id || event.data?.id;
    
    if (orderId && typeof orderId === 'string' && orderId.startsWith('order_')) {
      console.log("  📦 ORDER ID FOUND:", orderId);
      
      // Send order email
      try {
        const emailService = container.resolve("emailService") as EmailService;
        const orderModuleService = container.resolve(Modules.ORDER);
        const customerModuleService = container.resolve(Modules.CUSTOMER);
        
        const order = await orderModuleService.retrieveOrder(orderId, {
          relations: [
            "items",
            "items.variant",
            "items.product",
            "shipping_address",
            "billing_address",
          ],
        });
        
        if (order.customer_id) {
          const customer = await customerModuleService.retrieveCustomer(order.customer_id, {
            relations: ["addresses"],
          });
          
          if (customer?.email) {
            console.log("  📧 SENDING ORDER EMAIL TO:", customer.email);
            
            const sent = await emailService.sendOrderPlacedEmail({
              to: customer.email,
              order: order,
              customer: customer,
            });
            
            console.log("  EMAIL RESULT:", sent ? "✅ SENT!" : "❌ FAILED!");
          }
        }
      } catch (error: any) {
        console.error("  ❌ Error sending order email:", error.message);
      }
    }
  }
}

export const config: SubscriberConfig = {
  event: "*", // Listen to ALL events
  context: {
    subscriberId: "debug-all-events-handler",
  },
};