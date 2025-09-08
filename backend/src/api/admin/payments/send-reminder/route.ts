import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import EmailService from "../../../../services/email.service";

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    console.log("📧 [SEND REMINDER API] Starting payment reminder process...");
    
    const { order_id } = req.body as { order_id: string };
    
    if (!order_id) {
      console.log("❌ [SEND REMINDER API] Error: Order ID is required");
      return res.status(400).json({ message: "Order ID is required" });
    }

    console.log("📧 [SEND REMINDER API] Processing order:", order_id);

    // Get services from the request scope
    const orderModuleService = req.scope.resolve(Modules.ORDER);
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    const emailService = req.scope.resolve("emailService") as EmailService;

    // Get the current order data
    const order = await orderModuleService.retrieveOrder(order_id);
    
    if (!order) {
      console.log("❌ [SEND REMINDER API] Error: Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("📦 [SEND REMINDER API] Order details:", {
      id: order.id,
      display_id: order.display_id,
      customer_id: order.customer_id,
      total: order.total
    });

    if (!order.customer_id) {
      console.log("❌ [SEND REMINDER API] Error: Order has no customer");
      return res.status(400).json({ message: "Order has no customer" });
    }

    // Get customer details
    const customer = await customerModuleService.retrieveCustomer(order.customer_id);
    
    if (!customer) {
      console.log("❌ [SEND REMINDER API] Error: Customer not found");
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customer.email) {
      console.log("❌ [SEND REMINDER API] Error: Customer has no email address");
      return res.status(400).json({ message: "Customer has no email address" });
    }

    console.log("👤 [SEND REMINDER API] Customer details:", {
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name
    });

    // Send the payment reminder email
    console.log("📧 [SEND REMINDER API] Sending payment reminder email...");
    const emailResult = await emailService.sendPaymentReminderEmail({
      to: customer.email,
      customer: customer,
      order: order
    });

    if (!emailResult.success) {
      console.log("❌ [SEND REMINDER API] Email sending failed:", emailResult.error);
      return res.status(500).json({ 
        message: "Failed to send email",
        error: emailResult.error 
      });
    }

    console.log("✅ [SEND REMINDER API] Email sent successfully! Message ID:", emailResult.messageId);

    // Update order metadata with reminder timestamp
    console.log("💾 [SEND REMINDER API] Updating order metadata with reminder timestamp...");
    const updatedOrder = await orderModuleService.updateOrders(order_id, {
      metadata: {
        ...order.metadata,
        reminder_last_sent_at: new Date().toISOString(),
        reminder_email_message_id: emailResult.messageId
      }
    });

    console.log("✅ [SEND REMINDER API] Order metadata updated successfully");

    const response = {
      success: true,
      message: "Payment reminder sent successfully",
      reminder_sent_at: new Date().toISOString(),
      email_message_id: emailResult.messageId,
      order: {
        id: updatedOrder.id,
        display_id: updatedOrder.display_id,
        reminder_last_sent_at: updatedOrder.metadata?.reminder_last_sent_at
      }
    };

    console.log("🎉 [SEND REMINDER API] Process completed successfully:", response);

    return res.json(response);

  } catch (error) {
    console.error("❌ [SEND REMINDER API] Unexpected error:", error);
    return res.status(500).json({ 
      message: "Failed to send reminder",
      error: error.message 
    });
  }
};
