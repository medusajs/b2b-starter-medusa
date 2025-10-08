/**
 * 🌐 YSH Solar CV Service Layer
 * Shared service layer for solar computer vision APIs
 * Provides common functionality for Python microservice communication
 */

import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

export interface ServiceConfig {
    url: string;
    apiKey: string;
    timeout: number;
    retries: number;
}

export class SolarCVConfig {
    private static config: Map<string, ServiceConfig> = new Map();

    static getServiceConfig(serviceName: string): ServiceConfig {
        if (!this.config.has(serviceName)) {
            const envUrl = process.env[`${serviceName.toUpperCase()}_SERVICE_URL`];
            const envKey = process.env[`${serviceName.toUpperCase()}_API_KEY`];
            const envTimeout = process.env[`${serviceName.toUpperCase()}_TIMEOUT`];
            const envRetries = process.env[`${serviceName.toUpperCase()}_RETRIES`];

            this.config.set(serviceName, {
                url: envUrl || this.getDefaultUrl(serviceName),
                apiKey: envKey || "dev-key",
                timeout: parseInt(envTimeout || "30000"),
                retries: parseInt(envRetries || "3"),
            });
        }

        return this.config.get(serviceName)!;
    }

    private static getDefaultUrl(serviceName: string): string {
        const portMap: Record<string, number> = {
            "panel-segmentation": 8001,
            "pv-hawk": 8002,
            "odm": 8003,
            "roof-analysis": 8004,
        };

        const port = portMap[serviceName] || 8000;
        return `http://localhost:${port}`;
    }

    static validateConfig(): { valid: boolean; errors: string[] } {
        const services = ["panel-segmentation", "pv-hawk", "odm"];
        const errors: string[] = [];

        for (const service of services) {
            const config = this.getServiceConfig(service);
            if (!config.url) {
                errors.push(`${service}: URL is required`);
            }
            if (!config.apiKey) {
                errors.push(`${service}: API key is required`);
            }
        }

        return { valid: errors.length === 0, errors };
    }
}

// ============================================================================
// Service Response Types
// ============================================================================

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata: {
        service: string;
        duration_ms: number;
        timestamp: string;
        request_id: string;
    };
}

export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    path: string;
    buffer?: Buffer;
}

// ============================================================================
// Circuit Breaker
// ============================================================================

export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: "closed" | "open" | "half-open" = "closed";

    constructor(
        private failureThreshold = 5,
        private recoveryTimeout = 60000, // 1 minute
        private monitoringPeriod = 300000 // 5 minutes
    ) { }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === "open") {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = "half-open";
            } else {
                throw new Error("Circuit breaker is open");
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

    getState() {
        return {
            state: this.state,
            failures: this.failures,
            lastFailureTime: this.lastFailureTime,
        };
    }
}

// ============================================================================
// Base Service Class
// ============================================================================

export abstract class BaseSolarCVService {
    protected config: ServiceConfig;
    protected circuitBreaker: CircuitBreaker;
    protected logger: SolarCVLogger;

    constructor(serviceName: string) {
        this.config = SolarCVConfig.getServiceConfig(serviceName);
        this.circuitBreaker = new CircuitBreaker();
        this.logger = new SolarCVLogger(serviceName);
    }

    protected async callService<T>(
        endpoint: string,
        options: {
            method?: "GET" | "POST" | "PUT" | "DELETE";
            body?: any;
            formData?: FormData;
            headers?: Record<string, string>;
        } = {}
    ): Promise<ServiceResponse<T>> {
        const requestId = this.generateRequestId();
        const startTime = Date.now();

        try {
            return await this.circuitBreaker.execute(async () => {
                const url = `${this.config.url}${endpoint}`;

                const headers: Record<string, string> = {
                    "X-API-Key": this.config.apiKey,
                    "X-Request-ID": requestId,
                    ...options.headers,
                };

                let body: string | FormData | undefined;

                if (options.formData) {
                    body = options.formData;
                } else if (options.body) {
                    headers["Content-Type"] = "application/json";
                    body = JSON.stringify(options.body);
                }

                this.logger.info(`Calling ${options.method || "POST"} ${url}`, { requestId });

                const response = await fetch(url, {
                    method: options.method || "POST",
                    headers,
                    body,
                    signal: AbortSignal.timeout(this.config.timeout),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Service returned ${response.status}: ${errorText}`);
                }

                const data = await response.json();

                const duration = Date.now() - startTime;
                this.logger.info(`Service call completed in ${duration}ms`, { requestId, status: response.status });

                return {
                    success: true,
                    data,
                    metadata: {
                        service: this.constructor.name,
                        duration_ms: duration,
                        timestamp: new Date().toISOString(),
                        request_id: requestId,
                    },
                };
            });

        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Service call failed after ${duration}ms: ${error.message}`, {
                requestId,
                error: error.message,
                stack: error.stack,
            });

            return {
                success: false,
                error: error.message,
                metadata: {
                    service: this.constructor.name,
                    duration_ms: duration,
                    timestamp: new Date().toISOString(),
                    request_id: requestId,
                },
            };
        }
    }

    protected generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// ============================================================================
// Logger
// ============================================================================

export class SolarCVLogger {
    constructor(private serviceName: string) { }

    info(message: string, metadata?: any) {
        console.log(`[${new Date().toISOString()}] [${this.serviceName}] INFO: ${message}`, metadata || "");
    }

    error(message: string, metadata?: any) {
        console.error(`[${new Date().toISOString()}] [${this.serviceName}] ERROR: ${message}`, metadata || "");
    }

    warn(message: string, metadata?: any) {
        console.warn(`[${new Date().toISOString()}] [${this.serviceName}] WARN: ${message}`, metadata || "");
    }
}

// ============================================================================
// File Utilities
// ============================================================================

export class FileUtils {
    private static fs = require('fs').promises;
    private static path = require('path');

    static async cleanupTempFile(filePath: string): Promise<void> {
        try {
            await this.fs.unlink(filePath);
        } catch (error) {
            console.warn(`Failed to cleanup temp file ${filePath}:`, error);
        }
    }

    static async cleanupTempFiles(filePaths: string[]): Promise<void> {
        await Promise.all(filePaths.map(path => this.cleanupTempFile(path)));
    }

    static validateImageFile(file: FileUpload): { valid: boolean; error?: string } {
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            return { valid: false, error: "File size exceeds 50MB limit" };
        }

        // Check MIME type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return { valid: false, error: `Unsupported file type: ${file.mimetype}` };
        }

        return { valid: true };
    }

    static createFormDataFromFile(file: FileUpload, fieldName: string = 'image'): FormData {
        const formData = new FormData();

        try {
            const fileBuffer = require('fs').readFileSync(file.path);
            const blob = new Blob([fileBuffer], { type: file.mimetype });
            formData.append(fieldName, blob, file.originalname);
        } catch (error) {
            throw new Error(`Failed to read file ${file.path}: ${error.message}`);
        }

        return formData;
    }

    static createFormDataFromFiles(files: FileUpload[], fieldName: string = 'images'): FormData {
        const formData = new FormData();

        files.forEach((file, index) => {
            try {
                const fileBuffer = require('fs').readFileSync(file.path);
                const blob = new Blob([fileBuffer], { type: file.mimetype });
                formData.append(fieldName, blob, file.originalname);
            } catch (error) {
                throw new Error(`Failed to read file ${file.path}: ${error.message}`);
            }
        });

        return formData;
    }
}

// ============================================================================
// Error Types
// ============================================================================

export class SolarCVError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public metadata?: any
    ) {
        super(message);
        this.name = "SolarCVError";
    }
}

export class ValidationError extends SolarCVError {
    constructor(message: string, metadata?: any) {
        super(message, "VALIDATION_ERROR", 400, metadata);
    }
}

export class ServiceUnavailableError extends SolarCVError {
    constructor(serviceName: string, metadata?: any) {
        super(
            `Service ${serviceName} is currently unavailable`,
            "SERVICE_UNAVAILABLE",
            503,
            metadata
        );
    }
}

// ============================================================================
// Metrics (Basic Implementation)
// ============================================================================

export class SolarCVMetrics {
    private static metrics: Map<string, { count: number; totalDuration: number; errors: number }> = new Map();

    static recordCall(serviceName: string, duration: number, success: boolean) {
        const key = serviceName;
        const existing = this.metrics.get(key) || { count: 0, totalDuration: 0, errors: 0 };

        existing.count++;
        existing.totalDuration += duration;
        if (!success) existing.errors++;

        this.metrics.set(key, existing);
    }

    static getMetrics(serviceName?: string) {
        if (serviceName) {
            return this.metrics.get(serviceName);
        }

        const result: any = {};
        for (const [key, value] of this.metrics) {
            result[key] = {
                ...value,
                avgDuration: value.count > 0 ? value.totalDuration / value.count : 0,
                errorRate: value.count > 0 ? value.errors / value.count : 0,
            };
        }
        return result;
    }

    static reset() {
        this.metrics.clear();
    }
}