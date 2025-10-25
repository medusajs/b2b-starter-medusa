/**
 * 🌐 YSH Solar CV API Client
 * Shared client library for all solar computer vision microservices
 * Provides consistent error handling, retry logic, and monitoring
 */

import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

export interface SolarCVConfig {
    panelSegmentation: {
        url: string;
        apiKey: string;
        timeout: number;
    };
    pvHawk: {
        url: string;
        apiKey: string;
        timeout: number;
    };
    odm: {
        url: string;
        apiKey: string;
        timeout: number;
    };
    retry: {
        maxAttempts: number;
        baseDelay: number;
        maxDelay: number;
    };
    circuitBreaker: {
        failureThreshold: number;
        recoveryTimeout: number;
    };
}

const defaultConfig: SolarCVConfig = {
    panelSegmentation: {
        url: process.env.PANEL_SEGMENTATION_SERVICE_URL || "http://localhost:8001",
        apiKey: process.env.PANEL_SEGMENTATION_API_KEY || "dev-key",
        timeout: 30000,
    },
    pvHawk: {
        url: process.env.PV_HAWK_SERVICE_URL || "http://localhost:8002",
        apiKey: process.env.PV_HAWK_API_KEY || "dev-key",
        timeout: 120000,
    },
    odm: {
        url: process.env.ODM_SERVICE_URL || "http://localhost:8003",
        apiKey: process.env.ODM_API_KEY || "dev-key",
        timeout: 600000,
    },
    retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
    },
    circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 60000,
    },
};

// ============================================================================
// Error Types
// ============================================================================

export class SolarCVError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number,
        public service: string,
        public retryable: boolean = false
    ) {
        super(message);
        this.name = "SolarCVError";
    }
}

export class CircuitBreakerError extends SolarCVError {
    constructor(service: string) {
        super(
            `Circuit breaker is open for service: ${service}`,
            "CIRCUIT_BREAKER_OPEN",
            503,
            service,
            true
        );
        this.name = "CircuitBreakerError";
    }
}

// ============================================================================
// Circuit Breaker Implementation
// ============================================================================

class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: "closed" | "open" | "half-open" = "closed";

    constructor(
        private failureThreshold: number,
        private recoveryTimeout: number
    ) { }

    async execute<T>(operation: () => Promise<T>, service: string): Promise<T> {
        if (this.state === "open") {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = "half-open";
            } else {
                throw new CircuitBreakerError(service);
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = "closed";
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.failureThreshold) {
            this.state = "open";
        }
    }
}

// ============================================================================
// Retry Logic
// ============================================================================

async function withRetry<T>(
    operation: () => Promise<T>,
    config: SolarCVConfig["retry"],
    service: string
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            // Don't retry non-retryable errors
            if (error instanceof SolarCVError && !error.retryable) {
                throw error;
            }

            // Don't retry on last attempt
            if (attempt === config.maxAttempts) {
                break;
            }

            // Exponential backoff
            const delay = Math.min(
                config.baseDelay * Math.pow(2, attempt - 1),
                config.maxDelay
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// ============================================================================
// Response Validation
// ============================================================================

function validateResponse<T>(
    data: any,
    schema: z.ZodSchema<T>,
    service: string
): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new SolarCVError(
                `Invalid response from ${service}: ${error.message}`,
                "INVALID_RESPONSE",
                502,
                service
            );
        }
        throw error;
    }
}

// ============================================================================
// Base API Client
// ============================================================================

export class SolarCVClient {
    private config: SolarCVConfig;
    private circuitBreakers: Map<string, CircuitBreaker>;

    constructor(config: Partial<SolarCVConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
        this.circuitBreakers = new Map();

        // Initialize circuit breakers
        Object.keys(this.config).forEach(service => {
            if (service !== "retry" && service !== "circuitBreaker") {
                this.circuitBreakers.set(
                    service,
                    new CircuitBreaker(
                        this.config.circuitBreaker.failureThreshold,
                        this.config.circuitBreaker.recoveryTimeout
                    )
                );
            }
        });
    }

    // ============================================================================
    // Panel Segmentation API
    // ============================================================================

    async detectPanels(imageFile: File): Promise<any> {
        const service = "panelSegmentation";
        const config = this.config.panelSegmentation;

        return this.callService(
            service,
            async () => {
                const formData = new FormData();
                formData.append("image", imageFile);

                const response = await fetch(`${config.url}/api/v1/detect`, {
                    method: "POST",
                    headers: {
                        "X-API-Key": config.apiKey,
                    },
                    body: formData,
                    signal: AbortSignal.timeout(config.timeout),
                });

                if (!response.ok) {
                    throw new SolarCVError(
                        `Panel segmentation service error: ${response.status}`,
                        "SERVICE_ERROR",
                        response.status,
                        service,
                        response.status >= 500
                    );
                }

                return await response.json();
            }
        );
    }

    // ============================================================================
    // PV-Hawk Thermal Analysis API
    // ============================================================================

    async analyzeThermal(thermalImageFile: File): Promise<any> {
        const service = "pvHawk";
        const config = this.config.pvHawk;

        return this.callService(
            service,
            async () => {
                const formData = new FormData();
                formData.append("thermalImage", thermalImageFile);

                const response = await fetch(`${config.url}/api/v1/analyze`, {
                    method: "POST",
                    headers: {
                        "X-API-Key": config.apiKey,
                    },
                    body: formData,
                    signal: AbortSignal.timeout(config.timeout),
                });

                if (!response.ok) {
                    throw new SolarCVError(
                        `PV-Hawk service error: ${response.status}`,
                        "SERVICE_ERROR",
                        response.status,
                        service,
                        response.status >= 500
                    );
                }

                return await response.json();
            }
        );
    }

    // ============================================================================
    // OpenDroneMap Photogrammetry API
    // ============================================================================

    async processPhotogrammetry(imageFiles: File[]): Promise<any> {
        const service = "odm";
        const config = this.config.odm;

        return this.callService(
            service,
            async () => {
                const formData = new FormData();
                imageFiles.forEach((file, index) => {
                    formData.append("images", file);
                });

                const response = await fetch(`${config.url}/api/v1/process`, {
                    method: "POST",
                    headers: {
                        "X-API-Key": config.apiKey,
                    },
                    body: formData,
                    signal: AbortSignal.timeout(config.timeout),
                });

                if (!response.ok) {
                    throw new SolarCVError(
                        `ODM service error: ${response.status}`,
                        "SERVICE_ERROR",
                        response.status,
                        service,
                        response.status >= 500
                    );
                }

                return await response.json();
            }
        );
    }

    // ============================================================================
    // Health Checks
    // ============================================================================

    async checkHealth(): Promise<Record<string, boolean>> {
        const services = ["panelSegmentation", "pvHawk", "odm"];
        const results: Record<string, boolean> = {};

        for (const service of services) {
            try {
                const config = (this.config as any)[service];
                const response = await fetch(`${config.url}/health`, {
                    signal: AbortSignal.timeout(5000),
                });
                results[service] = response.ok;
            } catch {
                results[service] = false;
            }
        }

        return results;
    }

    // ============================================================================
    // Private Methods
    // ============================================================================

    private async callService<T>(
        service: string,
        operation: () => Promise<T>
    ): Promise<T> {
        const circuitBreaker = this.circuitBreakers.get(service)!;

        return withRetry(
            () => circuitBreaker.execute(operation, service),
            this.config.retry,
            service
        );
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const solarCVClient = new SolarCVClient();

// ============================================================================
// Response Schemas for Validation
// ============================================================================

export const PanelDetectionResponseSchema = z.object({
    panels: z.array(z.object({
        id: z.string(),
        bbox: z.array(z.number()),
        confidence: z.number(),
        area: z.number(),
    })),
    totalPanels: z.number(),
    totalArea: z.number(),
    processingTime: z.number(),
    irradiance: z.number().optional(),
});

export const ThermalAnalysisResponseSchema = z.object({
    anomalies: z.array(z.object({
        id: z.string(),
        type: z.string(),
        severity: z.string(),
        confidence: z.number(),
        location: z.array(z.number()),
        temperature: z.number(),
        description: z.string(),
    })),
    overallHealth: z.string(),
    recommendations: z.array(z.string()),
    processingTime: z.number(),
    irradiance: z.number().optional(),
});

export const PhotogrammetryResponseSchema = z.object({
    roofModel: z.object({
        area: z.number(),
        perimeter: z.number(),
        orientation: z.number(),
        tilt: z.number(),
        geometry: z.any(),
    }),
    processingTime: z.number(),
    quality: z.string(),
    recommendations: z.array(z.string()),
    irradiance: z.number().optional(),
});

export type PanelDetectionResponse = z.infer<typeof PanelDetectionResponseSchema>;
export type ThermalAnalysisResponse = z.infer<typeof ThermalAnalysisResponseSchema>;
export type PhotogrammetryResponse = z.infer<typeof PhotogrammetryResponseSchema>;