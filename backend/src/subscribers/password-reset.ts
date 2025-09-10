import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { captureToken } from "../api/store/send-password-reset-email/route";

export default async function passwordResetHandler({
  event: { data },
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const { entity_id: email, token, actor_type } = data;
  
  if (!token || !email) {
    return;
  }

  // Only handle customer password resets
  if (actor_type !== "customer") {
    return;
  }

  // Capture the token for the API to use
  try {
    captureToken(email, token);
  } catch (error: any) {
    console.error("Failed to capture password reset token:", error.message);
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
  context: {
    subscriberId: "password-reset-token-capture",
  },
};