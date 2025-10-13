import { MiddlewareRoute } from "@medusajs/medusa";
import { rateLimiter, RateLimiter } from "../../../utils/rate-limiter";

/**
 * Rate limiting middleware for internal catalog APIs
 * Lenient rate limiting for internal catalog (high performance API)
 */
const internalCatalogRateLimit = rateLimiter.middleware(RateLimiter.LENIENT);

/**
 * Public internal catalog routes with rate limiting
 */
export const storeInternalCatalogMiddlewares: MiddlewareRoute[] = [
    {
        matcher: "/store/internal-catalog/*",
        middlewares: [internalCatalogRateLimit],
    },
];