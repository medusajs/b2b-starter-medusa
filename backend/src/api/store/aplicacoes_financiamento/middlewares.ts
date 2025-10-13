import { authenticate } from "@medusajs/medusa";
import { MiddlewareRoute } from "@medusajs/framework";

export const storeFinancingApplicationsMiddlewares: MiddlewareRoute[] = [
    {
        method: ["POST", "GET"],
        matcher: "/store/financing-applications*",
        middlewares: [authenticate("customer", ["session", "bearer"])],
    },
];
