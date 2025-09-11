import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

// Debug subscriber to log ALL order-related events
export default async function debugOrderEventsHandler({
  event,
}: SubscriberArgs<any>) {
  console.log("🔍 ==========================================");
  console.log("🔍 [DEBUG] ORDER EVENT RECEIVED!");
  console.log("🔍 Event Name:", event.name);
  console.log("🔍 Event Data:", JSON.stringify(event.data, null, 2));
  console.log("🔍 Timestamp:", new Date().toISOString());
  console.log("🔍 ==========================================");
}

export const config: SubscriberConfig = {
  event: [
    "order.*",
    "cart.completed",
    "payment.captured",
    "payment.authorized",
  ],
  context: {
    subscriberId: "debug-order-events-handler",
  },
};