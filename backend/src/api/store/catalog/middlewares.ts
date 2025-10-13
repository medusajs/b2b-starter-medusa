import { MiddlewareRoute } from "@medusajs/medusa";
import { rateLimiter, RateLimiter } from "../../../utils/rate-limiter";

/**
 * Rate limiting middleware for catalog APIs
 * Moderate rate limiting for product catalog access
 */
const catalogRateLimit = rateLimiter.middleware(RateLimiter.MODERATE);

/**
 * Public catalog routes with rate limiting
 */
export const storeCatalogMiddlewares: MiddlewareRoute[] = [
    {
        matcher: "/store/catalog/*",
        middlewares: [catalogRateLimit],
    },
];

/**
 * Public catalog routes - no authentication middleware
 * This allows unauthenticated access to the product catalog
 */
export const storeCatalogMiddlewares: MiddlewareRoute[] = [];
