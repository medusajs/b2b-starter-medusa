// packages/shared/src/api-response.ts

/**
 * 📦 API Response Envelope - Standardized Response Format
 * Ensures consistent API contracts across all endpoints
 */

// ============================================================================
// Response Types
// ============================================================================

export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    meta?: PaginationMeta | Record<string, any>;
    request_id?: string;
}

export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        request_id?: string;
        timestamp?: string;
    };
}

export interface PaginationMeta {
    limit: number;
    offset?: number;
    page?: number;
    count: number;
    total: number;
}

// ============================================================================
// Error Codes (Namespaced)
// ============================================================================

export const ERROR_CODES = {
    // 4xx Client Errors
    E400_VALIDATION: "E400_VALIDATION",
    E400_INVALID_INPUT: "E400_INVALID_INPUT",
    E401_UNAUTHORIZED: "E401_UNAUTHORIZED",
    E401_INVALID_TOKEN: "E401_INVALID_TOKEN",
    E403_FORBIDDEN: "E403_FORBIDDEN",
    E403_CORS: "E403_CORS",
    E404_NOT_FOUND: "E404_NOT_FOUND",
    E409_CONFLICT: "E409_CONFLICT",
    E413_PAYLOAD_TOO_LARGE: "E413_PAYLOAD_TOO_LARGE",
    E429_RATE_LIMIT: "E429_RATE_LIMIT",

    // 5xx Server Errors
    E500_INTERNAL: "E500_INTERNAL",
    E502_BAD_GATEWAY: "E502_BAD_GATEWAY",
    E503_UNAVAILABLE: "E503_UNAVAILABLE",
    E504_TIMEOUT: "E504_TIMEOUT",
} as const;

// ============================================================================
// Response Helpers
// ============================================================================

export class APIResponse {
    /**
     * Send success response with data
     */
    static success<T>(
        res: any, // Generic response object
        data: T,
        meta?: PaginationMeta | Record<string, any>,
        statusCode: number = 200
    ): void {
        const requestId = res.getHeader?.("X-Request-ID") as string;

        const response: SuccessResponse<T> = {
            success: true,
            data,
            ...(meta && { meta }),
            ...(requestId && { request_id: requestId }),
        };

        res.status?.(statusCode).json?.(response) || res.json(response);
    }

    /**
     * Send paginated response
     */
    static paginated<T>(
        res: any,
        data: T[],
        pagination: PaginationMeta,
        statusCode: number = 200
    ): void {
        this.success(res, data, pagination, statusCode);
    }

    /**
     * Send error response
     */
    static error(
        res: any,
        code: string,
        message: string,
        statusCode: number = 400,
        details?: any
    ): void {
        const requestId = res.getHeader?.("X-Request-ID") as string;

        const response: ErrorResponse = {
            success: false,
            error: {
                code,
                message,
                ...(details && { details }),
                ...(requestId && { request_id: requestId }),
                timestamp: new Date().toISOString(),
            },
        };

        res.status?.(statusCode).json?.(response) || res.json(response);
    }

    /**
     * Send validation error (400)
     */
    static validationError(
        res: any,
        message: string,
        details?: any
    ): void {
        this.error(res, ERROR_CODES.E400_VALIDATION, message, 400, details);
    }

    /**
     * Send unauthorized error (401)
     */
    static unauthorized(
        res: any,
        message: string = "Unauthorized"
    ): void {
        this.error(res, ERROR_CODES.E401_UNAUTHORIZED, message, 401);
    }

    /**
     * Send forbidden error (403)
     */
    static forbidden(
        res: any,
        message: string = "Forbidden"
    ): void {
        this.error(res, ERROR_CODES.E403_FORBIDDEN, message, 403);
    }

    /**
     * Send not found error (404)
     */
    static notFound(
        res: any,
        message: string = "Resource not found"
    ): void {
        this.error(res, ERROR_CODES.E404_NOT_FOUND, message, 404);
    }

    /**
     * Send rate limit error (429)
     */
    static rateLimit(
        res: any,
        retryAfter: number,
        limit: number,
        resetTime: string
    ): void {
        res.setHeader?.("Retry-After", String(retryAfter));

        this.error(
            res,
            ERROR_CODES.E429_RATE_LIMIT,
            "Rate limit exceeded",
            429,
            {
                retry_after: retryAfter,
                limit,
                reset_time: resetTime,
            }
        );
    }

    /**
     * Send internal server error (500)
     */
    static internalError(
        res: any,
        message: string = "Internal server error",
        details?: any
    ): void {
        this.error(res, ERROR_CODES.E500_INTERNAL, message, 500, details);
    }

    /**
     * Send service unavailable error (503)
     */
    static serviceUnavailable(
        res: any,
        message: string = "Service temporarily unavailable"
    ): void {
        this.error(res, ERROR_CODES.E503_UNAVAILABLE, message, 503);
    }
}

// ============================================================================
// Request ID Middleware
// ============================================================================

export function requestIdMiddleware(req: any, res: any, next: any) {
    const requestId = req.headers?.["x-request-id"] ||
        `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    res.setHeader?.("X-Request-ID", requestId);
    (req as any).requestId = requestId;

    next();
}

// ============================================================================
// API Version Middleware
// ============================================================================

export function apiVersionMiddleware(version: string) {
    return (req: any, res: any, next: any) => {
        res.setHeader?.("X-API-Version", version);
        next();
    };
}