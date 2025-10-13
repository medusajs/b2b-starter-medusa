import { authenticate } from "@medusajs/medusa";
import { MiddlewareRoute } from "@medusajs/framework";

export const storeSolarCalculationsMiddlewares: MiddlewareRoute[] = [
    {
        method: ["POST", "GET"],
        matcher: "/store/solar_calculations*",
        middlewares: [authenticate("customer", ["session", "bearer"])],
    },
];
