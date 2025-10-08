/**
 * 🛡️ YSH API Error Handler
 * Centralized error handling and response formatting for all APIs
 */

import { MedusaResponse } from "@medusajs/framework/http";
import { ZodError } from "zod";

// ============================================================================
// Error Types
// ============================================================================

export interface APIError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
}

export class APIErrorResponse extends Error {
    constructor(
        public statusCode: number,
        public error: APIError
    ) {
        super(error.message);
        this.name = "APIErrorResponse";
    }
}

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodes = {
    // Validation Errors
    VALIDATION_ERROR: "VALIDATION_ERROR",
    MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
    INVALID_FORMAT: "INVALID_FORMAT",

    // File Upload Errors
    FILE_TOO_LARGE: "FILE_TOO_LARGE",
    INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
    NO_FILE_UPLOADED: "NO_FILE_UPLOADED",

    // Service Errors
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    SERVICE_TIMEOUT: "SERVICE_TIMEOUT",
    EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

    // Business Logic Errors
    INSUFFICIENT_IMAGES: "INSUFFICIENT_IMAGES",
    PROCESSING_FAILED: "PROCESSING_FAILED",

    // System Errors
    INTERNAL_ERROR: "INTERNAL_ERROR",
    DATABASE_ERROR: "DATABASE_ERROR",
} as const;

// ============================================================================
// Error Handler
// ============================================================================

export class APIErrorHandler {
    private static instance: APIErrorHandler;
    private requestCounter = 0;

    static getInstance(): APIErrorHandler {
        if (!APIErrorHandler.instance) {
            APIErrorHandler.instance = new APIErrorHandler();
        }
        return APIErrorHandler.instance;
    }

    /**
     * Handle API errors and format response
     */
    handleError(error: unknown, res: MedusaResponse, requestId?: string): void {
        const apiError = this.parseError(error, requestId);

        // Log error for monitoring
        this.logError(apiError);

        // Send formatted response
        res.status(apiError.statusCode).json({
            success: false,
            error: apiError.error,
        });
    }

    /**
     * Parse various error types into standardized APIError
     */
    private parseError(error: unknown, requestId?: string): APIErrorResponse {
        // Handle known error types
        if (error instanceof APIErrorResponse) {
            return error;
        }

        if (error instanceof ZodError) {
            return new APIErrorResponse(400, {
                code: ErrorCodes.VALIDATION_ERROR,
                message: "Validation failed",
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
                timestamp: new Date().toISOString(),
                requestId,
            });
        }

        // Handle file upload errors
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('file too large')) {
                return new APIErrorResponse(413, {
                    code: ErrorCodes.FILE_TOO_LARGE,
                    message: "File size exceeds maximum allowed limit",
                    timestamp: new Date().toISOString(),
                    requestId,
                });
            }

            if (message.includes('invalid file type') || message.includes('file type not allowed')) {
                return new APIErrorResponse(400, {
                    code: ErrorCodes.INVALID_FILE_TYPE,
                    message: "File type not supported",
                    timestamp: new Date().toISOString(),
                    requestId,
                });
            }

            if (message.includes('no file') || message.includes('file not found')) {
                return new APIErrorResponse(400, {
                    code: ErrorCodes.NO_FILE_UPLOADED,
                    message: "No file was uploaded",
                    timestamp: new Date().toISOString(),
                    requestId,
                });
            }

            if (message.includes('timeout')) {
                return new APIErrorResponse(504, {
                    code: ErrorCodes.SERVICE_TIMEOUT,
                    message: "Request timed out",
                    timestamp: new Date().toISOString(),
                    requestId,
                });
            }

            if (message.includes('service') && message.includes('unavailable')) {
                return new APIErrorResponse(503, {
                    code: ErrorCodes.SERVICE_UNAVAILABLE,
                    message: "External service temporarily unavailable",
                    timestamp: new Date().toISOString(),
                    requestId,
                });
            }
        }

        // Default to internal server error
        return new APIErrorResponse(500, {
            code: ErrorCodes.INTERNAL_ERROR,
            message: "An unexpected error occurred",
            details: process.env.NODE_ENV === 'development' ? error : undefined,
            timestamp: new Date().toISOString(),
            requestId,
        });
    }

    /**
     * Log error for monitoring and debugging
     */
    private logError(apiError: APIErrorResponse): void {
        const logData = {
            level: apiError.statusCode >= 500 ? 'error' : 'warn',
            statusCode: apiError.statusCode,
            error: apiError.error,
            timestamp: new Date().toISOString(),
        };

        // In production, this would integrate with your logging service
        if (process.env.NODE_ENV === 'development') {
            console.error('[API Error]', logData);
        } else {
            // Send to logging service (e.g., Winston, DataDog, etc.)
            // logger.error(logData);
        }
    }

    /**
     * Generate unique request ID
     */
    generateRequestId(): string {
        this.requestCounter = (this.requestCounter + 1) % 1000000;
        return `req_${Date.now()}_${this.requestCounter.toString().padStart(6, '0')}`;
    }
}

// ============================================================================
// Response Formatter
// ============================================================================

export class APIResponseFormatter {
    /**
     * Format successful response
     */
    static success<T>(
        data: T,
        meta?: {
            processingTime?: number;
            requestId?: string;
            pagination?: any;
        }
    ) {
        return {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                ...meta,
            },
        };
    }

    /**
     * Format paginated response
     */
    static paginated<T>(
        data: T[],
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        },
        meta?: { processingTime?: number; requestId?: string }
    ) {
        return {
            success: true,
            data,
            pagination,
            meta: {
                timestamp: new Date().toISOString(),
                ...meta,
            },
        };
    }

    /**
     * Format async job response
     */
    static asyncJob(
        jobId: string,
        status: 'queued' | 'processing' | 'completed' | 'failed',
        progress?: number,
        eta?: number,
        result?: any,
        error?: string
    ) {
        return {
            success: true,
            job: {
                id: jobId,
                status,
                progress,
                eta_seconds: eta,
                result,
                error,
                timestamp: new Date().toISOString(),
            },
        };
    }
}

// ============================================================================
// Middleware for Error Handling
// ============================================================================

export function withErrorHandler(
    handler: (req: any, res: any) => Promise<void>
) {
    return async (req: any, res: any) => {
        const errorHandler = APIErrorHandler.getInstance();
        const requestId = errorHandler.generateRequestId();

        // Add request ID to response headers
        res.setHeader('X-Request-ID', requestId);

        try {
            // Add request ID to request object
            (req as any).requestId = requestId;

            // Start timing
            const startTime = Date.now();
            (req as any).startTime = startTime;

            await handler(req, res);

            // Log successful requests (for monitoring)
            const processingTime = Date.now() - startTime;
            if (processingTime > 1000) { // Log slow requests
                console.warn(`[Slow Request] ${req.method} ${req.url} took ${processingTime}ms`);
            }

        } catch (error) {
            errorHandler.handleError(error, res, requestId);
        }
    };
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateFileUpload(
    file: any,
    options: {
        maxSize?: number; // in bytes
        allowedTypes?: string[];
        required?: boolean;
    } = {}
): void {
    const {
        maxSize = 50 * 1024 * 1024, // 50MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/tiff'],
        required = true,
    } = options;

    if (required && !file) {
        throw new APIErrorResponse(400, {
            code: ErrorCodes.NO_FILE_UPLOADED,
            message: "File is required",
            timestamp: new Date().toISOString(),
        });
    }

    if (file) {
        if (file.size > maxSize) {
            throw new APIErrorResponse(413, {
                code: ErrorCodes.FILE_TOO_LARGE,
                message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
                timestamp: new Date().toISOString(),
            });
        }

        if (!allowedTypes.includes(file.mimetype)) {
            throw new APIErrorResponse(400, {
                code: ErrorCodes.INVALID_FILE_TYPE,
                message: `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
                timestamp: new Date().toISOString(),
            });
        }
    }
}

export function validateMultipleFiles(
    files: any[],
    options: {
        minCount?: number;
        maxCount?: number;
        maxSize?: number;
        allowedTypes?: string[];
    } = {}
): void {
    const {
        minCount = 1,
        maxCount = 10,
        maxSize = 50 * 1024 * 1024,
        allowedTypes = ['image/jpeg', 'image/png', 'image/tiff'],
    } = options;

    if (!files || files.length === 0) {
        throw new APIErrorResponse(400, {
            code: ErrorCodes.NO_FILE_UPLOADED,
            message: "At least one file is required",
            timestamp: new Date().toISOString(),
        });
    }

    if (files.length < minCount) {
        throw new APIErrorResponse(400, {
            code: ErrorCodes.INSUFFICIENT_IMAGES,
            message: `At least ${minCount} files are required`,
            timestamp: new Date().toISOString(),
        });
    }

    if (files.length > maxCount) {
        throw new APIErrorResponse(400, {
            code: ErrorCodes.VALIDATION_ERROR,
            message: `Maximum ${maxCount} files allowed`,
            timestamp: new Date().toISOString(),
        });
    }

    files.forEach((file, index) => {
        try {
            validateFileUpload(file, { maxSize, allowedTypes, required: true });
        } catch (error) {
            if (error instanceof APIErrorResponse) {
                // Add file index to error message
                error.error.message = `File ${index + 1}: ${error.error.message}`;
                throw error;
            }
            throw error;
        }
    });
}