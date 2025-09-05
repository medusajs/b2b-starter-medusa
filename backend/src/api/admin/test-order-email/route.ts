import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { EMAIL_MODULE } from "../../../modules/email";
import { Modules } from "@medusajs/framework/utils";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { order_id, email } = req.body;
  
  if (!order_id) {
    return res.status(400).json({ error: "order_id is required" });
  }

  const emailService = req.scope.resolve(EMAIL_MODULE);
  const orderService = req.scope.resolve(Modules.ORDER);
  const customerService = req.scope.resolve(Modules.CUSTOMER);
  const logger = req.scope.resolve("logger");
  
  try {
    logger.info("[TEST EMAIL] Attempting to send order email", { order_id, email });
    
    // Get the order
    const order = await orderService.retrieveOrder(order_id, {
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
    
    logger.info("[TEST EMAIL] Order retrieved", {
      orderId: order.id,
      displayId: order.display_id,
      customerId: order.customer_id,
      total: order.total,
      items: order.items?.length,
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Get the customer
    let customer = null;
    let targetEmail = email;
    
    if (order.customer_id) {
      customer = await customerService.retrieveCustomer(order.customer_id);
      targetEmail = email || customer.email;
      
      logger.info("[TEST EMAIL] Customer retrieved", {
        customerId: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
      });
    }
    
    if (!targetEmail) {
      return res.status(400).json({ error: "No email address found. Provide email in request body." });
    }
    
    // Try to send the email
    logger.info("[TEST EMAIL] Sending email to", { targetEmail });
    
    const result = await emailService.sendOrderPlacedEmail({
      to: targetEmail,
      order: order,
      customer: customer || {
        email: targetEmail,
        first_name: "Test",
        last_name: "Customer",
      },
    });
    
    logger.info("[TEST EMAIL] Email send result", { result, targetEmail });
    
    return res.json({
      success: result,
      message: result ? "Email sent successfully" : "Email failed to send - check logs",
      details: {
        orderId: order.id,
        displayId: order.display_id,
        sentTo: targetEmail,
        customerFound: !!customer,
        orderTotal: order.total,
        itemCount: order.items?.length,
      },
    });
  } catch (error: any) {
    logger.error("[TEST EMAIL] Error sending test email", {
      error: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({
      error: "Failed to send test email",
      message: error.message,
    });
  }
};