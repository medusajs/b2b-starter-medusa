/**
 * 🎛️ YSH Solar CV Middleware - Rate Limiting, Auth, Validation
 * High-performance middleware stack for Computer Vision APIs
 */

import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http";
import { FEATURE_FLAGS, ERROR_CODES } from "../../utils/solar-cv-config";
import { RateLimiter } from "../../utils/rate-limiter";
import { APIResponse } from "../../utils/api-response";

// ============================================================================
// Rate Limiting Middleware (Distributed Redis-backed)
// ============================================================================

export function rateLimitMiddleware(
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
) {
    return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        if (!FEATURE_FLAGS.ENABLE_RATE_LIMITING) {
            return next();
        }

        try {
            const identifier = `cv:${(req.ip || req.headers["x-forwarded-for"] || "anonymous") as string}`;
            const rateLimiter = RateLimiter.getInstance();

            const result = await rateLimiter.checkLimit(identifier, {
                maxRequests,
                windowMs,
            });

            // Set rate limit headers (RFC 6585 compliant)
            res.setHeader("X-RateLimit-Limit", String(result.limit));
            res.setHeader("X-RateLimit-Remaining", String(result.remaining));
            res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

            if (!result.success) {
                const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
                APIResponse.rateLimit(
                    res,
                    retryAfter,
                    result.limit,
                    new Date(result.resetTime).toISOString()
                );
                return;
            }

            next();
        } catch (error) {
            console.error("[Rate Limiter] Error:", error);
            // On error, allow request to pass (fail-open)
            next();
        }
    };
}

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
        APIResponse.unauthorized(res, "Invalid or missing API key");
        return;
    }

    next();
}

// ============================================================================
// CORS Middleware for CV APIs (Production-hardened)
// ============================================================================

export function cvCorsMiddleware(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
    const origin = req.headers.origin as string;
    const isProd = process.env.NODE_ENV === "production";
    const allowedOriginsEnv = process.env.CV_CORS_ORIGINS;

    // Production: require explicit origins, deny wildcard
    if (isProd && !allowedOriginsEnv) {
        res.setHeader("Vary", "Origin");
        if (req.method === "OPTIONS") {
            APIResponse.forbidden(res, "CORS not configured for production");
            return;
        }

        APIResponse.forbidden(res, "Origin not allowed - CORS not configured");
        return;
    }

    // Parse allowed origins (no wildcard in production)
    const allowedOrigins = allowedOriginsEnv?.split(",").map(o => o.trim()) || (isProd ? [] : ["*"]);

    // Validate origin
    const allowWildcard = allowedOrigins.includes("*") && !isProd;
    const isAllowed = allowWildcard ||
        (origin && allowedOrigins.includes(origin)) ||
        (!isProd && !origin); // Allow no-origin in dev only

    if (isAllowed) {
        // In production, set specific origin; in dev, allow wildcard if configured
        const allowOrigin = origin || (allowWildcard ? "*" : allowedOrigins[0] || "*");

        res.setHeader("Access-Control-Allow-Origin", allowOrigin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization");
        res.setHeader("Access-Control-Max-Age", "86400");

        // Vary header for caching proxies
        if (!allowWildcard) {
            res.setHeader("Vary", "Origin");
        }
    } else {
        res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
        res.status(isAllowed ? 204 : 403).end();
        return;
    }

    if (!isAllowed && isProd) {
        APIResponse.forbidden(res, "Origin not allowed");
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

    APIResponse.internalError(res, "Internal server error");
}

// ============================================================================
// Request Size Validation Middleware
// ============================================================================

export function validateRequestSize(maxSizeMB: number = 10) {
    return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        const contentLength = parseInt(req.headers["content-length"] || "0", 10);
        const maxBytes = maxSizeMB * 1024 * 1024;

        if (contentLength > maxBytes) {
            APIResponse.error(
                res,
                "E413_PAYLOAD_TOO_LARGE",
                `Request body too large (max ${maxSizeMB}MB)`,
                413
            );
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
