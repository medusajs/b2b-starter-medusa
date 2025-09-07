import { MiddlewareRoute } from "@medusajs/medusa";
import { authenticate } from "@medusajs/framework";

export const storeInvoiceMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET", "POST"],
    matcher: "/store/invoice*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
];
