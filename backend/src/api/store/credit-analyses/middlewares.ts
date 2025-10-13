import { authenticate } from "@medusajs/medusa";
import { MiddlewareRoute } from "@medusajs/framework";

export const storeCreditAnalysesMiddlewares: MiddlewareRoute[] = [
    {
        method: ["POST", "GET"],
        matcher: "/store/credit-analyses*",
        middlewares: [authenticate("customer", ["session", "bearer"])],
    },
];
