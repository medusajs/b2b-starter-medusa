/**
 * 📸 Photogrammetry Middleware - File Upload & Validation
 * Shared utilities for drone imagery processing
 */

import { MiddlewareRoute } from "@medusajs/medusa";
import { photogrammetryMiddlewares } from "../../../utils/solar-cv-middleware";
import { apiVersionMiddleware } from "../../../utils/api-versioning";

// ============================================================================
// Export Pre-configured Middlewares
// ============================================================================

/**
 * Pre-configured middleware for photogrammetry endpoints
 * - Multiple image files (up to 50 images)
 * - JPEG/PNG/TIFF formats
 * - Max 50MB per file
 * - Uploads to photogrammetry directory
 */
export const storePhotogrammetryMiddlewares: MiddlewareRoute[] = [
    {
        method: "ALL",
        matcher: "/store/photogrammetry",
        middlewares: [apiVersionMiddleware()],
    },
    ...photogrammetryMiddlewares,
];