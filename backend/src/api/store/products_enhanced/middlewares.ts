import { MiddlewareRoute } from "@medusajs/medusa";
import { rateLimiter, RateLimiter } from "../../../utils/rate-limiter";

/**
 * Rate limiting middleware for enhanced products APIs
 * Moderate rate limiting for product enhancement features
 */
const enhancedProductsRateLimit = rateLimiter.middleware(RateLimiter.MODERATE);

/**
 * Public enhanced products routes with rate limiting
 */
export const storeProductsEnhancedMiddlewares: MiddlewareRoute[] = [
    {
        matcher: "/store/products_enhanced/*",
        middlewares: [enhancedProductsRateLimit],
    },
];