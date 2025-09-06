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
    this.logger.info("[EMAIL] Attempting to send order placed email", {
      to: data.to,
      orderId: data.order.id,
      orderDisplayId: data.order.display_id,
      customerId: data.customer.id,
    });

    if (!this.options.apiKey) {
      this.logger.warn("[EMAIL] SendGrid not configured, skipping order placed email");
      return false;
    }

    try {
      const templateData = {
        order_id: data.order.id,
        order_display_id: data.order.display_id,
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        customer_email: data.customer.email,
        order_total: (data.order.total / 100).toFixed(2),
        currency: data.order.currency_code?.toUpperCase(),
        items: data.order.items?.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: (item.unit_price / 100).toFixed(2),
          total: ((item.unit_price * item.quantity) / 100).toFixed(2),
        })) || [],
        shipping_address: data.order.shipping_address,
        billing_address: data.order.billing_address,
      };

      console.log("[EMAIL] 📧 DETAILED EMAIL DATA BEING SENT:");
      console.log("  📬 TO:", data.to);
      console.log("  📤 FROM:", this.options.fromEmail);
      console.log("  🎨 TEMPLATE ID:", this.options.orderPlacedTemplateId);
      console.log("  📋 TEMPLATE DATA:");
      console.log("    🛒 Order ID:", templateData.order_id);
      console.log("    🏷️  Display ID:", templateData.order_display_id);
      console.log("    👤 Customer:", templateData.customer_name);
      console.log("    📧 Customer Email:", templateData.customer_email);
      console.log("    💰 Total:", `$${templateData.order_total} ${templateData.currency}`);
      console.log("    📦 Items Count:", templateData.items.length);
      
      if (templateData.items.length > 0) {
        console.log("    📋 ITEMS:");
        templateData.items.forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.title}`);
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

      this.logger.debug("[EMAIL] Order placed template data:", {
        orderId: templateData.order_id,
        displayId: templateData.order_display_id,
        total: templateData.order_total,
        currency: templateData.currency,
        itemsCount: templateData.items.length,
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

      const [response] = await sgMail.send(msg);
      
      console.log("[EMAIL] ✅ EMAIL SENT SUCCESSFULLY!");
      console.log("  📧 SENT TO:", data.to);
      console.log("  🛒 ORDER:", data.order.display_id);
      console.log("  📊 STATUS CODE:", response.statusCode);
      console.log("  🆔 MESSAGE ID:", response.headers['x-message-id']);
      console.log("  📅 SENT AT:", new Date().toISOString());
      console.log("  🎨 TEMPLATE USED:", this.options.orderPlacedTemplateId);
      
      this.logger.info("[EMAIL] ✅ Order placed email sent successfully", {
        to: data.to,
        orderId: data.order.id,
        statusCode: response.statusCode,
        messageId: response.headers['x-message-id'],
      });
      return true;
    } catch (error: any) {
      console.log("[EMAIL] ❌ EMAIL SEND FAILED!");
      console.log("  📧 ATTEMPTED TO:", data.to);
      console.log("  🛒 ORDER:", data.order.display_id);
      console.log("  ❌ ERROR:", error.message);
      console.log("  📊 STATUS CODE:", error.code);
      console.log("  📅 FAILED AT:", new Date().toISOString());
      console.log("  🎨 TEMPLATE ID:", this.options.orderPlacedTemplateId);
      if (error.response?.body) {
        console.log("  📋 SENDGRID RESPONSE:", JSON.stringify(error.response.body, null, 2));
      }
      
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