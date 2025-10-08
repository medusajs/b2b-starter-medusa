/**
 * 📸 Photogrammetry Middleware - File Upload & Validation
 * Shared utilities for drone imagery processing
 */

import { SolarCVMulter, RequestValidator } from "../../../utils/solar-cv-middleware";

// ============================================================================
// File Upload Middleware
// ============================================================================

/**
 * Multer middleware for photogrammetry image uploads
 * - Multiple image files (5-50 images)
 * - JPEG/PNG/TIFF formats
 * - Max 50MB per file
 * - Total max 500MB
 */
export const uploadPhotogrammetryImages = SolarCVMulter.createMultiFieldMiddleware({
    fieldName: "images",
    maxCount: 50,
    allowedTypes: ["image/jpeg", "image/png", "image/tiff"],
    maxFileSize: 50 * 1024 * 1024, // 50MB per file
    maxTotalSize: 500 * 1024 * 1024, // 500MB total
    minCount: 5,
});

// ============================================================================
// Validation Middleware
// ============================================================================

/**
 * Validate photogrammetry request
 * - Ensure images are present
 * - Validate image quality and format
 */
export const validatePhotogrammetryRequest = RequestValidator.createValidationMiddleware({
    requiredFields: ["images"],
    customValidators: [
        {
            field: "images",
            validator: (value: any) => {
                if (!Array.isArray(value) || value.length < 5) {
                    throw new Error("At least 5 images required for photogrammetry");
                }
                if (value.length > 50) {
                    throw new Error("Maximum 50 images allowed");
                }
                return true;
            },
        },
    ],
});