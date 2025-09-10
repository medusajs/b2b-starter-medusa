import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function passwordResetHandlerAlt({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  console.log("🚨🚨🚨 PASSWORD RESET SUBSCRIBER ALT TRIGGERED! 🚨🚨🚨");
  console.log("========== PASSWORD RESET SUBSCRIBER ALT START ==========");
  console.log("[PasswordResetAlt] Subscriber triggered with data:", data);
  
  const emailService = container.resolve("emailService") as EmailService;
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { entity_id: email, token, actor_type } = data;
  
  if (!token || !email) {
    console.log("❌ [PasswordResetAlt] Missing token or email in event data");
    return;
  }

  // Only handle customer password resets
  if (actor_type !== "customer") {
    console.log("❌ [PasswordResetAlt] Ignoring non-customer password reset:", actor_type);
    return;
  }

  try {
    console.log("🔍 [PasswordResetAlt] Looking up customer for email:", email);
    
    // Find customer by email
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: {
        email: email,
      },
    });

    if (customers.length === 0) {
      console.log("❌ [PasswordResetAlt] Customer not found for email:", email);
      return;
    }

    const customer = customers[0];
    console.log("👤 [PasswordResetAlt] Customer found:", {
      id: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`
    });

    // Send password reset email
    await emailService.sendPasswordResetEmail({
      to: email,
      customer: customer,
      token: token,
    });

    console.log("📧 [PasswordResetAlt] Password reset email sent successfully");
    console.log("========== PASSWORD RESET SUBSCRIBER ALT END ==========");

  } catch (error: any) {
    console.error("❌ [PasswordResetAlt] Error:", error);
  }
}

export const config: SubscriberConfig = {
  event: "auth.reset_password",
};
