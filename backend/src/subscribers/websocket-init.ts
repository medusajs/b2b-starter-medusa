/**
 * Subscriber for initializing WebSocket server on Medusa startup
 * 
 * Automatically hooks into HTTP server to enable WebSocket connections
 */

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function websocketInitSubscriber({
    container,
}: SubscriberArgs<any>) {
    // Get HTTP server instance from container
    const httpServer = container.resolve("httpServer");

    if (!httpServer) {
        console.warn("[WebSocket] HTTP server not found in container");
        return;
    }

    // Lazy import to avoid issues during build
    const { initializeWebSocketServer } = await import("../api/ws/monitoring/route");

    try {
        initializeWebSocketServer(httpServer);
        console.log("[WebSocket] ✅ Real-time monitoring server initialized");
    } catch (error) {
        console.error("[WebSocket] ❌ Failed to initialize:", error);
    }
}

export const config: SubscriberConfig = {
    event: "http.server_ready",
};
