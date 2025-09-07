import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { EMAIL_MODULE } from "../../../modules/email";
import sgMail from "@sendgrid/mail";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const emailService = req.scope.resolve(EMAIL_MODULE);
  
  // Test configuration
  const config = {
    apiKey: process.env.SENDGRID_API_KEY ? {
      exists: true,
      startsWithSG: process.env.SENDGRID_API_KEY.startsWith('SG.'),
      length: process.env.SENDGRID_API_KEY.length,
      first15: process.env.SENDGRID_API_KEY.substring(0, 15),
      last4: process.env.SENDGRID_API_KEY.substring(process.env.SENDGRID_API_KEY.length - 4),
    } : { exists: false },
    fromEmail: process.env.SENDGRID_FROM || 'NOT SET',
    templates: {
      customerConfirmation: process.env.SENDGRID_CUSTOMER_CONFIRMATION_TEMPLATE || 'NOT SET',
      orderPlaced: process.env.SENDGRID_ORDER_PLACED_TEMPLATE || 'NOT SET',
      orderShipped: process.env.SENDGRID_ORDER_SHIPPED_TEMPLATE || 'NOT SET',
      passwordReset: process.env.SENDGRID_CUSTOMER_RESET_PASSWORD_TEMPLATE || 'NOT SET',
    }
  };

  // Test API key validity with a simple request
  let apiKeyValid = false;
  let apiKeyError: { code?: number; message?: string; response?: any } | null = null;
  
  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      // Try to send a test email to verify the API key
      const msg = {
        to: process.env.SENDGRID_FROM || 'test@example.com',
        from: process.env.SENDGRID_FROM || 'test@example.com',
        subject: 'Medusa B2B - Email Test',
        text: 'This is a test email to verify SendGrid configuration.',
        html: '<strong>This is a test email to verify SendGrid configuration.</strong>',
      };
      
      // Set mail_settings to sandbox mode to not actually send the email
      const testMsg = {
        ...msg,
        mailSettings: {
          sandboxMode: {
            enable: true,
          },
        },
      };
      
      const [response] = await sgMail.send(testMsg);
      apiKeyValid = response.statusCode === 200 || response.statusCode === 202;
    } catch (error: any) {
      apiKeyError = {
        code: error.code,
        message: error.message,
        response: error.response?.body,
      };
    }
  }

  return res.json({
    status: apiKeyValid ? 'CONFIGURED' : 'ERROR',
    configuration: config,
    apiKeyTest: {
      valid: apiKeyValid,
      error: apiKeyError,
    },
    recommendations: [
      !config.apiKey.exists && "❌ No API key found - add SENDGRID_API_KEY to .env",
      config.apiKey.exists && !(config.apiKey as any).startsWithSG && "⚠️ API key doesn't start with 'SG.' - may be invalid",
      config.apiKey.exists && (config.apiKey as any).length && (config.apiKey as any).length < 50 && "⚠️ API key seems too short",
      apiKeyError?.code === 401 && "🔐 API key is invalid - generate a new one from SendGrid",
      apiKeyError?.code === 403 && "🚫 API key lacks permissions or sender not verified",
      !apiKeyValid && !apiKeyError && config.apiKey.exists && "⚠️ Could not validate API key",
      apiKeyValid && "✅ SendGrid API key is valid and working!",
    ].filter(Boolean),
  });
};