import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

console.log("==========================================");
console.log("LOADING DEBUG ALL EVENTS SUBSCRIBER");
console.log("Subscribing to ALL events");
console.log("==========================================");

export default async function debugAllEventsHandler({
  event: { name, data },
  container,
}: SubscriberArgs<any>) {
  console.log("==========================================");
  console.log("[DEBUG EVENT] Event fired:", name);
  console.log("[DEBUG EVENT] Event data:", JSON.stringify(data, null, 2));
  console.log("==========================================");
  
  // Log specifically for shipment/fulfillment related events
  if (name?.includes("shipment") || name?.includes("fulfillment") || name?.includes("order")) {
    console.log("🚨🚨🚨 IMPORTANT EVENT DETECTED 🚨🚨🚨");
    console.log(`Event Name: ${name}`);
    console.log(`Event Data:`, data);
    console.log("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨");
  }
}

export const config: SubscriberConfig = {
  event: "*", // Listen to ALL events
  context: {
    subscriberId: "debug-all-events-handler",
  },
};