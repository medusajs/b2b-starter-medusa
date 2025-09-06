import sgMail from "@sendgrid/mail";

export type EmailServiceOptions = {
  apiKey: string;
  fromEmail: string;
  customerConfirmationTemplateId: string;
  orderPlacedTemplateId: string;
  orderShippedTemplateId: string;
  customerResetPasswordTemplateId: string;
};

export default class EmailService {
  protected logger: any = console;
  protected options: EmailServiceOptions;

  constructor() {
    // Use console as the logger for now
    this.logger = {
      info: (...args: any[]) => console.log(...args),
      debug: (...args: any[]) => console.debug(...args),
      warn: (...args: any[]) => console.warn(...args),
      error: (...args: any[]) => console.error(...args),
    };
    
    this.options = {
      apiKey: process.env.SENDGRID_API_KEY || "",
      fromEmail: process.env.SENDGRID_FROM || "noreply@example.com",
      customerConfirmationTemplateId: process.env.SENDGRID_CUSTOMER_CONFIRMATION_TEMPLATE || "",
      orderPlacedTemplateId: process.env.SENDGRID_ORDER_PLACED_TEMPLATE || "",
      orderShippedTemplateId: process.env.SENDGRID_ORDER_SHIPPED_TEMPLATE || "",
      customerResetPasswordTemplateId: process.env.SENDGRID_CUSTOMER_RESET_PASSWORD_TEMPLATE || "",
    };

    if (this.options.apiKey) {
      // Mask the API key for logging (show only first and last 4 chars)
      const maskedKey = this.options.apiKey.length > 8 
        ? `${this.options.apiKey.substring(0, 4)}...${this.options.apiKey.substring(this.options.apiKey.length - 4)}`
        : 'HIDDEN';
      
      sgMail.setApiKey(this.options.apiKey);
      
      this.logger.info("[EMAIL] ✅ SendGrid email service initialized", {
        apiKeyConfigured: true,
        apiKeyMasked: maskedKey,
        fromEmail: this.options.fromEmail,
        templatesConfigured: {
          customerConfirmation: !!this.options.customerConfirmationTemplateId,
          orderPlaced: !!this.options.orderPlacedTemplateId,
          orderShipped: !!this.options.orderShippedTemplateId,
          passwordReset: !!this.options.customerResetPasswordTemplateId,
        },
        templateIds: {
          customerConfirmation: this.options.customerConfirmationTemplateId || 'NOT SET',
          orderPlaced: this.options.orderPlacedTemplateId || 'NOT SET',
          orderShipped: this.options.orderShippedTemplateId || 'NOT SET',
          passwordReset: this.options.customerResetPasswordTemplateId || 'NOT SET',
        },
      });
      
      // Test API key validity
      this.testSendGridConnection();
    } else {
      this.logger.error("[EMAIL] ❌ SendGrid API key not found in environment variables!");
      this.logger.error("[EMAIL] Please ensure SENDGRID_API_KEY is set in your .env file");
    }
  }

  async sendCustomerConfirmationEmail(data: {
    to: string;
    customer: any;
  }): Promise<boolean> {
    this.logger.info("[EMAIL] Attempting to send customer confirmation email", {
      to: data.to,
      customerId: data.customer.id,
      customerName: `${data.customer.first_name} ${data.customer.last_name}`,
    });

    if (!this.options.apiKey) {
      this.logger.warn("[EMAIL] SendGrid not configured, skipping customer confirmation email");
      return false;
    }

    try {
      const templateData = {
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        customer_email: data.customer.email,
        company_name: data.customer.company?.name || "",
      };

      this.logger.debug("[EMAIL] Customer confirmation template data:", templateData);

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.customerConfirmationTemplateId,
        dynamicTemplateData: templateData,
      };

      this.logger.debug("[EMAIL] Sending customer confirmation email with SendGrid", {
        to: msg.to,
        from: msg.from,
        templateId: msg.templateId,
      });

      const [response] = await sgMail.send(msg);
      
      this.logger.info("[EMAIL] ✅ Customer confirmation email sent successfully", {
        to: data.to,
        statusCode: response.statusCode,
        messageId: response.headers['x-message-id'],
      });
      return true;
    } catch (error: any) {
      this.logger.error("[EMAIL] ❌ Failed to send customer confirmation email", {
        to: data.to,
        error: error.message,
        statusCode: error.code,
        response: error.response?.body,
        details: this.formatSendGridError(error),
      });
      
      // Don't throw the error to prevent retries on configuration issues
      if (error.code === 401) {
        this.logger.error("[EMAIL] 🔐 AUTHENTICATION FAILED - SendGrid API Key is invalid!");
        this.logger.error("[EMAIL] Your API key: " + this.options.apiKey.substring(0, 15) + "...");
        this.logger.error("[EMAIL] Please generate a new API key from SendGrid dashboard");
        return false;
      }
      
      if (error.code === 403) {
        this.logger.error("[EMAIL] 🚫 FORBIDDEN - Check sender verification for: " + this.options.fromEmail);
        return false;
      }
      
      if (error.code === 400) {
        this.logger.error("[EMAIL] 📧 BAD REQUEST - Check template ID: " + this.options.customerConfirmationTemplateId);
        return false;
      }
      
      this.logger.error("[EMAIL] Unexpected error, will retry");
      throw error;
    }
  }

  async sendOrderPlacedEmail(data: {
    to: string;
    order: any;
    customer: any;
  }): Promise<boolean> {
    console.log("========== SENDORDERPLACEDEMAIL START ==========");
    console.log("[EMAIL VALIDATION] 📧 Validating email address:", data.to);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(data.to);
    console.log("[EMAIL VALIDATION] Email format valid:", isValidEmail);
    console.log("[EMAIL VALIDATION] Email:", data.to);
    console.log("[EMAIL VALIDATION] Email length:", data.to?.length);
    console.log("[EMAIL VALIDATION] Email type:", typeof data.to);
    
    if (!isValidEmail) {
      console.error("[EMAIL VALIDATION] ❌ INVALID EMAIL FORMAT!", {
        email: data.to,
        format: "Expected format: user@domain.com"
      });
      return false;
    }
    
    this.logger.info("[EMAIL] Attempting to send order placed email", {
      to: data.to,
      orderId: data.order.id,
      orderDisplayId: data.order.display_id,
      customerId: data.customer.id,
    });

    console.log("[EMAIL CONFIG CHECK] 🔧 Checking SendGrid configuration:");
    console.log("  API Key exists:", !!this.options.apiKey);
    console.log("  API Key length:", this.options.apiKey?.length);
    console.log("  API Key starts with 'SG.':", this.options.apiKey?.startsWith('SG.'));
    console.log("  From Email:", this.options.fromEmail);
    console.log("  Order Template ID:", this.options.orderPlacedTemplateId);
    console.log("  Order Template ID exists:", !!this.options.orderPlacedTemplateId);
    console.log("  Order Template ID length:", this.options.orderPlacedTemplateId?.length);

    if (!this.options.apiKey) {
      console.error("[EMAIL CONFIG] ❌ NO API KEY! SendGrid not configured");
      this.logger.warn("[EMAIL] SendGrid not configured, skipping order placed email");
      return false;
    }
    
    if (!this.options.orderPlacedTemplateId) {
      console.error("[EMAIL CONFIG] ❌ NO TEMPLATE ID! Order template not configured");
      console.error("  Expected env var: SENDGRID_ORDER_PLACED_TEMPLATE");
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
      
      // Format the template data to match SendGrid template variables
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
        
        // Line items (matching template variable names)
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
        
        // Addresses
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
        
        // Legacy fields (keep for compatibility)
        items: data.order.items?.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: (item.unit_price / 100).toFixed(2),
          total: ((item.unit_price * item.quantity) / 100).toFixed(2),
        })) || [],
        order_total: (orderTotal / 100).toFixed(2),
        currency: data.order.currency_code?.toUpperCase(),
      };

      console.log("[EMAIL] 📧 DETAILED EMAIL DATA BEING SENT:");
      console.log("  📬 TO:", data.to);
      console.log("  📤 FROM:", this.options.fromEmail);
      console.log("  🎨 TEMPLATE ID:", this.options.orderPlacedTemplateId);
      console.log("  📋 TEMPLATE DATA:");
      console.log("    👤 Customer Name:", templateData.first_name, templateData.last_name);
      console.log("    📧 Customer Email:", templateData.customer_email);
      console.log("    🛒 Order Number:", templateData.order_number);
      console.log("    📅 Order Date:", templateData.order_date);
      console.log("    💰 Order Summary:");
      console.log("       Subtotal: $", templateData.order_summary.subtotal);
      console.log("       Shipping: $", templateData.order_summary.shipping);
      console.log("       Tax: $", templateData.order_summary.tax);
      console.log("       Total: $", templateData.order_summary.total);
      console.log("    📦 Line Items Count:", templateData.line_items.length);
      
      if (templateData.line_items.length > 0) {
        console.log("    📋 LINE ITEMS:");
        templateData.line_items.forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.name}`);
          console.log(`         SKU: ${item.sku}`);
          console.log(`         Quantity: ${item.quantity}`);
          console.log(`         Price: $${item.price}`);
          console.log(`         Total: $${item.total}`);
        });
      }
      
      if (templateData.shipping_address) {
        console.log("    🚚 SHIPPING ADDRESS:");
        console.log(`      ${templateData.shipping_address.first_name} ${templateData.shipping_address.last_name}`);
        console.log(`      ${templateData.shipping_address.address_1}`);
        if (templateData.shipping_address.address_2) {
          console.log(`      ${templateData.shipping_address.address_2}`);
        }
        console.log(`      ${templateData.shipping_address.city}, ${templateData.shipping_address.province || ''} ${templateData.shipping_address.postal_code || ''}`);
        console.log(`      ${templateData.shipping_address.country_code?.toUpperCase()}`);
      }
      
      if (templateData.billing_address) {
        console.log("    💳 BILLING ADDRESS:");
        console.log(`      ${templateData.billing_address.first_name} ${templateData.billing_address.last_name}`);
        console.log(`      ${templateData.billing_address.address_1}`);
        if (templateData.billing_address.address_2) {
          console.log(`      ${templateData.billing_address.address_2}`);
        }
        console.log(`      ${templateData.billing_address.city}, ${templateData.billing_address.province || ''} ${templateData.billing_address.postal_code || ''}`);
        console.log(`      ${templateData.billing_address.country_code?.toUpperCase()}`);
      }

      console.log("[EMAIL] 🔍 COMPLETE TEMPLATE DATA BEING SENT TO SENDGRID:");
      console.log(JSON.stringify(templateData, null, 2));
      
      this.logger.debug("[EMAIL] Order placed template data:", {
        orderId: templateData.order_id,
        displayId: templateData.order_display_id,
        orderNumber: templateData.order_number,
        lineItemsCount: templateData.line_items.length,
      });

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.orderPlacedTemplateId,
        dynamicTemplateData: templateData,
      };

      console.log("[EMAIL] 📤 SENDING EMAIL VIA SENDGRID:");
      console.log("  📬 TO:", msg.to);
      console.log("  📤 FROM:", msg.from);
      console.log("  🎨 TEMPLATE ID:", msg.templateId);
      console.log("  📅 TIMESTAMP:", new Date().toISOString());

      this.logger.debug("[EMAIL] Sending order placed email with SendGrid", {
        to: msg.to,
        from: msg.from,
        templateId: msg.templateId,
      });

      console.log("[EMAIL] 🚀 ABOUT TO CALL SENDGRID API...");
      console.log("[EMAIL] SendGrid message object:", JSON.stringify({
        to: msg.to,
        from: msg.from,
        templateId: msg.templateId,
        dynamicTemplateDataKeys: Object.keys(msg.dynamicTemplateData || {})
      }, null, 2));
      
      const [response] = await sgMail.send(msg);
      
      console.log("[EMAIL] ✅ EMAIL SENT SUCCESSFULLY!");
      console.log("  📧 SENT TO:", data.to);
      console.log("  🛒 ORDER:", data.order.display_id);
      console.log("  📊 STATUS CODE:", response.statusCode);
      console.log("  🆔 MESSAGE ID:", response.headers['x-message-id']);
      console.log("  📅 SENT AT:", new Date().toISOString());
      console.log("  🎨 TEMPLATE USED:", this.options.orderPlacedTemplateId);
      console.log("  📨 FULL RESPONSE HEADERS:", JSON.stringify(response.headers, null, 2));
      
      this.logger.info("[EMAIL] ✅ Order placed email sent successfully", {
        to: data.to,
        orderId: data.order.id,
        statusCode: response.statusCode,
        messageId: response.headers['x-message-id'],
      });
      return true;
    } catch (error: any) {
      console.log("[EMAIL] ❌❌❌ EMAIL SEND FAILED! ❌❌❌");
      console.log("  📧 ATTEMPTED TO:", data.to);
      console.log("  🛒 ORDER:", data.order.display_id);
      console.log("  ❌ ERROR TYPE:", error.constructor.name);
      console.log("  ❌ ERROR MESSAGE:", error.message);
      console.log("  📊 ERROR CODE:", error.code);
      console.log("  📅 FAILED AT:", new Date().toISOString());
      console.log("  🎨 TEMPLATE ID:", this.options.orderPlacedTemplateId);
      console.log("  🔑 API KEY EXISTS:", !!this.options.apiKey);
      console.log("  📤 FROM EMAIL:", this.options.fromEmail);
      
      if (error.response) {
        console.log("  📋 SENDGRID RESPONSE STATUS:", error.response.statusCode);
        console.log("  📋 SENDGRID RESPONSE BODY:", JSON.stringify(error.response.body, null, 2));
        console.log("  📋 SENDGRID RESPONSE HEADERS:", JSON.stringify(error.response.headers, null, 2));
      }
      
      console.log("  🔍 FULL ERROR OBJECT:");
      console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      this.logger.error("[EMAIL] ❌ Failed to send order placed email", {
        to: data.to,
        orderId: data.order.id,
        error: error.message,
        statusCode: error.code,
        response: error.response?.body,
        details: this.formatSendGridError(error),
      });
      
      // Don't throw the error to prevent retries on configuration issues
      if (error.code === 401) {
        this.logger.error("[EMAIL] 🔐 AUTHENTICATION FAILED - SendGrid API Key is invalid!");
        this.logger.error("[EMAIL] Your API key: " + this.options.apiKey.substring(0, 15) + "...");
        this.logger.error("[EMAIL] Please generate a new API key from SendGrid dashboard");
        return false;
      }
      
      if (error.code === 403) {
        this.logger.error("[EMAIL] 🚫 FORBIDDEN - Check sender verification for: " + this.options.fromEmail);
        return false;
      }
      
      if (error.code === 400) {
        this.logger.error("[EMAIL] 📧 BAD REQUEST - Check template ID: " + this.options.orderPlacedTemplateId);
        return false;
      }
      
      this.logger.error("[EMAIL] Unexpected error, will retry");
      throw error;
    }
  }

  async sendOrderShippedEmail(data: {
    to: string;
    order: any;
    fulfillment: any;
    customer: any;
  }): Promise<boolean> {
    this.logger.info("[EMAIL] Attempting to send order shipped email", {
      to: data.to,
      orderId: data.order.id,
      fulfillmentId: data.fulfillment.id,
      customerId: data.customer.id,
    });

    if (!this.options.apiKey) {
      this.logger.warn("[EMAIL] SendGrid not configured, skipping order shipped email");
      return false;
    }

    try {
      const templateData = {
        order_id: data.order.id,
        order_display_id: data.order.display_id,
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        customer_email: data.customer.email,
        tracking_number: data.fulfillment.tracking_numbers?.[0] || "N/A",
        tracking_url: data.fulfillment.tracking_links?.[0]?.url || "",
        carrier: data.fulfillment.provider_id || "Standard Shipping",
        items: data.fulfillment.items?.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
        })) || [],
        shipping_address: data.order.shipping_address,
      };

      this.logger.debug("[EMAIL] Order shipped template data:", {
        orderId: templateData.order_id,
        displayId: templateData.order_display_id,
        trackingNumber: templateData.tracking_number,
        carrier: templateData.carrier,
        itemsCount: templateData.items.length,
      });

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.orderShippedTemplateId,
        dynamicTemplateData: templateData,
      };

      this.logger.debug("[EMAIL] Sending order shipped email with SendGrid", {
        to: msg.to,
        from: msg.from,
        templateId: msg.templateId,
      });

      const [response] = await sgMail.send(msg);
      
      this.logger.info("[EMAIL] ✅ Order shipped email sent successfully", {
        to: data.to,
        orderId: data.order.id,
        fulfillmentId: data.fulfillment.id,
        statusCode: response.statusCode,
        messageId: response.headers['x-message-id'],
      });
      return true;
    } catch (error: any) {
      this.logger.error("[EMAIL] ❌ Failed to send order shipped email", {
        to: data.to,
        orderId: data.order.id,
        fulfillmentId: data.fulfillment.id,
        error: error.message,
        statusCode: error.code,
        response: error.response?.body,
        details: this.formatSendGridError(error),
      });
      
      // Don't throw the error to prevent retries on configuration issues
      if (error.code === 401) {
        this.logger.error("[EMAIL] 🔐 AUTHENTICATION FAILED - SendGrid API Key is invalid!");
        this.logger.error("[EMAIL] Your API key: " + this.options.apiKey.substring(0, 15) + "...");
        return false;
      }
      
      if (error.code === 403) {
        this.logger.error("[EMAIL] 🚫 FORBIDDEN - Check sender verification for: " + this.options.fromEmail);
        return false;
      }
      
      if (error.code === 400) {
        this.logger.error("[EMAIL] 📧 BAD REQUEST - Check template ID: " + this.options.orderShippedTemplateId);
        return false;
      }
      
      this.logger.error("[EMAIL] Unexpected error, will retry");
      throw error;
    }
  }

  async sendPasswordResetEmail(data: {
    to: string;
    customer: any;
    token: string;
  }): Promise<void> {
    this.logger.info("[EMAIL] Attempting to send password reset email", {
      to: data.to,
      customerId: data.customer.id,
    });

    if (!this.options.apiKey) {
      this.logger.warn("[EMAIL] SendGrid not configured, skipping password reset email");
      return;
    }

    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${data.token}`;
      
      const templateData = {
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        reset_url: resetUrl,
      };

      this.logger.debug("[EMAIL] Password reset template data:", {
        customerName: templateData.customer_name,
        resetUrl: templateData.reset_url,
      });

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.customerResetPasswordTemplateId,
        dynamicTemplateData: templateData,
      };

      this.logger.debug("[EMAIL] Sending password reset email with SendGrid", {
        to: msg.to,
        from: msg.from,
        templateId: msg.templateId,
      });

      const [response] = await sgMail.send(msg);
      
      this.logger.info("[EMAIL] ✅ Password reset email sent successfully", {
        to: data.to,
        statusCode: response.statusCode,
        headers: response.headers,
      });
    } catch (error: any) {
      this.logger.error("[EMAIL] ❌ Failed to send password reset email", {
        to: data.to,
        error: error.message,
        statusCode: error.code,
        response: error.response?.body,
        details: this.formatSendGridError(error),
      });
      
      // Don't throw the error to prevent retries on configuration issues
      if (error.code === 401) {
        this.logger.error("[EMAIL] ⚠️ SendGrid API Key is invalid or expired. Please check your SENDGRID_API_KEY in .env");
        return;
      }
      throw error;
    }
  }

  private formatSendGridError(error: any): string {
    if (error.response?.body?.errors) {
      return error.response.body.errors.map((e: any) => e.message).join(', ');
    }
    return error.message || 'Unknown error';
  }

  private async testSendGridConnection() {
    try {
      // Test the API key by checking if we can access the API
      // This is a lightweight check that doesn't send an email
      this.logger.debug("[EMAIL] Testing SendGrid API key validity...");
      
      // Note: SendGrid doesn't have a direct "test" endpoint, but we can validate
      // the key is in the correct format
      if (!this.options.apiKey.startsWith('SG.')) {
        this.logger.warn("[EMAIL] ⚠️ SendGrid API key doesn't start with 'SG.' - it may be invalid");
      }
      
      if (this.options.apiKey.length < 50) {
        this.logger.warn("[EMAIL] ⚠️ SendGrid API key seems too short - it may be incomplete");
      }
    } catch (error: any) {
      this.logger.error("[EMAIL] Failed to validate SendGrid connection", error);
    }
  }
}