/**
 * 📸 Photogrammetry Middleware - File Upload & Validation
 * Shared utilities for drone imagery processing
 */

import { photogrammetryMiddlewares } from "../../../utils/solar-cv-middleware";

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
export const storePhotogrammetryMiddlewares = photogrammetryMiddlewares;