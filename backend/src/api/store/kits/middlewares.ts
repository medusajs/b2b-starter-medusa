import { MiddlewareRoute } from "@medusajs/medusa";
import { rateLimiter, RateLimiter } from "../../../utils/rate-limiter";

/**
 * Rate limiting middleware for kits APIs
 * Strict rate limiting due to potential performance impact
 */
const kitsRateLimit = rateLimiter.middleware(RateLimiter.STRICT);

/**
 * Public kits routes with rate limiting
 */
export const storeKitsMiddlewares: MiddlewareRoute[] = [
    {
        matcher: "/store/kits/*",
        middlewares: [kitsRateLimit],
    },
];