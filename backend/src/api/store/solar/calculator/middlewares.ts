import { MiddlewareRoute } from "@medusajs/medusa";
import { apiVersionMiddleware } from "../../../../utils/api-versioning";

export const storeSolarCalculatorMiddlewares: MiddlewareRoute[] = [
    {
        method: "ALL",
        matcher: "/store/solar/calculator",
        middlewares: [apiVersionMiddleware()],
    },
];
