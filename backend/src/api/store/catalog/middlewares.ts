import { MiddlewareRoute } from "@medusajs/medusa";

/**
 * Public catalog routes - no authentication middleware
 * This allows unauthenticated access to the product catalog
 */
export const storeCatalogMiddlewares: MiddlewareRoute[] = [];
