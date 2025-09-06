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
  console.log("🔍 [ORDER EMAIL MW] Intercepting cart completion...");
  
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to intercept response
  res.json = function(data: any) {
    console.log("📦 [ORDER EMAIL MW] Response data intercepted!");
    
    // Check if this is a successful order creation
    if (data?.order?.id) {
      console.log("🎯 [ORDER EMAIL MW] ORDER FOUND IN RESPONSE!");
      console.log("   Order ID:", data.order.id);
      console.log("   Display ID:", data.order.display_id);
      console.log("   Customer Email:", data.order.email);
      console.log("   Items Count:", data.order.items?.length || 0);
      console.log("   Has Shipping Address:", !!data.order.shipping_address);
      console.log("   Order Total:", data.order.total);
      
      // Log the full order structure to debug
      console.log("📋 [ORDER EMAIL MW] Full order data keys:", Object.keys(data.order));
      
      // Use the order data from the response directly
      const order = data.order;
      const customerEmail = order.email;
      
      // Send email synchronously before returning response
      (async () => {
        try {
          console.log("📧 [ORDER EMAIL MW] SENDING ORDER CONFIRMATION EMAIL...");
          
          if (!customerEmail) {
            console.log("⚠️ [ORDER EMAIL MW] No customer email in order");
            return;
          }
          
          console.log("📬 [ORDER EMAIL MW] Sending email to:", customerEmail);
          
          const emailService = req.scope.resolve("emailService") as EmailService;
          
          // Create a simplified customer object from order data
          const customer = {
            id: order.customer_id || "guest",
            email: customerEmail,
            first_name: order.shipping_address?.first_name || order.billing_address?.first_name || "",
            last_name: order.shipping_address?.last_name || order.billing_address?.last_name || "",
          };
          
          console.log("📦 [ORDER EMAIL MW] Using order data from response:", {
            id: order.id,
            display_id: order.display_id,
            customer_email: customerEmail,
            total: order.total,
            items_count: order.items?.length || 0,
          });
          
          const sent = await emailService.sendOrderPlacedEmail({
            to: customerEmail,
            order: order,
            customer: customer,
          });
          
          console.log("✅ [ORDER EMAIL MW] EMAIL RESULT:", sent ? "SENT SUCCESSFULLY!" : "FAILED TO SEND!");
        } catch (error: any) {
          console.error("❌ [ORDER EMAIL MW] Error sending email:", error.message);
          console.error("❌ [ORDER EMAIL MW] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
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
