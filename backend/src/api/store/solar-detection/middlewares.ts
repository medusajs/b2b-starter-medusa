import { MiddlewareRoute } from "@medusajs/medusa";
import { solarDetectionMiddlewares } from "../../../utils/solar-cv-middleware";

export const storeSolarDetectionMiddlewares: MiddlewareRoute[] = [
    ...solarDetectionMiddlewares,
];