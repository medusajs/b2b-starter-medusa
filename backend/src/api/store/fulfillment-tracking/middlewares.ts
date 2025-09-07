import { MiddlewareRoute } from "@medusajs/medusa";
import { authenticate } from "@medusajs/framework";

export const storeFulfillmentTrackingMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/fulfillment-tracking*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
];
