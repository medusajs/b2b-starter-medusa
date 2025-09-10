import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

console.log("🔧 [PasswordReset] Subscriber file loaded!");
console.log("🔧 [PasswordReset] EmailService import:", !!EmailService);

// Log when the subscriber is registered
console.log("🔧 [PasswordReset] Subscriber function defined");

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  console.log("🚨🚨🚨 PASSWORD RESET SUBSCRIBER TRIGGERED! 🚨🚨🚨");
  console.log("========== PASSWORD RESET SUBSCRIBER START ==========");
  console.log("[PasswordReset] Subscriber triggered with data:", data);
  console.log("[PasswordReset] Event timestamp:", new Date().toISOString());
  console.log("[PasswordReset] Container available:", !!container);
  
  const { entity_id: email, token, actor_type } = data;
  
  if (!token || !email) {
    console.log("❌ [PasswordReset] Missing token or email in event data");
    return;
  }

  // Only handle customer password resets
  if (actor_type !== "customer") {
    console.log("❌ [PasswordReset] Ignoring non-customer password reset:", actor_type);
    return;
  }

  // BULLETPROOF EMAIL SENDING WITH MULTIPLE FALLBACKS
  try {
    console.log("🔍 [PasswordReset] Looking up customer for email:", email);
    
    // Find customer by email
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: {
        email: email,
      },
    });

    if (customers.length === 0) {
      console.log("❌ [PasswordReset] Customer not found for email:", email);
      return;
    }

    const customer = customers[0];
    console.log("👤 [PasswordReset] Customer found:", {
      id: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`
    });

    // METHOD 1: Try EmailService (Primary)
    console.log("📧 [PasswordReset] METHOD 1: Trying EmailService...");
    try {
      const emailService = container.resolve("emailService") as EmailService;
      await emailService.sendPasswordResetEmail({
        to: email,
        customer: customer,
        token: token,
      });
      console.log("✅ [PasswordReset] EmailService method SUCCESS!");
      console.log("========== PASSWORD RESET SUBSCRIBER END ==========");
      return;
    } catch (emailServiceError: any) {
      console.error("❌ [PasswordReset] EmailService method failed:", emailServiceError.message);
    }

    // METHOD 2: Direct SendGrid (Fallback 1)
    console.log("📧 [PasswordReset] METHOD 2: Trying direct SendGrid...");
    try {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${token}`;
      
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM || "noreply@example.com",
        subject: "Reset Your Password",
        html: `
          <h2>Reset Your Password</h2>
          <p>Hello ${customer.first_name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>If the button doesn't work, copy and paste this link:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        text: `
          Reset Your Password
          
          Hello ${customer.first_name},
          
          You requested a password reset. Click the link below to reset your password:
          
          ${resetUrl}
          
          This link will expire in 15 minutes.
          
          If you didn't request this, please ignore this email.
        `
      };

      await sgMail.send(msg);
      console.log("✅ [PasswordReset] Direct SendGrid method SUCCESS!");
      console.log("========== PASSWORD RESET SUBSCRIBER END ==========");
      return;
    } catch (sendGridError: any) {
      console.error("❌ [PasswordReset] Direct SendGrid method failed:", sendGridError.message);
    }

    // METHOD 3: Simple HTTP Request (Fallback 2)
    console.log("📧 [PasswordReset] METHOD 3: Trying HTTP request fallback...");
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${token}`;
      
      // Log the reset URL for manual use
      console.log("🔗 [PasswordReset] RESET URL FOR MANUAL USE:", resetUrl);
      console.log("📧 [PasswordReset] Email should be sent to:", email);
      console.log("👤 [PasswordReset] Customer name:", `${customer.first_name} ${customer.last_name}`);
      
      // Try to send via a simple HTTP request to SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: email, name: `${customer.first_name} ${customer.last_name}` }],
            subject: 'Reset Your Password'
          }],
          from: { email: process.env.SENDGRID_FROM || "noreply@example.com" },
          content: [{
            type: 'text/html',
            value: `
              <h2>Reset Your Password</h2>
              <p>Hello ${customer.first_name},</p>
              <p>You requested a password reset. Click the link below to reset your password:</p>
              <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
              <p>If the button doesn't work, copy and paste this link:</p>
              <p>${resetUrl}</p>
              <p>This link will expire in 15 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `
          }]
        })
      });

      if (response.ok) {
        console.log("✅ [PasswordReset] HTTP request method SUCCESS!");
        console.log("========== PASSWORD RESET SUBSCRIBER END ==========");
        return;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (httpError: any) {
      console.error("❌ [PasswordReset] HTTP request method failed:", httpError.message);
    }

    // METHOD 4: Log for manual intervention (Last Resort)
    console.log("🚨 [PasswordReset] ALL METHODS FAILED - MANUAL INTERVENTION REQUIRED");
    console.log("📧 [PasswordReset] MANUAL EMAIL DETAILS:");
    console.log("   To:", email);
    console.log("   Customer:", `${customer.first_name} ${customer.last_name}`);
    console.log("   Reset URL:", `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${token}`);
    console.log("   Token:", token);
    console.log("========== PASSWORD RESET SUBSCRIBER END ==========");

  } catch (error: any) {
    console.error("❌ [PasswordReset] CRITICAL ERROR:", error);
    console.log("🚨 [PasswordReset] MANUAL INTERVENTION REQUIRED");
    console.log("📧 [PasswordReset] Email:", email);
    console.log("🔑 [PasswordReset] Token:", token);
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
  context: {
    subscriberId: "password-reset-handler",
  },
};

console.log("🔧 [PasswordReset] Subscriber config exported:", config);
