import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function debugAllEventsHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  console.log("🔍 [DEBUG] Event received:", event.name, "with data:", event.data);
  
  // Specifically log auth events
  if (event.name.includes("auth") || event.name.includes("password") || event.name.includes("reset")) {
    console.log("🚨 [DEBUG] AUTH EVENT DETECTED:", event.name);
    console.log("🚨 [DEBUG] Event data:", JSON.stringify(event.data, null, 2));
  }
}

export const config: SubscriberConfig = {
  event: "*", // Listen to all events
};
