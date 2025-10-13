import { MiddlewareRoute } from "@medusajs/medusa";
import { thermalAnalysisMiddlewares } from "../../../utils/solar-cv-middleware";
import { apiVersionMiddleware } from "../../../utils/api-versioning";

export const storeThermalAnalysisMiddlewares: MiddlewareRoute[] = [
    {
        method: "ALL",
        matcher: "/store/thermal-analysis",
        middlewares: [apiVersionMiddleware()],
    },
    ...thermalAnalysisMiddlewares,
];