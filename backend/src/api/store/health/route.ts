/**
 * 🏥 YSH Store Health Check API
 * Comprehensive health monitoring for all 22+ store modules and services
 *
 * @swagger
 * /store/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: System health check
 *     description: Returns health status of all store modules and infrastructure services
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by specific module name
 *       - in: query
 *         name: infrastructure
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include infrastructure health checks
 *     responses:
 *       200:
 *         description: System is healthy or degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: System is unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { APIResponse } from "../../../utils/api-response";
import { SolarCVMetrics } from "../../../utils/solar-cv-service";
import { CacheManager } from "../../../utils/cache-manager";
import { RateLimiter } from "../../../utils/rate-limiter";
import { JobQueue } from "../../../utils/job-processor";
import { APIVersionManager } from "../../../utils/api-versioning";
import { getStoreHealthCheck } from "../../../utils/store-modules-health";

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
        const totalRequests = Object.values(allMetrics as any).reduce((sum: number, m: any) => sum + (m?.count || 0), 0);
        const totalErrors = Object.values(allMetrics as any).reduce((sum: number, m: any) => sum + (m?.errors || 0), 0);
        const totalDuration = Object.values(allMetrics as any).reduce((sum: number, m: any) => sum + (m?.totalDuration || 0), 0);
        const totalCacheHits = Object.values(allMetrics as any).reduce((sum: number, m: any) => sum + (m?.cacheHits || 0), 0);

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
                total_requests: totalRequests as number,
                error_rate: (totalRequests as number) > 0 ? (totalErrors as number) / (totalRequests as number) : 0,
                avg_response_time_ms: (totalRequests as number) > 0 ? (totalDuration as number) / (totalRequests as number) : 0,
                cache_hit_rate: (totalRequests as number) > 0 ? (totalCacheHits as number) / ((totalRequests as number) + (totalCacheHits as number)) : 0,
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
        const moduleFilter = (req as any).query?.module;
        const includeInfra = (req as any).query?.infrastructure !== "false";

        // Get comprehensive store modules health
        const storeHealthCheck = getStoreHealthCheck();
        const storeHealth = await storeHealthCheck.runHealthCheck();

        // Get infrastructure health
        let infraHealth = null;
        if (includeInfra) {
            infraHealth = await HealthCheckService.checkSystemHealth();
        }

        // If filtering by specific module
        if (moduleFilter) {
            const module = storeHealth.modules.find(m => m.name.toLowerCase() === moduleFilter.toLowerCase());
            if (!module) {
                APIResponse.notFound(res, "Module not found");
                return;
            }

            APIResponse.success(res, {
                timestamp: storeHealth.timestamp,
                module: module,
                infrastructure: infraHealth
            });
            return;
        }

        // Combine both health checks
        const combinedHealth = {
            timestamp: storeHealth.timestamp,
            overall_status: storeHealth.overall_status === "healthy" &&
                (!infraHealth || infraHealth.status === "healthy") ? "healthy" :
                storeHealth.overall_status === "unavailable" ||
                    (infraHealth && infraHealth.status === "unhealthy") ? "unavailable" : "degraded",
            store: {
                modules: storeHealth.modules,
                summary: storeHealth.summary
            },
            infrastructure: infraHealth,
            version: APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION)
        };

        // Return appropriate HTTP status based on health
        const statusCode = combinedHealth.overall_status === "healthy" ? 200 :
            combinedHealth.overall_status === "degraded" ? 200 : 503; // Service Unavailable

        res.setHeader("X-API-Version", combinedHealth.version);
        if (statusCode === 200) {
            APIResponse.success(res, combinedHealth);
        } else {
            APIResponse.serviceUnavailable(res, "System is unavailable");
        }
    } catch (error) {
        console.error("[Health Check] Error:", error);
        APIResponse.serviceUnavailable(res, "Health check failed: " + (error as any).message);
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
        const includeDetails = (req as any).query?.detailed === "true";
        const preloadModules = (req as any).query?.preload === "true";

        // Get comprehensive health
        const storeHealthCheck = getStoreHealthCheck();
        const storeHealth = await storeHealthCheck.runHealthCheck();
        const infraHealth = await HealthCheckService.checkSystemHealth();

        let response: any = {
            timestamp: storeHealth.timestamp,
            overall_status: storeHealth.overall_status === "healthy" &&
                infraHealth.status === "healthy" ? "healthy" :
                storeHealth.overall_status === "unavailable" ||
                    infraHealth.status === "unhealthy" ? "unavailable" : "degraded",
            store: {
                modules: storeHealth.modules,
                summary: storeHealth.summary
            },
            infrastructure: infraHealth,
            version: APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION)
        };

        if (includeDetails) {
            // Add detailed metrics for each service
            const detailedMetrics = SolarCVMetrics.getMetrics();
            response.detailed_metrics = {
                solar_cv: detailedMetrics,
                cache_stats: await (HealthCheckService as any).cacheManager.getStats(),
                job_queue_stats: await (HealthCheckService as any).jobQueue.getStats(),
            };
        }

        // Preload critical modules if requested
        if (preloadModules) {
            console.log("[Health Check] Preloading critical modules...");
            const preloadResults = await storeHealthCheck.preloadCriticalModules();
            response.preload = {
                status: "completed",
                results: preloadResults,
                timestamp: new Date().toISOString()
            };
        }

        const statusCode = response.overall_status === "healthy" ? 200 :
            response.overall_status === "degraded" ? 200 : 503;

        res.status(statusCode).json(response);
    } catch (error) {
        console.error("[Detailed Health Check] Error:", error);
        res.status(503).json({
            status: "unavailable",
            timestamp: new Date().toISOString(),
            error: "Detailed health check failed: " + error.message,
        });
    }
}
