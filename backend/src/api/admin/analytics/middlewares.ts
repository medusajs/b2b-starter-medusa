import { authenticate } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";

export const adminAnalyticsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/admin/growth-analytics*",
    middlewares: [
      authenticate("user", ["session", "bearer"])
    ],
  },
  {
    method: "ALL",
    matcher: "/admin/growth-auth-check*",
    middlewares: [authenticate("user", ["session", "bearer"])],
  },
  {
    method: "ALL",
    matcher: "/admin/product-analytics*",
    middlewares: [authenticate("user", ["session", "bearer"])],
  },
  {
    method: "ALL",
    matcher: "/admin/customer-analytics*",
    middlewares: [authenticate("user", ["session", "bearer"])],
  },
];
