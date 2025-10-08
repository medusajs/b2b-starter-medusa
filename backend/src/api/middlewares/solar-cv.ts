/**
 * 🎛️ YSH Solar CV Middleware - Rate Limiting, Auth, Validation
 * High-performance middleware stack for Computer Vision APIs
 */

import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http";
import { FEATURE_FLAGS, ERROR_CODES } from "../../utils/solar-cv-config";

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

interface RateLimitStore {
    requests: Map<string, { count: number; resetAt: number }>;
}

const rateLimitStore: RateLimitStore = {
    requests: new Map(),
};

export function rateLimitMiddleware(
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
) {
    return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        if (!FEATURE_FLAGS.ENABLE_RATE_LIMITING) {
            return next();
        }

        const identifier = req.ip || req.headers["x-forwarded-for"] || "anonymous";
        const key = `cv:${identifier}`;
        const now = Date.now();

        let record = rateLimitStore.requests.get(key);

        if (!record || now > record.resetAt) {
            record = {
                count: 0,
                resetAt: now + windowMs,
            };
            rateLimitStore.requests.set(key, record);
        }

        record.count++;

        // Set rate limit headers
        res.setHeader("X-RateLimit-Limit", maxRequests);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
        res.setHeader("X-RateLimit-Reset", new Date(record.resetAt).toISOString());

        if (record.count > maxRequests) {
            res.status(429).json({
                success: false,
                error: "Rate limit exceeded",
                error_code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
                retry_after: Math.ceil((record.resetAt - now) / 1000),
            });
            return;
        }

        next();
    };
}

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.requests.entries()) {
        if (now > record.resetAt + 300000) {
            rateLimitStore.requests.delete(key);
        }
    }
}, 300000);

// ============================================================================
// API Key Authentication Middleware
// ============================================================================

export function apiKeyAuthMiddleware(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
    const apiKey = req.headers["x-api-key"] as string;
    const validApiKeys = process.env.SOLAR_CV_API_KEYS?.split(",") || [];

    // Skip auth in development
    if (process.env.NODE_ENV === "development" && validApiKeys.length === 0) {
        return next();
    }

    if (!apiKey || !validApiKeys.includes(apiKey)) {
        res.status(401).json({
            success: false,
            error: "Invalid or missing API key",
            error_code: "E401",
        });
        return;
    }

    next();
}

// ============================================================================
// CORS Middleware for CV APIs
// ============================================================================

export function cvCorsMiddleware(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
    const allowedOrigins = process.env.CV_CORS_ORIGINS?.split(",") || ["*"];
    const origin = req.headers.origin as string;

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin || "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization");
        res.setHeader("Access-Control-Max-Age", "86400");
    }

    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }

    next();
}

// ============================================================================
// Request Logging Middleware
// ============================================================================

export function cvLoggingMiddleware(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
    const startTime = Date.now();
    const requestId = `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add request ID to headers
    res.setHeader("X-Request-ID", requestId);

    // Log request
    console.log(`[CV API] ${req.method} ${req.path}`, {
        requestId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    // Intercept response
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
        const duration = Date.now() - startTime;
        console.log(`[CV API] Response sent in ${duration}ms`, {
            requestId,
            status: res.statusCode,
            duration,
        });
        return originalJson(body);
    };

    next();
}

// ============================================================================
// Error Handling Middleware
// ============================================================================

export function cvErrorHandler(
    error: Error,
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    console.error("[CV API] Error:", {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    res.status(500).json({
        success: false,
        error: "Internal server error",
        error_code: "E500",
        request_id: res.getHeader("X-Request-ID"),
    });
}

// ============================================================================
// Request Size Validation Middleware
// ============================================================================

export function validateRequestSize(maxSizeMB: number = 10) {
    return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        const contentLength = parseInt(req.headers["content-length"] || "0", 10);
        const maxBytes = maxSizeMB * 1024 * 1024;

        if (contentLength > maxBytes) {
            res.status(413).json({
                success: false,
                error: `Request body too large (max ${maxSizeMB}MB)`,
                error_code: ERROR_CODES.IMAGE_TOO_LARGE,
            });
            return;
        }

        next();
    };
}

// ============================================================================
// Combined Middleware Stack
// ============================================================================

export function applyCVMiddleware(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    // Apply middleware chain
    cvCorsMiddleware(req, res, () => {
        cvLoggingMiddleware(req, res, () => {
            rateLimitMiddleware()(req, res, () => {
                validateRequestSize(50)(req, res, next);
            });
        });
    });
}
