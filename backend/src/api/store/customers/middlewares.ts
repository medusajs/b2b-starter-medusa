import { MiddlewareRoute } from "@medusajs/framework";
import { authenticate } from "@medusajs/medusa";

export const storeCustomersMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET", "DELETE", "PUT", "PATCH"],
    matcher: "/store/customers*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
];