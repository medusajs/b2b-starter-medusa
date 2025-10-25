import { MiddlewareRoute } from "@medusajs/medusa";
import { rateLimiter, RateLimiter } from "../../../utils/rate-limiter";

/**
 * Rate limiting middleware for products by SKU APIs
 * Moderate rate limiting for SKU search functionality
 */
const productsBySkuRateLimit = rateLimiter.middleware(RateLimiter.MODERATE);

/**
 * Public products by SKU routes with rate limiting
 */
export const storeProductsBySkuMiddlewares: MiddlewareRoute[] = [
    {
        matcher: "/store/products/by-sku/*",
        middlewares: [productsBySkuRateLimit],
    },
];