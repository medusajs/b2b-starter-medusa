import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createOrderWorkflow } from "@medusajs/medusa/core-flows";
import { StepResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../modules/company";
import EmailService from "../../services/email.service";

createOrderWorkflow.hooks.orderCreated(
  async ({ order }, { container }) => {
    console.log("========== ORDER CREATED HOOK START ==========");
    console.log("[OrderCreated] Order created with ID:", order.id);
    
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    // Handle company linking (existing logic)
    if (order.metadata?.company_id) {
      await remoteLink.create({
        [Modules.ORDER]: {
          order_id: order.id,
        },
        [COMPANY_MODULE]: {
          company_id: order.metadata?.company_id,
        },
      });
    }

    // Send order confirmation email
    try {
      console.log("[OrderCreated] Sending order confirmation email...");
      
      const emailService = container.resolve("emailService") as EmailService;
      const orderModuleService = container.resolve(Modules.ORDER);
      const customerModuleService = container.resolve(Modules.CUSTOMER);
      
      // Get full order details with relations
      const fullOrder = await orderModuleService.retrieveOrder(order.id, {
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

      console.log("[OrderCreated] Order details:", {
        id: fullOrder.id,
        display_id: fullOrder.display_id,
        customer_id: fullOrder.customer_id,
        total: fullOrder.total,
        items_count: fullOrder.items?.length || 0,
      });

      if (fullOrder?.customer_id) {
        // Get customer details
        const customer = await customerModuleService.retrieveCustomer(fullOrder.customer_id, {
          relations: ["addresses"],
        });

        console.log("[OrderCreated] Customer details:", {
          customerId: customer.id,
          email: customer.email,
          name: `${customer.first_name} ${customer.last_name}`,
        });

        if (customer?.email) {
          console.log("[OrderCreated] 📧 EMAIL DETAILS:");
          console.log("  📬 TO:", customer.email);
          console.log("  👤 CUSTOMER:", `${customer.first_name} ${customer.last_name} (${customer.id})`);
          console.log("  🛒 ORDER:", `${fullOrder.display_id} (${fullOrder.id})`);
          console.log("  💰 TOTAL:", `${(fullOrder.total / 100).toFixed(2)} ${fullOrder.currency_code?.toUpperCase()}`);
          console.log("  📦 ITEMS:", fullOrder.items?.length || 0, "items");
          
          // Log detailed order items
          if (fullOrder.items && fullOrder.items.length > 0) {
            console.log("  📋 ORDER ITEMS:");
            fullOrder.items.forEach((item, index) => {
              console.log(`    ${index + 1}. ${item.title || 'Unknown Product'}`);
              console.log(`       Quantity: ${item.quantity}`);
              console.log(`       Unit Price: $${((item.unit_price || 0) / 100).toFixed(2)}`);
              console.log(`       Total: $${(((item.unit_price || 0) * (item.quantity || 0)) / 100).toFixed(2)}`);
            });
          }
          
          // Log shipping and billing addresses
          if (fullOrder.shipping_address) {
            console.log("  🚚 SHIPPING ADDRESS:");
            console.log(`    ${fullOrder.shipping_address.first_name} ${fullOrder.shipping_address.last_name}`);
            console.log(`    ${fullOrder.shipping_address.address_1}`);
            if (fullOrder.shipping_address.address_2) {
              console.log(`    ${fullOrder.shipping_address.address_2}`);
            }
            console.log(`    ${fullOrder.shipping_address.city}, ${fullOrder.shipping_address.province || ''} ${fullOrder.shipping_address.postal_code || ''}`);
            console.log(`    ${fullOrder.shipping_address.country_code?.toUpperCase()}`);
          }
          
          if (fullOrder.billing_address) {
            console.log("  💳 BILLING ADDRESS:");
            console.log(`    ${fullOrder.billing_address.first_name} ${fullOrder.billing_address.last_name}`);
            console.log(`    ${fullOrder.billing_address.address_1}`);
            if (fullOrder.billing_address.address_2) {
              console.log(`    ${fullOrder.billing_address.address_2}`);
            }
            console.log(`    ${fullOrder.billing_address.city}, ${fullOrder.billing_address.province || ''} ${fullOrder.billing_address.postal_code || ''}`);
            console.log(`    ${fullOrder.billing_address.country_code?.toUpperCase()}`);
          }

          console.log("[OrderCreated] 📤 Sending order placed email...");

          const emailSent = await emailService.sendOrderPlacedEmail({
            to: customer.email,
            order: fullOrder,
            customer: customer,
          });

          if (emailSent) {
            console.log("[OrderCreated] ✅ Order confirmation email sent successfully!");
            console.log("  📧 EMAIL SENT TO:", customer.email);
            console.log("  🛒 ORDER:", fullOrder.display_id);
            console.log("  📅 TIMESTAMP:", new Date().toISOString());
          } else {
            console.log("[OrderCreated] ❌ Order confirmation email FAILED to send!");
            console.log("  📧 ATTEMPTED TO:", customer.email);
            console.log("  🛒 ORDER:", fullOrder.display_id);
            console.log("  📅 TIMESTAMP:", new Date().toISOString());
          }
        } else {
          console.log(`[OrderCreated] ⚠️ Customer ${fullOrder.customer_id} has no email address - skipping email`);
        }
      } else {
        console.log(`[OrderCreated] Order ${order.id} has no customer - skipping email`);
      }
    } catch (error: any) {
      console.error("[OrderCreated] Error sending order confirmation email:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      // Don't throw the error - we don't want to break the order creation process
    }

    console.log("========== ORDER CREATED HOOK END ==========");
    return new StepResponse(undefined, order.id);
  },
  async (orderId: string | null, { container }) => {
    if (!orderId) {
      return;
    }

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    await remoteLink.dismiss({
      [Modules.ORDER]: {
        order_id: orderId,
      },
    });
  }
);
