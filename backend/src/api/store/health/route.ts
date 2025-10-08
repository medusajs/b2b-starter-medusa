/**
 * 🏥 YSH Solar CV Health Check API
 * Comprehensive health monitoring for all services
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SolarCVMetrics } from "../../../utils/solar-cv-service";
import { CacheManager } from "../../../utils/cache-manager";
import { RateLimiter } from "../../../utils/rate-limiter";
import { JobQueue } from "../../../utils/job-processor";
import { APIVersionManager } from "../../../utils/api-versioning";

// ============================================================================
// Health Check Types
// ============================================================================

interface HealthStatus {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime_seconds: number;
    version: string;
}

interface ServiceHealth extends HealthStatus {
    service: string;
    response_time_ms?: number;
    last_check: string;
    error?: string;
}

interface SystemHealth extends HealthStatus {
    services: {
        redis: ServiceHealth;
        "panel-segmentation": ServiceHealth;
        "pv-hawk": ServiceHealth;
        odm: ServiceHealth;
        rate_limiter: ServiceHealth;
        job_queue: ServiceHealth;
    };
    metrics: {
        total_requests: number;
        error_rate: number;
        avg_response_time_ms: number;
        cache_hit_rate: number;
    };
    resources: {
        memory_usage_mb: number;
        cpu_usage_percent: number;
    };
}

// ============================================================================
// Health Check Service
// ============================================================================

class HealthCheckService {
    private static startTime = Date.now();
    private static cacheManager = CacheManager.getInstance();
    private static rateLimiter = RateLimiter.getInstance();
    private static jobQueue = JobQueue.getInstance();

    /**
     * Check overall system health
     */
    static async checkSystemHealth(): Promise<SystemHealth> {
        const now = new Date().toISOString();
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);

        // Check individual services
        const [redisHealth, panelSegHealth, pvHawkHealth, odmHealth, rateLimiterHealth, jobQueueHealth] =
            await Promise.all([
                this.checkRedisHealth(),
                this.checkServiceHealth("panel-segmentation", "http://localhost:8001/api/v1/health"),
                this.checkServiceHealth("pv-hawk", "http://localhost:8002/api/v1/health"),
                this.checkServiceHealth("odm", "http://localhost:8003/api/v1/health"),
                this.checkRateLimiterHealth(),
                this.checkJobQueueHealth(),
            ]);

        // Calculate system status
        const services = { redisHealth, panelSegHealth, pvHawkHealth, odmHealth, rateLimiterHealth, jobQueueHealth };
        const unhealthyServices = Object.values(services).filter(s => s.status === "unhealthy").length;
        const degradedServices = Object.values(services).filter(s => s.status === "degraded").length;

        let systemStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
        if (unhealthyServices > 0) systemStatus = "unhealthy";
        else if (degradedServices > 0) systemStatus = "degraded";

        // Get metrics
        const allMetrics = SolarCVMetrics.getMetrics();
        const totalRequests = Object.values(allMetrics).reduce((sum, m) => sum + (m?.count || 0), 0);
        const totalErrors = Object.values(allMetrics).reduce((sum, m) => sum + (m?.errors || 0), 0);
        const totalDuration = Object.values(allMetrics).reduce((sum, m) => sum + (m?.totalDuration || 0), 0);
        const totalCacheHits = Object.values(allMetrics).reduce((sum, m) => sum + (m?.cacheHits || 0), 0);

        return {
            status: systemStatus,
            timestamp: now,
            uptime_seconds: uptime,
            version: APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION),
            services: {
                redis: redisHealth,
                "panel-segmentation": panelSegHealth,
                "pv-hawk": pvHawkHealth,
                odm: odmHealth,
                rate_limiter: rateLimiterHealth,
                job_queue: jobQueueHealth,
            },
            metrics: {
                total_requests: totalRequests,
                error_rate: totalRequests > 0 ? totalErrors / totalRequests : 0,
                avg_response_time_ms: totalRequests > 0 ? totalDuration / totalRequests : 0,
                cache_hit_rate: totalRequests > 0 ? totalCacheHits / (totalRequests + totalCacheHits) : 0,
            },
            resources: {
                memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                cpu_usage_percent: 0, // Would need additional monitoring library
            },
        };
    }

    /**
     * Check Redis health
     */
    private static async checkRedisHealth(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            const isConnected = await this.cacheManager.ping();
            const responseTime = Date.now() - startTime;

            return {
                service: "redis",
                status: isConnected ? "healthy" : "unhealthy",
                timestamp: new Date().toISOString(),
                uptime_seconds: 0, // Redis doesn't provide uptime
                version: "unknown",
                response_time_ms: responseTime,
                last_check: new Date().toISOString(),
            };
        } catch (error) {
            return {
                service: "redis",
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                uptime_seconds: 0,
                version: "unknown",
                response_time_ms: Date.now() - startTime,
                last_check: new Date().toISOString(),
                error: error.message,
            };
        }
    }

    /**
     * Check microservice health
     */
    private static async checkServiceHealth(serviceName: string, healthUrl: string): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(healthUrl, {
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' }
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;

            if (response.ok) {
                const healthData = await response.json();
                return {
                    service: serviceName,
                    status: healthData.status === "healthy" ? "healthy" : "degraded",
                    timestamp: new Date().toISOString(),
                    uptime_seconds: healthData.uptime_seconds || 0,
                    version: healthData.version || "unknown",
                    response_time_ms: responseTime,
                    last_check: new Date().toISOString(),
                };
            } else {
                return {
                    service: serviceName,
                    status: "unhealthy",
                    timestamp: new Date().toISOString(),
                    uptime_seconds: 0,
                    version: "unknown",
                    response_time_ms: responseTime,
                    last_check: new Date().toISOString(),
                    error: `HTTP ${response.status}`,
                };
            }
        } catch (error) {
            return {
                service: serviceName,
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                uptime_seconds: 0,
                version: "unknown",
                response_time_ms: Date.now() - startTime,
                last_check: new Date().toISOString(),
                error: error.message,
            };
        }
    }

    /**
     * Check rate limiter health
     */
    private static async checkRateLimiterHealth(): Promise<ServiceHealth> {
        try {
            // Check if rate limiter can perform operations
            const testKey = `health-check-${Date.now()}`;
            const result = await this.rateLimiter.checkLimit(testKey);

            return {
                service: "rate_limiter",
                status: result.success ? "healthy" : "degraded",
                timestamp: new Date().toISOString(),
                uptime_seconds: 0,
                version: "1.0.0",
                last_check: new Date().toISOString(),
            };
        } catch (error) {
            return {
                service: "rate_limiter",
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                uptime_seconds: 0,
                version: "1.0.0",
                last_check: new Date().toISOString(),
                error: error.message,
            };
        }
    }

    /**
     * Check job queue health
     */
    private static async checkJobQueueHealth(): Promise<ServiceHealth> {
        try {
            const stats = await this.jobQueue.getStats();

            return {
                service: "job_queue",
                status: stats.queued > 50 ? "degraded" : "healthy", // High queue indicates issues
                timestamp: new Date().toISOString(),
                uptime_seconds: 0,
                version: "1.0.0",
                last_check: new Date().toISOString(),
            };
        } catch (error) {
            return {
                service: "job_queue",
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                uptime_seconds: 0,
                version: "1.0.0",
                last_check: new Date().toISOString(),
                error: error.message,
            };
        }
    }
}

// ============================================================================
// HTTP Handlers
// ============================================================================

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const health = await HealthCheckService.checkSystemHealth();

        // Return appropriate HTTP status based on health
        const statusCode = health.status === "healthy" ? 200 :
            health.status === "degraded" ? 200 : 503; // Service Unavailable

        res.status(statusCode).json(health);
    } catch (error) {
        console.error("[Health Check] Error:", error);
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            uptime_seconds: Math.floor((Date.now() - HealthCheckService.startTime) / 1000),
            version: APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION),
            error: "Health check failed",
        });
    }
}

// ============================================================================
// Detailed Health Check (for monitoring systems)
// ============================================================================

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const health = await HealthCheckService.checkSystemHealth();
        const includeDetails = (req as any).query?.detailed === "true";

        let response = health;

        if (includeDetails) {
            // Add detailed metrics for each service
            const detailedMetrics = SolarCVMetrics.getMetrics();
            response = {
                ...health,
                detailed_metrics: detailedMetrics,
                cache_stats: await HealthCheckService.cacheManager.getStats(),
                job_queue_stats: HealthCheckService.jobQueue.getStats(),
            };
        }

        const statusCode = health.status === "healthy" ? 200 :
            health.status === "degraded" ? 200 : 503;

        res.status(statusCode).json(response);
    } catch (error) {
        console.error("[Detailed Health Check] Error:", error);
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: "Detailed health check failed",
        });
    }
}