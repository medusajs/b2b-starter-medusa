import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import EmailService from "../../../services/email.service";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  console.log("========== MANUAL ORDER EMAIL TRIGGER ==========");
  
  const { order_id } = req.body as { order_id: string };
  
  if (!order_id) {
    return res.status(400).json({ error: "order_id is required" });
  }
  
  console.log("[TriggerEmail] Order ID:", order_id);
  
  try {
    const emailService = req.scope.resolve("emailService") as EmailService;
    const orderModuleService = req.scope.resolve(Modules.ORDER);
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    
    const order = await orderModuleService.retrieveOrder(order_id, {
      relations: [
        "items",
        "items.variant",
        "items.product",
        "shipping_address",
        "billing_address",
        "shipping_methods",
      ],
    });
    
    if (!order.customer_id) {
      return res.status(400).json({ error: "Order has no customer" });
    }
    
    const customer = await customerModuleService.retrieveCustomer(order.customer_id, {
      relations: ["addresses"],
    });
    
    if (!customer?.email) {
      return res.status(400).json({ error: "Customer has no email" });
    }
    
    console.log("[TriggerEmail] 📧 Sending email to:", customer.email);
    
    const sent = await emailService.sendOrderPlacedEmail({
      to: customer.email,
      order: order,
      customer: customer,
    });
    
    console.log("[TriggerEmail] Result:", sent ? "✅ SENT!" : "❌ FAILED!");
    
    return res.json({
      success: sent,
      message: sent ? "Email sent successfully" : "Email failed to send",
      order_id: order_id,
      email: customer.email,
    });
  } catch (error: any) {
    console.error("[TriggerEmail] Error:", error.message);
    return res.status(500).json({ 
      error: "Failed to send email",
      details: error.message 
    });
  } finally {
    console.log("========== TRIGGER EMAIL END ==========");
  }
};