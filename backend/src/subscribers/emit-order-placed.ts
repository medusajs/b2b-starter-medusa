import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

// This subscriber listens for order creation and manually emits order.placed event
export default async function emitOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("========== EMIT ORDER PLACED HANDLER ==========");
  console.log("[EmitOrderPlaced] Order created event received:", data.id);
  
  const eventBus = container.resolve(Modules.EVENT_BUS);
  
  try {
    // Manually emit order.placed event
    console.log("[EmitOrderPlaced] 📢 Manually emitting order.placed event...");
    await eventBus.emit({
      name: "order.placed",
      data: { id: data.id },
    });
    console.log("[EmitOrderPlaced] ✅ order.placed event emitted successfully!");
  } catch (error) {
    console.error("[EmitOrderPlaced] ❌ Failed to emit order.placed:", error);
  }
  
  console.log("========== EMIT ORDER PLACED END ==========");
}

export const config: SubscriberConfig = {
  event: "order.created",
  context: {
    subscriberId: "emit-order-placed-handler",
  },
};