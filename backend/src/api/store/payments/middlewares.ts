import { MiddlewareRoute } from "@medusajs/framework";
import { authenticate } from "@medusajs/framework";

export const storePaymentsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/payments*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
];
