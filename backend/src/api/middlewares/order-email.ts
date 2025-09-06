import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import EmailService from "../../services/email.service";

export async function sendOrderEmailAfterCompletion(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Only intercept successful cart completions
  if (req.method === "POST" && req.path.includes("/complete") && res.statusCode === 200) {
    console.log("========== INTERCEPTING CART COMPLETION ==========");
    
    try {
      // Get the response data
      const responseData = res.locals?.data;
      const orderId = responseData?.order?.id || responseData?.id;
      
      if (orderId && orderId.startsWith("order_")) {
        console.log("[Middleware] 📦 Order created:", orderId);
        
        const container = req.scope;
        const emailService = container.resolve("emailService") as EmailService;
        const orderModuleService = container.resolve(Modules.ORDER);
        const customerModuleService = container.resolve(Modules.CUSTOMER);
        
        // Send email in the background - don't block response
        setImmediate(async () => {
          try {
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
                console.log("[Middleware] 📧 Sending order email to:", customer.email);
                
                const sent = await emailService.sendOrderPlacedEmail({
                  to: customer.email,
                  order: order,
                  customer: customer,
                });
                
                console.log("[Middleware] Email result:", sent ? "✅ SENT!" : "❌ FAILED!");
              }
            }
          } catch (error: any) {
            console.error("[Middleware] Error sending order email:", error.message);
          }
        });
      }
    } catch (error: any) {
      console.error("[Middleware] Error in order email middleware:", error.message);
    }
    
    console.log("========== MIDDLEWARE END ==========");
  }
  
  next();
}