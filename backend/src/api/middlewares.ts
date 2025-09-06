import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defineMiddlewares } from "@medusajs/medusa";
import { adminMiddlewares } from "./admin/middlewares";
import { storeMiddlewares } from "./store/middlewares";
import { z } from "zod";
import { Modules } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

// Order email middleware
const sendOrderEmailAfterComplete = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to intercept response
  res.json = function(data: any) {
    // Check if this is a successful order creation
    if (data?.order?.id) {
      console.log("📧 [Order Email] Sending confirmation for order", data.order.display_id);
      
      // Use the order data from the response directly
      const order = data.order;
      const customerEmail = order.email;
      
      // Send email asynchronously
      (async () => {
        try {
          if (!customerEmail) {
            return;
          }
          
          const emailService = req.scope.resolve("emailService") as EmailService;
          
          // Create a simplified customer object from order data
          const customer = {
            id: order.customer_id || "guest",
            email: customerEmail,
            first_name: order.shipping_address?.first_name || order.billing_address?.first_name || "",
            last_name: order.shipping_address?.last_name || order.billing_address?.last_name || "",
          };
          
          const sent = await emailService.sendOrderPlacedEmail({
            to: customerEmail,
            order: order,
            customer: customer,
          });
          
          if (sent) {
            console.log("✅ [Order Email] Sent successfully to", customerEmail);
          } else {
            console.error("❌ [Order Email] Failed to send to", customerEmail);
          }
        } catch (error: any) {
          console.error("❌ [Order Email] Error:", error.message);
        }
      })();
    }
    
    // Call original json method
    return originalJson(data);
  };
  
  next();
};

export default defineMiddlewares({
  routes: [
    ...adminMiddlewares,
    ...storeMiddlewares,
    {
      matcher: "/store/carts/:id/complete",
      method: "POST",
      middlewares: [sendOrderEmailAfterComplete],
    },
    {
      matcher: "/admin/orders/{id}/fulfillments",
      method: "POST",
      additionalDataValidator: {
        shipping_amount: z.string().optional(),
      },
    },
  ],
});
