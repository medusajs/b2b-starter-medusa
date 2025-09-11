import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defineMiddlewares } from "@medusajs/medusa";
import { adminMiddlewares } from "./admin/middlewares";
import { storeMiddlewares } from "./store/middlewares";
import { z } from "zod";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

// Order email middleware
const sendOrderEmailAfterComplete = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  console.log("🔥🔥🔥 ===========================================");
  console.log("🔥🔥🔥 [MIDDLEWARE] sendOrderEmailAfterComplete TRIGGERED!");
  console.log("🔥🔥🔥 [MIDDLEWARE] URL:", req.url);
  console.log("🔥🔥🔥 [MIDDLEWARE] Method:", req.method);
  console.log("🔥🔥🔥 ===========================================");
  
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to intercept response
  res.json = function(data: any) {
    console.log("🔥 [MIDDLEWARE] Response intercepted!");
    console.log("🔥 [MIDDLEWARE] Response has order?", !!data?.order);
    console.log("🔥 [MIDDLEWARE] Order ID:", data?.order?.id);
    
    // Check if this is a successful order creation
    if (data?.order?.id) {
      console.log("🔥🔥🔥 [MIDDLEWARE] ORDER FOUND IN RESPONSE!");
      // Use the order data from the response directly
      const order = data.order;
      let customerEmail = order.email;
      console.log("🔥 [MIDDLEWARE] Order email:", customerEmail);
      console.log("🔥 [MIDDLEWARE] Order customer_id:", order.customer_id);
      
      // Send email asynchronously
      (async () => {
        console.log("🔥 [MIDDLEWARE] Starting async email send...");
        try {
          // First try to get customer from auth token
          const authToken = req.headers.authorization;
          let customer: any = null;
          
          if (!customerEmail && authToken) {
            console.log("🔥 [MIDDLEWARE] Trying to get customer from auth token...");
            try {
              const tokenPayload = authToken.split('.')[1];
              const decodedToken = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
              const customerId = decodedToken.actor_id || decodedToken.app_metadata?.customer_id;
              
              if (customerId && customerId.startsWith('cus_')) {
                console.log("🔥 [MIDDLEWARE] Found customer ID in token:", customerId);
                const customerModule = req.scope.resolve(Modules.CUSTOMER);
                customer = await customerModule.retrieveCustomer(customerId);
                customerEmail = customer?.email;
                console.log("🔥 [MIDDLEWARE] Got customer email from token:", customerEmail);
              }
            } catch (e) {
              console.error("❌ [MIDDLEWARE] Failed to get customer from token:", e);
            }
          }
          
          // If no email on order and we have customer_id, try to fetch from customer
          if (!customerEmail && order.customer_id) {
            console.log("🔥 [MIDDLEWARE] No email on order, fetching customer...");
            const customerModule = req.scope.resolve(Modules.CUSTOMER);
            try {
              customer = await customerModule.retrieveCustomer(order.customer_id);
              customerEmail = customer?.email;
              console.log("🔥 [MIDDLEWARE] Customer email from customer module:", customerEmail);
            } catch (e) {
              console.error("❌ [MIDDLEWARE] Failed to fetch customer:", e);
            }
          }
          
          if (!customerEmail) {
            console.error("❌ [MIDDLEWARE] No customer email found after all attempts!");
            return;
          }
          
          console.log("🔥 [MIDDLEWARE] Resolving email service...");
          const emailService = req.scope.resolve("emailService") as EmailService;
          
          // Use the customer we already fetched, or create a fallback
          if (!customer) {
            customer = {
              id: order.customer_id || "guest",
              email: customerEmail,
              first_name: order.shipping_address?.first_name || order.billing_address?.first_name || "",
              last_name: order.shipping_address?.last_name || order.billing_address?.last_name || "",
            };
            console.log("🔥 [MIDDLEWARE] Using fallback customer data");
          } else {
            console.log("🔥 [MIDDLEWARE] Using fetched customer:", {
              id: customer.id,
              email: customer.email,
              name: `${customer.first_name} ${customer.last_name}`
            });
          }
          
          console.log("🔥 [MIDDLEWARE] Customer object created:", customer);
          console.log("🔥 [MIDDLEWARE] Calling emailService.sendOrderPlacedEmail...");
          
          const sent = await emailService.sendOrderPlacedEmail({
            to: customerEmail,
            order: order,
            customer: customer,
          });
          
          console.log("🔥 [MIDDLEWARE] Email send result:", sent);
          
          if (sent) {
            console.log("✅✅✅ [MIDDLEWARE] ORDER EMAIL SENT SUCCESSFULLY VIA MIDDLEWARE!");
          } else {
            console.error("❌❌❌ [MIDDLEWARE] ORDER EMAIL FAILED TO SEND VIA MIDDLEWARE!");
          }
          
        } catch (error: any) {
          console.error("❌❌❌ [MIDDLEWARE] Error in async email send:", error.message);
          console.error("❌❌❌ [MIDDLEWARE] Error stack:", error.stack);
        }
      })();
    }
    
    // Call original json method
    return originalJson(data);
  };
  
  next();
};

// Shipment email middleware  
const sendShipmentEmailAfterCreate = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to intercept response
  res.json = function(data: any) {
    // Check if this is a successful shipment creation
    if (req.method === "POST" && req.url.includes("/shipments")) {
      // Extract order ID and fulfillment ID from URL
      const urlParts = req.url.split("/");
      const orderIdIndex = urlParts.findIndex(part => part === "orders") + 1;
      const fulfillmentIdIndex = urlParts.findIndex(part => part === "fulfillments") + 1;
      
      const orderId = urlParts[orderIdIndex];
      const fulfillmentId = urlParts[fulfillmentIdIndex];
      
      // Send email asynchronously
      (async () => {
        try {
          const emailService = req.scope.resolve("emailService") as EmailService;
          
          // Use the data from the response
          const order = data.order;
          
          // Create fulfillment object from request body with proper structure
          const body = req.body as { labels?: Array<{ tracking_number: string; tracking_url: string }>; items?: any[] };
          const fulfillment = {
            id: fulfillmentId,
            tracking_numbers: body.labels?.map((l: any) => l.tracking_number) || [],
            tracking_links: body.labels?.map((l: any) => ({ url: l.tracking_url })) || [],
            provider_id: "manual",
            items: body.items || [],
            shipped_at: new Date(),
          };
          
          // Get order with customer using remote query
          const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
          
          const { data: orders } = await query.graph({
            entity: "order",
            fields: [
              "id",
              "display_id",
              "email", 
              "customer_id",
              "customer.*",
              "items.*",
              "items.variant.*",
              "items.product.*",
              "shipping_address.*",
              "billing_address.*"
            ],
            filters: {
              id: orderId,
            },
          });
          
          const fullOrder = orders?.[0];
          
          // Try to get email from multiple sources
          let customerEmail = fullOrder?.email || fullOrder?.customer?.email;
          let customer: any = fullOrder?.customer;
          
          // If no customer object, create one from order data
          if (!customer && customerEmail) {
            customer = {
              id: fullOrder?.customer_id || "guest",
              email: customerEmail,
              first_name: fullOrder?.shipping_address?.first_name || fullOrder?.billing_address?.first_name || "",
              last_name: fullOrder?.shipping_address?.last_name || fullOrder?.billing_address?.last_name || "",
            };
          }
          
          // If still no email and we have customer_id, fetch customer directly
          if (!customerEmail && fullOrder?.customer_id) {
            const customerModule = req.scope.resolve(Modules.CUSTOMER);
            try {
              const fetchedCustomer = await customerModule.retrieveCustomer(fullOrder.customer_id);
              customer = fetchedCustomer;
              customerEmail = fetchedCustomer?.email;
            } catch (e) {
              // Silently fail
            }
          }
          
          if (!customerEmail) {
            return;
          }
          
          const sent = await emailService.sendOrderShippedEmail({
            to: customerEmail,
            order: fullOrder, // Use fullOrder which has all the items data
            fulfillment: fulfillment,
            customer: customer,
          });
          
          if (sent) {
            console.log("[FULFILLMENT EMAIL] ✅ Sent fulfillment shipped email to", customerEmail);
          } else {
            console.error("[FULFILLMENT EMAIL] Failed to send fulfillment shipped email");
          }
        } catch (error: any) {
          console.error("[FULFILLMENT EMAIL] Error sending email:", error.message);
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
    {
      matcher: "/admin/orders/:orderId/fulfillments/:fulfillmentId/shipments",
      middlewares: [sendShipmentEmailAfterCreate],
    },
  ],
});
