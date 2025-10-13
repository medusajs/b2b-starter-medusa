import { authenticate } from "@medusajs/medusa";
import { MiddlewareRoute } from "@medusajs/framework";

export const storeOrdersMiddlewares: MiddlewareRoute[] = [
    {
        method: ["GET"],
        matcher: "/store/orders/*/fulfillment",
        middlewares: [authenticate("customer", ["session", "bearer"])],
    },
];
