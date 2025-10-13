/**
 * 🚦 YSH API Rate Limiter
 * Distributed rate limiting using Redis for API protection
 */

import { CacheManager } from './cache-manager';

// ============================================================================
// Rate Limit Configuration
// ============================================================================

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: any) => string;
    skip?: (req: any) => boolean;
}

const defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
};

// ============================================================================
// Rate Limit Result
// ============================================================================

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
    totalRequests: number;
    limit: number;
    windowMs: number;
}

// ============================================================================
// Rate Limiter
// ============================================================================

export class RateLimiter {
    private static instance: RateLimiter;
    private cache: CacheManager;
    private config: RateLimitConfig;

    private constructor(config: Partial<RateLimitConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
        this.cache = CacheManager.getInstance();
    }

    static getInstance(config?: Partial<RateLimitConfig>): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter(config);
        }
        return RateLimiter.instance;
    }

    // ============================================================================
    // Rate Limiting Logic
    // ============================================================================

    async checkLimit(
        identifier: string,
        config?: Partial<RateLimitConfig>
    ): Promise<RateLimitResult> {
        const effectiveConfig = { ...this.config, ...config };
        const now = Date.now();
        const windowStart = Math.floor(now / effectiveConfig.windowMs) * effectiveConfig.windowMs;

        const key = `ratelimit:${identifier}:${windowStart}`;

        try {
            // Get current request count
            const currentCount = await this.cache.get<number>(key) || 0;

            const result: RateLimitResult = {
                success: currentCount < effectiveConfig.maxRequests,
                remaining: Math.max(0, effectiveConfig.maxRequests - currentCount - 1),
                resetTime: windowStart + effectiveConfig.windowMs,
                totalRequests: currentCount,
                limit: effectiveConfig.maxRequests,
                windowMs: effectiveConfig.windowMs,
            };

            // Increment counter if within limit
            if (result.success) {
                await this.cache.set(key, currentCount + 1, Math.ceil(effectiveConfig.windowMs / 1000));
            }

            return result;

        } catch (error) {
            // If cache fails, allow request but log error
            console.warn('[RateLimiter] Cache error, allowing request:', error);
            return {
                success: true,
                remaining: effectiveConfig.maxRequests - 1,
                resetTime: now + effectiveConfig.windowMs,
                totalRequests: 0,
                limit: effectiveConfig.maxRequests,
                windowMs: effectiveConfig.windowMs,
            };
        }
    }

    // ============================================================================
    // Express Middleware
    // ============================================================================

    middleware(config?: Partial<RateLimitConfig>) {
        return async (req: any, res: any, next: any) => {
            const effectiveConfig = { ...this.config, ...config };

            // Check if request should be skipped
            if (effectiveConfig.skip && effectiveConfig.skip(req)) {
                return next();
            }

            // Generate identifier
            const identifier = effectiveConfig.keyGenerator
                ? effectiveConfig.keyGenerator(req)
                : this.getDefaultKey(req);

            try {
                const result = await this.checkLimit(identifier, effectiveConfig);

                // Set rate limit headers
                res.set({
                    'X-RateLimit-Limit': result.limit,
                    'X-RateLimit-Remaining': result.remaining,
                    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
                    'X-RateLimit-Window': result.windowMs,
                });

                if (!result.success) {
                    res.status(429).json({
                        success: false,
                        error: {
                            code: 'RATE_LIMIT_EXCEEDED',
                            message: 'Too many requests',
                            details: {
                                limit: result.limit,
                                remaining: result.remaining,
                                resetTime: new Date(result.resetTime).toISOString(),
                                windowMs: result.windowMs,
                            },
                            timestamp: new Date().toISOString(),
                        },
                    });
                    return;
                }

                // Add rate limit info to request
                (req as any).rateLimit = result;

                next();

            } catch (error) {
                // If rate limiting fails, allow request
                console.error('[RateLimiter] Middleware error:', error);
                next();
            }
        };
    }

    // ============================================================================
    // Predefined Rate Limit Configurations
    // ============================================================================

    static readonly STRICT = {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 requests per minute
    };

    static readonly MODERATE = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // 100 requests per 15 minutes
    };

    static readonly LENIENT = {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 1000, // 1000 requests per hour
    };

    static readonly API_HEAVY = {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 50, // 50 requests per hour for heavy APIs
    };

    // ============================================================================
    // Key Generators
    // ============================================================================

    static byIP(req: any): string {
        return req.ip || req.connection.remoteAddress || 'unknown';
    }

    static byUserId(req: any): string {
        return req.user?.id || req.session?.userId || 'anonymous';
    }

    static byAPIKey(req: any): string {
        return req.headers['x-api-key'] || 'no-key';
    }

    static byIPAndEndpoint(req: any): string {
        const ip = this.byIP(req);
        const endpoint = req.originalUrl || req.url;
        return `${ip}:${endpoint}`;
    }

    // ============================================================================
    // Private Methods
    // ============================================================================

    private getDefaultKey(req: any): string {
        // Default: rate limit by IP and endpoint
        return RateLimiter.byIPAndEndpoint(req);
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const rateLimiter = RateLimiter.getInstance();

// Export the class as well for advanced usage
export { RateLimiter };