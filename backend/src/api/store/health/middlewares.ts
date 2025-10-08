import { MiddlewareRoute } from "@medusajs/medusa";
import { apiVersionMiddleware } from "../../../utils/api-versioning";

export const storeHealthMiddlewares: MiddlewareRoute[] = [
    {
        method: "ALL",
        matcher: "/store/health",
        middlewares: [apiVersionMiddleware()],
    },
];