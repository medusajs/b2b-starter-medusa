import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import EmailService from "../../../services/email.service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    console.log("🚨🚨🚨 ===========================================");
    console.log("🚨🚨🚨 [STORE API] ORDER CONFIRMATION EMAIL ENDPOINT CALLED!");
    console.log("🚨🚨🚨 ===========================================");
    console.log("🚨 [STORE API] Request body:", JSON.stringify(req.body, null, 2));
    console.log("🚨 [STORE API] Headers:", req.headers);
    
    const { order_id } = req.body as { order_id?: string };
    
    if (!order_id) {
      console.error("❌ [STORE API] No order_id provided in request body!");
      return res.status(400).json({ 
        success: false, 
        message: "order_id is required" 
      });
    }
    
    console.log("📧 [STORE API] Processing order ID:", order_id);
    console.log("📧 [STORE API] Timestamp:", new Date().toISOString());
    
    const emailService = req.scope.resolve("emailService") as EmailService;
    const orderModuleService = req.scope.resolve(Modules.ORDER);
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    
    // Get order without complex relations to avoid errors
    const order = await orderModuleService.retrieveOrder(order_id, {
      relations: [
        "items",
        "shipping_address",
        "billing_address",
      ],
    });

    console.log("📦📦📦 [STORE API] Order retrieved successfully!");
    console.log("📦 [STORE API] Order details:", {
      id: order.id,
      display_id: order.display_id,
      customer_id: order.customer_id,
      email: order.email,
      total: order.total,
      items_count: order.items?.length || 0,
      has_shipping_address: !!order.shipping_address,
      has_billing_address: !!order.billing_address,
    });

    // Try to get customer from auth token first
    let customer: any = null;
    let customerEmail: string | null = null;
    
    console.log("🔑 [STORE API] Checking auth token for customer...");
    const authToken = req.headers.authorization;
    
    if (authToken) {
      try {
        // Decode JWT to get customer_id
        const tokenPayload = authToken.split('.')[1];
        const decodedToken = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
        console.log("🔑 [STORE API] Decoded token:", {
          actor_id: decodedToken.actor_id,
          actor_type: decodedToken.actor_type,
          customer_id: decodedToken.app_metadata?.customer_id
        });
        
        const customerId = decodedToken.actor_id || decodedToken.app_metadata?.customer_id;
        
        if (customerId && customerId.startsWith('cus_')) {
          console.log("🔑 [STORE API] Found customer ID in token:", customerId);
          customer = await customerModuleService.retrieveCustomer(customerId, {
            relations: ["addresses"],
          });
          customerEmail = customer.email;
          console.log("✅ [STORE API] Got customer from auth token:", {
            id: customer.id,
            email: customer.email,
            name: `${customer.first_name} ${customer.last_name}`
          });
        }
      } catch (tokenError) {
        console.error("⚠️ [STORE API] Failed to get customer from token:", tokenError);
      }
    }
    
    // Fallback: try to get customer from order.customer_id
    if (!customer && order?.customer_id) {
      console.log("🔑 [STORE API] Fallback: Getting customer from order.customer_id:", order.customer_id);
      try {
        customer = await customerModuleService.retrieveCustomer(order.customer_id, {
          relations: ["addresses"],
        });
        customerEmail = customer.email;
      } catch (err) {
        console.error("⚠️ [STORE API] Failed to get customer from order:", err);
      }
    }
    
    // Last resort: use order email or shipping address
    if (!customerEmail) {
      customerEmail = order.email || order.shipping_address?.email;
      if (!customer && customerEmail) {
        customer = {
          id: order.customer_id || "guest",
          email: customerEmail,
          first_name: order.shipping_address?.first_name || "",
          last_name: order.shipping_address?.last_name || "",
        };
        console.log("🔑 [STORE API] Using fallback customer from order data");
      }
    }

    if (!customerEmail) {
      console.error("❌❌❌ [STORE API] NO EMAIL FOUND!");
      console.error("❌ [STORE API] Checked: auth token, order.customer_id, order.email, shipping_address.email");
      return res.status(400).json({ 
        success: false, 
        message: "Could not find customer email address" 
      });
    }

    console.log("👤👤👤 [STORE API] Customer data ready!");
    console.log("👤 [STORE API] Customer details:", {
      customerId: customer?.id || "guest",
      email: customerEmail,
      name: customer ? `${customer.first_name} ${customer.last_name}` : "Guest",
      has_addresses: customer?.addresses?.length > 0,
    });

    console.log("📨📨📨 [STORE API] CALLING EMAIL SERVICE...");
    console.log("📨 [STORE API] Email service method: sendOrderPlacedEmail");
    console.log("📨 [STORE API] Recipient email:", customerEmail);
    console.log("📨 [STORE API] Order display ID:", order.display_id);

    const emailSent = await emailService.sendOrderPlacedEmail({
      to: customerEmail,
      order: order,
      customer: customer || {
        id: "guest",
        email: customerEmail,
        first_name: order.shipping_address?.first_name || "",
        last_name: order.shipping_address?.last_name || "",
      },
    });
    
    console.log("📨 [STORE API] Email service returned:", emailSent);

    if (emailSent) {
      console.log("✅✅✅ ===========================================");
      console.log("✅✅✅ [STORE API] EMAIL SENT SUCCESSFULLY!");
      console.log("✅✅✅ Order ID:", order.display_id);
      console.log("✅✅✅ Email sent to:", customerEmail);
      console.log("✅✅✅ ===========================================");
      
      res.json({ 
        success: true, 
        message: "Order confirmation email sent successfully!",
        order_id: order.id,
        order_display_id: order.display_id,
        email: customerEmail
      });
    } else {
      console.error("❌❌❌ ===========================================");
      console.error("❌❌❌ [STORE API] EMAIL FAILED TO SEND!");
      console.error("❌❌❌ Order ID:", order.display_id);
      console.error("❌❌❌ Email:", customerEmail);
      console.error("❌❌❌ ===========================================");
      
      res.status(500).json({ 
        success: false, 
        message: "Order confirmation email failed to send" 
      });
    }
    
  } catch (error: any) {
    console.error("❌❌❌ ===========================================");
    console.error("❌❌❌ [STORE API] CRITICAL ERROR IN EMAIL ENDPOINT!");
    console.error("❌❌❌ Error message:", error.message);
    console.error("❌❌❌ Error stack:", error.stack);
    console.error("❌❌❌ Full error:", error);
    console.error("❌❌❌ ===========================================");
    
    res.status(500).json({ 
      success: false, 
      message: "Error sending order email",
      error: error.message 
    });
  }
}
