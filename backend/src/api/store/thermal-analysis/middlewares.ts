import { MiddlewareRoute } from "@medusajs/medusa";
import { thermalAnalysisMiddlewares } from "../../../utils/solar-cv-middleware";

export const storeThermalAnalysisMiddlewares: MiddlewareRoute[] = [
    ...thermalAnalysisMiddlewares,
];