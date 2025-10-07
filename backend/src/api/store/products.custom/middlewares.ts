import { MiddlewareRoute } from "@medusajs/medusa";

/**
 * Public product routes - no authentication middleware
 * This allows unauthenticated access to the product catalog
 */
export const storeProductsMiddlewares: MiddlewareRoute[] = [];