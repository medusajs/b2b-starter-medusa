/**
 * 🔧 YSH Solar CV Middleware Utilities
 * Shared middleware utilities for file uploads and validation
 */

import { MiddlewareRoute } from "@medusajs/medusa";
import multer from "multer";
import path from "path";
import fs from "fs";
import { FileUpload, FileUtils, ValidationError } from "../utils/solar-cv-service";
import { rateLimiter, RateLimiter } from "./rate-limiter";

// ============================================================================
// File Upload Configuration
// ============================================================================

export interface FileUploadConfig {
    dest: string;
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles?: number;
    preservePath?: boolean;
}

export class SolarCVMulter {
    private static uploaders: Map<string, multer.Multer> = new Map();

    static getUploader(config: FileUploadConfig): multer.Multer {
        const key = JSON.stringify(config);

        if (!this.uploaders.has(key)) {
            // Ensure upload directory exists
            if (!fs.existsSync(config.dest)) {
                fs.mkdirSync(config.dest, { recursive: true });
            }

            const storage = multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, config.dest);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = path.extname(file.originalname);
                    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
                }
            });

            const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
                if (config.allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new ValidationError(`Unsupported file type: ${file.mimetype}. Allowed: ${config.allowedTypes.join(', ')}`));
                }
            };

            const uploader = multer({
                storage,
                fileFilter,
                limits: {
                    fileSize: config.maxFileSize,
                    files: config.maxFiles || 1,
                },
            });

            this.uploaders.set(key, uploader);
        }

        return this.uploaders.get(key)!;
    }

    static createSingleFieldMiddleware(
        fieldName: string,
        config: Partial<FileUploadConfig> = {}
    ): MiddlewareRoute {
        const fullConfig: FileUploadConfig = {
            dest: path.join(process.cwd(), 'uploads'),
            maxFileSize: 50 * 1024 * 1024, // 50MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'],
            ...config,
        };

        const uploader = this.getUploader(fullConfig);

        return {
            method: "POST",
            matcher: `*/${fieldName.replace('[]', '')}`,
            middlewares: [uploader.single(fieldName)],
        };
    }

    static createArrayFieldMiddleware(
        fieldName: string,
        maxFiles: number = 10,
        config: Partial<FileUploadConfig> = {}
    ): MiddlewareRoute {
        const fullConfig: FileUploadConfig = {
            dest: path.join(process.cwd(), 'uploads'),
            maxFileSize: 50 * 1024 * 1024, // 50MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'],
            maxFiles,
            ...config,
        };

        const uploader = this.getUploader(fullConfig);

        return {
            method: "POST",
            matcher: `*/${fieldName}`,
            middlewares: [uploader.array(fieldName, maxFiles)],
        };
    }
}

// ============================================================================
// Request Validation Middleware
// ============================================================================

export class RequestValidator {
    static validateFilePresence(req: any, fieldName: string): FileUpload {
        const file = req.file || (req.files && req.files[0]);

        if (!file) {
            throw new ValidationError(`No ${fieldName} file provided`);
        }

        const validation = FileUtils.validateImageFile(file);
        if (!validation.valid) {
            throw new ValidationError(validation.error!);
        }

        return file;
    }

    static validateFilesPresence(req: any, fieldName: string, minFiles: number = 1): FileUpload[] {
        const files = req.files;

        if (!files || files.length === 0) {
            throw new ValidationError(`No ${fieldName} files provided`);
        }

        if (files.length < minFiles) {
            throw new ValidationError(`At least ${minFiles} ${fieldName} files required`);
        }

        // Validate each file
        for (const file of files) {
            const validation = FileUtils.validateImageFile(file);
            if (!validation.valid) {
                throw new ValidationError(validation.error!);
            }
        }

        return files;
    }
}

// ============================================================================
// Response Utilities
// ============================================================================

export class ResponseUtils {
    static createSuccessResponse<T>(
        data: T,
        metadata?: any
    ): { success: true; data: T; metadata?: any } {
        return {
            success: true,
            data,
            ...(metadata && { metadata }),
        };
    }

    static createErrorResponse(
        error: string,
        code: string = "INTERNAL_ERROR",
        statusCode: number = 500,
        details?: any
    ): { success: false; error: string; code: string; details?: any } {
        return {
            success: false,
            error,
            code,
            ...(details && { details }),
        };
    }

    static createHealthResponse(
        services: Record<string, any>,
        version: string = "1.0.0"
    ): any {
        const overallStatus = this.calculateOverallStatus(services);

        return {
            status: overallStatus,
            services,
            version,
            timestamp: new Date().toISOString(),
            uptime_seconds: process.uptime(),
        };
    }

    private static calculateOverallStatus(services: Record<string, any>): "healthy" | "degraded" | "unhealthy" {
        const statuses = Object.values(services).map((s: any) => s.status);

        if (statuses.every((status: any) => status === "up")) {
            return "healthy";
        }

        if (statuses.some((status: any) => status === "down")) {
            return "unhealthy";
        }

        return "degraded";
    }
}

// ============================================================================
// Error Handling Middleware
// ============================================================================

export class ErrorHandler {
    static handleError(error: any, res: any): void {
        console.error("API Error:", error);

        if (error instanceof ValidationError) {
            res.status(error.statusCode).json(
                ResponseUtils.createErrorResponse(error.message, error.code, error.statusCode, error.metadata)
            );
            return;
        }

        if (error.name === "ValidationError") {
            res.status(400).json(
                ResponseUtils.createErrorResponse("Validation failed", "VALIDATION_ERROR", 400, error.details)
            );
            return;
        }

        if (error.name === "TimeoutError") {
            res.status(408).json(
                ResponseUtils.createErrorResponse("Request timeout", "TIMEOUT_ERROR", 408)
            );
            return;
        }

        // Default error response
        res.status(500).json(
            ResponseUtils.createErrorResponse(
                error.message || "Internal server error",
                "INTERNAL_ERROR",
                500
            )
        );
    }

    static async cleanupFiles(files: FileUpload[]): Promise<void> {
        if (files && files.length > 0) {
            const filePaths = files.map(f => f.path);
            await FileUtils.cleanupTempFiles(filePaths);
        }
    }
}

// ============================================================================
// Pre-configured Middleware Routes
// ============================================================================

export const solarDetectionMiddlewares: MiddlewareRoute[] = [
    {
        method: "POST",
        matcher: "/store/solar-detection",
        middlewares: [
            rateLimiter.middleware(RateLimiter.API_HEAVY),
            SolarCVMulter.getUploader({
                dest: path.join(process.cwd(), "uploads", "solar-detection"),
                maxFileSize: 100 * 1024 * 1024, // 100MB for satellite imagery
                allowedTypes: ["image/jpeg", "image/png", "image/tiff", "image/webp"],
            }).single("image"),
        ],
    },
];

export const thermalAnalysisMiddlewares: MiddlewareRoute[] = [
    {
        method: "POST",
        matcher: "/store/thermal-analysis",
        middlewares: [
            rateLimiter.middleware(RateLimiter.API_HEAVY),
            SolarCVMulter.getUploader({
                dest: path.join(process.cwd(), "uploads", "thermal-analysis"),
                maxFileSize: 200 * 1024 * 1024, // 200MB for thermal videos
                allowedTypes: ["image/jpeg", "image/png", "image/tiff", "video/mp4"],
            }).single("thermalImage"),
        ],
    },
];

export const photogrammetryMiddlewares: MiddlewareRoute[] = [
    {
        method: "POST",
        matcher: "/store/photogrammetry",
        middlewares: [
            rateLimiter.middleware(RateLimiter.API_HEAVY),
            SolarCVMulter.getUploader({
                dest: path.join(process.cwd(), "uploads", "photogrammetry"),
                maxFileSize: 50 * 1024 * 1024, // 50MB per image
                allowedTypes: ["image/jpeg", "image/png", "image/tiff"],
                maxFiles: 50,
            }).array("images", 50),
        ],
    },
];