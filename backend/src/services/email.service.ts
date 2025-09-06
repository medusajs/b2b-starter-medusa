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
      sgMail.setApiKey(this.options.apiKey);
      this.logger.info("[EMAIL] SendGrid initialized");
    } else {
      this.logger.error("[EMAIL] SendGrid API key not found");
    }
  }

  async sendOrderPlacedEmail(data: {
    to: string;
    order: any;
    customer: any;
  }): Promise<boolean> {
    if (!this.options.apiKey || !this.options.orderPlacedTemplateId) {
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

      const [response] = await sgMail.send(msg);
      
      this.logger.info("[EMAIL] Order email sent", {
        to: data.to,
        orderId: data.order.id,
        displayId: data.order.display_id,
      });
      
      return true;
    } catch (error: any) {
      this.logger.error("[EMAIL] Failed to send order email", {
        to: data.to,
        orderId: data.order.id,
        error: error.message,
      });
      
      if (error.code === 401) {
        this.logger.error("[EMAIL] Invalid API key");
        return false;
      }
      
      if (error.code === 403) {
        this.logger.error("[EMAIL] Sender not verified");
        return false;
      }
      
      if (error.code === 400) {
        this.logger.error("[EMAIL] Invalid template ID");
        return false;
      }
      
      throw error;
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
      
      this.logger.info("[EMAIL] Customer confirmation email sent", {
        to: data.to,
      });
      
      return true;
    } catch (error: any) {
      this.logger.error("[EMAIL] Failed to send customer confirmation email", {
        to: data.to,
        error: error.message,
      });
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

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.orderShippedTemplateId,
        dynamicTemplateData: templateData,
      };

      const [response] = await sgMail.send(msg);
      
      this.logger.info("[EMAIL] Order shipped email sent", {
        to: data.to,
        orderId: data.order.id,
      });
      
      return true;
    } catch (error: any) {
      this.logger.error("[EMAIL] Failed to send order shipped email", {
        to: data.to,
        orderId: data.order.id,
        error: error.message,
      });
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

    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${data.token}`;
      
      const templateData = {
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        reset_url: resetUrl,
      };

      const msg = {
        to: data.to,
        from: this.options.fromEmail,
        templateId: this.options.customerResetPasswordTemplateId,
        dynamicTemplateData: templateData,
      };

      const [response] = await sgMail.send(msg);
      
      this.logger.info("[EMAIL] Password reset email sent", {
        to: data.to,
      });
    } catch (error: any) {
      this.logger.error("[EMAIL] Failed to send password reset email", {
        to: data.to,
        error: error.message,
      });
      throw error;
    }
  }

  private formatSendGridError(error: any): string {
    if (error.response?.body?.errors) {
      return error.response.body.errors.map((e: any) => e.message).join(', ');
    }
    return error.message || 'Unknown error';
  }
}