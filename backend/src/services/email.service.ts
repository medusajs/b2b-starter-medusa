import sgMail from "@sendgrid/mail";

export type EmailServiceOptions = {
  apiKey: string;
  fromEmail: string;
  customerConfirmationTemplateId: string;
  orderPlacedTemplateId: string;
  orderShippedTemplateId: string;
  customerResetPasswordTemplateId: string;
  paymentReminderTemplateId: string;
};

export default class EmailService {
  protected logger: any = console;
  protected options: EmailServiceOptions;

  constructor() {
    this.logger = {
      info: (...args: any[]) => {}, // Silent logger
      debug: (...args: any[]) => {},
      warn: (...args: any[]) => {},
      error: (...args: any[]) => {},
    };
    
    this.options = {
      apiKey: process.env.SENDGRID_API_KEY || "",
      fromEmail: process.env.SENDGRID_FROM || "noreply@example.com",
      customerConfirmationTemplateId: process.env.SENDGRID_CUSTOMER_CONFIRMATION_TEMPLATE || "",
      orderPlacedTemplateId: process.env.SENDGRID_ORDER_PLACED_TEMPLATE || "",
      orderShippedTemplateId: process.env.SENDGRID_ORDER_SHIPPED_TEMPLATE || "",
      customerResetPasswordTemplateId: process.env.SENDGRID_CUSTOMER_RESET_PASSWORD_TEMPLATE || "",
      paymentReminderTemplateId: process.env.SENDGRID_PAYMENT_REMINDER_TEMPLATE || "",
    };

    if (this.options.apiKey) {
      sgMail.setApiKey(this.options.apiKey);
    }
  }

  async sendOrderPlacedEmail(data: {
    to: string;
    order: any;
    customer: any;
  }): Promise<boolean> {
    console.log("🚀🚀🚀 ===========================================");
    console.log("🚀🚀🚀 [EMAIL SERVICE] sendOrderPlacedEmail CALLED!");
    console.log("🚀 [EMAIL SERVICE] To:", data.to);
    console.log("🚀 [EMAIL SERVICE] Order ID:", data.order?.id);
    console.log("🚀 [EMAIL SERVICE] Order Display ID:", data.order?.display_id);
    console.log("🚀 [EMAIL SERVICE] Customer:", data.customer?.email);
    console.log("🚀 [EMAIL SERVICE] API Key exists:", !!this.options.apiKey);
    console.log("🚀 [EMAIL SERVICE] Template ID:", this.options.orderPlacedTemplateId);
    console.log("🚀 [EMAIL SERVICE] From Email:", this.options.fromEmail);
    console.log("🚀🚀🚀 ===========================================");
    
    if (!this.options.apiKey) {
      console.error("❌❌❌ [EMAIL SERVICE] NO SENDGRID API KEY!");
      console.error("❌❌❌ [EMAIL SERVICE] Please set SENDGRID_API_KEY environment variable");
      return false;
    }
    
    if (!this.options.orderPlacedTemplateId) {
      console.error("❌❌❌ [EMAIL SERVICE] NO ORDER PLACED TEMPLATE ID!");
      console.error("❌❌❌ [EMAIL SERVICE] Please set SENDGRID_ORDER_PLACED_TEMPLATE environment variable");
      return false;
    }

    try {
      // Calculate order totals
      const subtotal = data.order.items?.reduce((sum: number, item: any) => 
        sum + (item.unit_price * item.quantity), 0) || 0;
      const shippingTotal = data.order.shipping_methods?.reduce((sum: number, method: any) => 
        sum + (method.amount || 0), 0) || 0;
      const taxTotal = data.order.tax_total || 0;
      const orderTotal = data.order.total || subtotal + shippingTotal + taxTotal;
      
      // Format template data to match SendGrid template
      const templateData = {
        // Customer info
        first_name: data.customer.first_name || data.order.shipping_address?.first_name || "",
        last_name: data.customer.last_name || data.order.shipping_address?.last_name || "",
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        customer_email: data.customer.email,
        
        // Order info
        order_number: data.order.display_id || data.order.id,
        order_id: data.order.id,
        order_display_id: data.order.display_id,
        order_date: new Date(data.order.created_at || Date.now()).toLocaleDateString(),
        
        // Line items
        line_items: data.order.items?.map((item: any) => ({
          name: item.title || item.product_title || "Product",
          sku: item.variant?.sku || item.sku || "N/A",
          quantity: item.quantity || 1,
          price: ((item.unit_price || 0) / 100).toFixed(2),
          total: (((item.unit_price || 0) * (item.quantity || 1)) / 100).toFixed(2),
        })) || [],
        
        // Order summary
        order_summary: {
          subtotal: (subtotal / 100).toFixed(2),
          shipping: (shippingTotal / 100).toFixed(2),
          tax: (taxTotal / 100).toFixed(2),
          total: (orderTotal / 100).toFixed(2),
        },
        
        // Shipping address
        shipping_address: {
          first_name: data.order.shipping_address?.first_name || "",
          last_name: data.order.shipping_address?.last_name || "",
          address_1: data.order.shipping_address?.address_1 || "",
          address_2: data.order.shipping_address?.address_2 || "",
          city: data.order.shipping_address?.city || "",
          province: data.order.shipping_address?.province || data.order.shipping_address?.province_code || "",
          postal_code: data.order.shipping_address?.postal_code || "",
          country: data.order.shipping_address?.country || data.order.shipping_address?.country_code || "",
        },
        billing_address: data.order.billing_address,
      };

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.orderPlacedTemplateId,
        dynamicTemplateData: templateData,
      };
      
      console.log("📨 [EMAIL SERVICE] Sending email with SendGrid...");
      console.log("📨 [EMAIL SERVICE] Message object:", {
        to: msg.to,
        from: msg.from,
        templateId: msg.templateId,
        hasTemplateData: !!msg.dynamicTemplateData
      });
      console.log("📨 [EMAIL SERVICE] Template data keys:", Object.keys(templateData));

      const [response] = await sgMail.send(msg);
      
      console.log("✅✅✅ ===========================================");
      console.log("✅✅✅ [EMAIL SERVICE] EMAIL SENT SUCCESSFULLY!");
      console.log("✅✅✅ [EMAIL SERVICE] SendGrid Response Status:", response?.statusCode);
      console.log("✅✅✅ [EMAIL SERVICE] Email sent to:", data.to);
      console.log("✅✅✅ [EMAIL SERVICE] Order:", data.order.display_id);
      console.log("✅✅✅ ===========================================");
      
      return true;
    } catch (error: any) {
      console.error("❌❌❌ ===========================================");
      console.error("❌❌❌ [EMAIL SERVICE] FAILED TO SEND EMAIL!");
      console.error("❌❌❌ [EMAIL SERVICE] Error message:", error.message);
      console.error("❌❌❌ [EMAIL SERVICE] Error code:", error.code);
      console.error("❌❌❌ [EMAIL SERVICE] Error response:", error.response?.body);
      console.error("❌❌❌ [EMAIL SERVICE] Full error:", error);
      console.error("❌❌❌ ===========================================");
      return false;
    }
  }

  async sendCustomerConfirmationEmail(data: {
    to: string;
    customer: any;
  }): Promise<boolean> {
    if (!this.options.apiKey || !this.options.customerConfirmationTemplateId) {
      return false;
    }

    try {
      const templateData = {
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        customer_email: data.customer.email,
        company_name: data.customer.company?.name || "",
      };

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.customerConfirmationTemplateId,
        dynamicTemplateData: templateData,
      };

      const [response] = await sgMail.send(msg);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  async sendOrderShippedEmail(data: {
    to: string;
    order: any;
    fulfillment: any;
    customer: any;
  }): Promise<boolean> {
    if (!this.options.apiKey || !this.options.orderShippedTemplateId) {
      return false;
    }

    try {
      // Format tracking links for template
      const trackingLinks = data.fulfillment.tracking_numbers?.map((num: string, index: number) => ({
        number: num,
        url: data.fulfillment.tracking_links?.[index]?.url || "#"
      })) || [];

      // Format items for template - need to match order items with fulfillment items
      const formattedItems = data.fulfillment.items?.map((fulfillmentItem: any) => {
        // Find the corresponding order item
        const orderItem = data.order.items?.find((oi: any) => oi.id === fulfillmentItem.id);
        
        return {
          item: {
            title: orderItem?.title || orderItem?.product_title || fulfillmentItem.title || "Product",
            variant: {
              sku: orderItem?.variant_sku || orderItem?.variant?.sku || orderItem?.sku || "N/A"
            }
          },
          quantity: fulfillmentItem.quantity || 1,
        };
      }) || [];

      const templateData = {
        // Customer info - matching template variable names
        first_name: data.customer.first_name || "",
        last_name: data.customer.last_name || "",
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        customer_email: data.customer.email,
        
        // Order info - matching template variable names
        order_number: data.order.display_id || data.order.id,
        order_id: data.order.id,
        order_display_id: data.order.display_id,
        
        // Shipment info
        shipped_date: new Date().toLocaleDateString(),
        carrier: data.fulfillment.provider_id || "Standard Shipping",
        
        // Tracking info - as array for template
        tracking_links: trackingLinks,
        tracking_number: data.fulfillment.tracking_numbers?.[0] || "N/A", // Keep for backwards compatibility
        tracking_url: data.fulfillment.tracking_links?.[0]?.url || "", // Keep for backwards compatibility
        
        // Items - matching template structure
        items: formattedItems,
        
        // Address
        shipping_address: data.order.shipping_address,
      };

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.orderShippedTemplateId,
        dynamicTemplateData: templateData,
      };

      const [response] = await sgMail.send(msg);
      
      return true;
    } catch (error: any) {
      return false;
    }
  }

  async sendPasswordResetEmail(data: {
    to: string;
    customer: any;
    token: string;
  }): Promise<void> {
    if (!this.options.apiKey || !this.options.customerResetPasswordTemplateId) {
      return;
    }

    // Simple retry mechanism - try 3 times
    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${data.token}`;
        
        const templateData = {
          first_name: data.customer.first_name,
          reset_password_url: resetUrl,
        };

        const msg = {
          to: data.to,
          from: this.options.fromEmail,
          templateId: this.options.customerResetPasswordTemplateId,
          dynamicTemplateData: templateData,
        };

        const [response] = await sgMail.send(msg);
        return; // Success - exit retry loop
      } catch (error: any) {
        lastError = error;
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // All attempts failed
    throw lastError;
  }

  async sendPaymentReminderEmail(data: {
    to: string;
    customer: any;
    order: any;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    this.logger.info("📧 [EMAIL SERVICE] Starting payment reminder email send...");
    this.logger.info("📧 [EMAIL SERVICE] Email data:", {
      to: data.to,
      customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
      order_number: data.order.display_id,
      order_id: data.order.id
    });

    if (!this.options.apiKey) {
      const errorMsg = "SendGrid API key not configured";
      this.logger.error("❌ [EMAIL SERVICE] Error:", errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!this.options.paymentReminderTemplateId) {
      const errorMsg = "Payment reminder template ID not configured";
      this.logger.error("❌ [EMAIL SERVICE] Error:", errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      // Prepare template data for SendGrid
      const templateData = {
        first_name: data.customer.first_name || 'there',
        order_number: data.order.display_id,
        order_id: data.order.id,
        customer_name: `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim(),
        customer_email: data.customer.email,
        order_total: data.order.total ? (data.order.total / 100).toFixed(2) : '0.00',
        currency_code: data.order.currency_code || 'CAD'
      };

      this.logger.info("📧 [EMAIL SERVICE] Template data:", templateData);

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.paymentReminderTemplateId,
        dynamicTemplateData: templateData,
      };

      this.logger.info("📧 [EMAIL SERVICE] Sending email with SendGrid template...");
      this.logger.info("📧 [EMAIL SERVICE] Email message:", {
        to: msg.to,
        from: msg.from,
        templateId: msg.templateId,
        template_data: templateData
      });

      const [response] = await sgMail.send(msg);
      
      this.logger.info("✅ [EMAIL SERVICE] Email sent successfully!");
      this.logger.info("✅ [EMAIL SERVICE] SendGrid response:", {
        statusCode: response.statusCode,
        messageId: response.headers?.['x-message-id'],
        headers: response.headers
      });

      return { 
        success: true, 
        messageId: response.headers?.['x-message-id'] as string 
      };
    } catch (error: any) {
      const errorMsg = this.formatSendGridError(error);
      this.logger.error("❌ [EMAIL SERVICE] Failed to send email:", errorMsg);
      this.logger.error("❌ [EMAIL SERVICE] Full error:", error);
      
      return { 
        success: false, 
        error: errorMsg 
      };
    }
  }

  private formatSendGridError(error: any): string {
    if (error.response?.body?.errors) {
      return error.response.body.errors.map((e: any) => e.message).join(', ');
    }
    return error.message || 'Unknown error';
  }
}