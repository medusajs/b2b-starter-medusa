import { MiddlewareRoute } from "@medusajs/medusa";
import { solarDetectionMiddlewares } from "../../../utils/solar-cv-middleware";
import { apiVersionMiddleware } from "../../../utils/api-versioning";

export const storeSolarDetectionMiddlewares: MiddlewareRoute[] = [
    {
        method: "ALL",
        matcher: "/store/solar-detection",
        middlewares: [apiVersionMiddleware()],
    },
    ...solarDetectionMiddlewares,
];