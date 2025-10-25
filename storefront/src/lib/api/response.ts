/**
 * 🏗️ Standardized API Response Builder
 * 
 * Provides consistent response format across all API endpoints.
 * Includes metadata for debugging and monitoring.
 * 
 * @module lib/api/response
 */

import { NextResponse } from 'next/server'

/**
 * Success response type
 */
export type APISuccessResponse<T = any> = {
    success: true
    data: T
    meta: {
        timestamp: string
        requestId: string
        duration: number // milliseconds
        cached?: boolean
    }
}

/**
 * Error response type
 */
export type APIErrorResponse = {
    success: false
    error: {
        code: string
        message: string
        details?: any
        stack?: string // Only in development
    }
    meta: {
        timestamp: string
        requestId: string
        duration: number
    }
}

/**
 * Union type for all API responses
 */
export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse

/**
 * Standard error codes
 */
export const ErrorCodes = {
    // Client errors (4xx)
    INVALID_QUERY_PARAMS: 'INVALID_QUERY_PARAMS',
    INVALID_REQUEST_BODY: 'INVALID_REQUEST_BODY',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

    // Server errors (5xx)
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    CACHE_ERROR: 'CACHE_ERROR',
    FILE_READ_ERROR: 'FILE_READ_ERROR',

    // Business logic errors
    INVALID_CATEGORY: 'INVALID_CATEGORY',
    PRODUCTS_LOAD_FAILED: 'PRODUCTS_LOAD_FAILED',
    KITS_LOAD_FAILED: 'KITS_LOAD_FAILED',
    SIMULATION_FAILED: 'SIMULATION_FAILED',
    GEOCODING_FAILED: 'GEOCODING_FAILED'
} as const

export type ErrorCode = keyof typeof ErrorCodes

/**
 * Response builder with timing and request tracking
 */
export class ResponseBuilder {
    private startTime: number
    private requestId: string

    constructor(requestId?: string) {
        this.startTime = Date.now()
        this.requestId = requestId || this.generateRequestId()
    }

    /**
     * Generate a unique request ID
     */
    private generateRequestId(): string {
        // Format: timestamp-random
        const timestamp = Date.now().toString(36)
        const random = Math.random().toString(36).substring(2, 9)
        return `req_${timestamp}_${random}`
    }

    /**
     * Build successful response
     */
    success<T>(data: T, options?: {
        status?: number
        cached?: boolean
        headers?: Record<string, string>
    }): NextResponse<APISuccessResponse<T>> {
        const response: APISuccessResponse<T> = {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.requestId,
                duration: Date.now() - this.startTime,
                ...(options?.cached !== undefined && { cached: options.cached })
            }
        }

        return NextResponse.json(response, {
            status: options?.status || 200,
            headers: {
                'X-Request-ID': this.requestId,
                'X-Response-Time': `${response.meta.duration}ms`,
                ...(options?.headers || {})
            }
        })
    }

    /**
     * Build error response
     */
    error(
        code: ErrorCode | string,
        message: string,
        options?: {
            status?: number
            details?: any
            includeStack?: boolean
            headers?: Record<string, string>
        }
    ): NextResponse<APIErrorResponse> {
        const response: APIErrorResponse = {
            success: false,
            error: {
                code,
                message,
                ...(options?.details && { details: options.details }),
                ...(options?.includeStack && process.env.NODE_ENV === 'development' && {
                    stack: new Error().stack
                })
            },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.requestId,
                duration: Date.now() - this.startTime
            }
        }

        return NextResponse.json(response, {
            status: options?.status || 500,
            headers: {
                'X-Request-ID': this.requestId,
                'X-Response-Time': `${response.meta.duration}ms`,
                ...(options?.headers || {})
            }
        })
    }

    /**
     * Build validation error response (400)
     */
    validationError(message: string, details?: any): NextResponse<APIErrorResponse> {
        return this.error('INVALID_QUERY_PARAMS', message, {
            status: 400,
            details
        })
    }

    /**
     * Build not found error response (404)
     */
    notFound(resource: string, identifier?: string): NextResponse<APIErrorResponse> {
        return this.error(
            'RESOURCE_NOT_FOUND',
            identifier
                ? `${resource} with identifier '${identifier}' not found`
                : `${resource} not found`,
            { status: 404, details: { resource, identifier } }
        )
    }

    /**
     * Build rate limit error response (429)
     */
    rateLimitExceeded(retryAfter?: Date): NextResponse<APIErrorResponse> {
        return this.error('RATE_LIMIT_EXCEEDED', 'Too many requests', {
            status: 429,
            details: { retryAfter },
            headers: retryAfter ? {
                'Retry-After': retryAfter.toISOString(),
                'X-RateLimit-Reset': retryAfter.toISOString()
            } : undefined
        })
    }

    /**
     * Build service unavailable error response (503)
     */
    serviceUnavailable(service: string, details?: any): NextResponse<APIErrorResponse> {
        return this.error(
            'EXTERNAL_SERVICE_ERROR',
            `Service ${service} is currently unavailable`,
            { status: 503, details: { service, ...details } }
        )
    }

    /**
     * Get request ID for logging/tracking
     */
    getRequestId(): string {
        return this.requestId
    }

    /**
     * Get elapsed time since request started
     */
    getElapsedTime(): number {
        return Date.now() - this.startTime
    }
}

/**
 * Helper to extract request ID from headers
 */
export function getRequestId(request: Request): string | undefined {
    return request.headers.get('X-Request-ID') || undefined
}

/**
 * Helper to create ResponseBuilder with request ID from headers
 */
export function createResponseBuilder(request: Request): ResponseBuilder {
    const requestId = getRequestId(request)
    return new ResponseBuilder(requestId)
}

/**
 * Type guard for success response
 */
export function isSuccessResponse<T>(
    response: APIResponse<T>
): response is APISuccessResponse<T> {
    return response.success === true
}

/**
 * Type guard for error response
 */
export function isErrorResponse(
    response: APIResponse
): response is APIErrorResponse {
    return response.success === false
}
