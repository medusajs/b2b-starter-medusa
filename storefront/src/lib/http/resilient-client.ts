import "server-only"

/**
 * ResilientHttpClient - HTTP client with 4-layer resilience
 * 
 * Layer 1: Retry with exponential backoff
 * Layer 2: In-memory cache with TTL
 * Layer 3: Failed operation queue
 * Layer 4: Graceful error handling
 * 
 * @module lib/http/resilient-client
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface ResilientRequestOptions {
    method: HttpMethod
    headers?: Record<string, string>
    body?: any
    cache?: RequestCache
    next?: NextFetchRequestConfig

    // Resilience options
    retries?: number // Default: 3
    timeout?: number // Default: 10000ms
    cacheTTL?: number // Default: 60000ms (1 minute)
    enableQueue?: boolean // Default: true
    enableCache?: boolean // Default: true
}

export interface CachedResponse<T = any> {
    data: T
    timestamp: number
    ttl: number
}

export interface QueuedOperation {
    id: string
    url: string
    options: ResilientRequestOptions
    attempts: number
    timestamp: number
    maxAttempts: number
}

export interface ResilientResponse<T = any> {
    data: T
    fromCache: boolean
    fromQueue: boolean
    attempts: number
    error?: Error
}

/**
 * In-memory cache for responses
 */
class ResponseCache {
    private cache = new Map<string, CachedResponse>()

    set<T>(key: string, data: T, ttl: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        })
    }

    get<T>(key: string): T | null {
        const cached = this.cache.get(key)
        if (!cached) return null

        const age = Date.now() - cached.timestamp
        if (age > cached.ttl) {
            this.cache.delete(key)
            return null
        }

        return cached.data as T
    }

    clear(): void {
        this.cache.clear()
    }

    delete(key: string): void {
        this.cache.delete(key)
    }

    size(): number {
        return this.cache.size
    }
}

/**
 * Queue for failed operations
 */
class OperationQueue {
    private queue = new Map<string, QueuedOperation>()
    private processing = false

    add(operation: QueuedOperation): void {
        this.queue.set(operation.id, operation)
        this.scheduleProcessing()
    }

    get(id: string): QueuedOperation | null {
        return this.queue.get(id) || null
    }

    remove(id: string): void {
        this.queue.delete(id)
    }

    size(): number {
        return this.queue.size
    }

    getAll(): QueuedOperation[] {
        return Array.from(this.queue.values())
    }

    clear(): void {
        this.queue.clear()
    }

    private async scheduleProcessing(): Promise<void> {
        if (this.processing) return

        // Process queue after 5 seconds
        setTimeout(() => this.processQueue(), 5000)
    }

    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.size === 0) return

        this.processing = true
        const operations = Array.from(this.queue.values())

        for (const op of operations) {
            try {
                // Attempt to retry the operation
                const client = new ResilientHttpClient()
                await client.request(op.url, {
                    ...op.options,
                    retries: op.maxAttempts - op.attempts,
                })

                // Success - remove from queue
                this.queue.delete(op.id)

                // Track success
                if (typeof window !== "undefined" && (window as any).posthog) {
                    (window as any).posthog.capture("sync_success", {
                        operation_id: op.id,
                        attempts: op.attempts + 1,
                        time_in_queue_ms: Date.now() - op.timestamp,
                    })
                }
            } catch (error) {
                // Update attempts
                op.attempts++

                if (op.attempts >= op.maxAttempts) {
                    // Max attempts reached - remove from queue
                    this.queue.delete(op.id)

                    // Track failure
                    if (typeof window !== "undefined" && (window as any).posthog) {
                        (window as any).posthog.capture("sync_failed", {
                            operation_id: op.id,
                            attempts: op.attempts,
                            error: error instanceof Error ? error.message : "Unknown",
                            will_retry: false,
                        })
                    }
                }
            }
        }

        this.processing = false

        // Schedule next processing if queue not empty
        if (this.queue.size > 0) {
            setTimeout(() => this.processQueue(), 10000) // 10s delay
        }
    }
}

/**
 * ResilientHttpClient with retry, cache, and queue
 */
export class ResilientHttpClient {
    private static cache = new ResponseCache()
    private static queue = new OperationQueue()

    async request<T = any>(
        url: string,
        options: ResilientRequestOptions = { method: "GET" }
    ): Promise<ResilientResponse<T>> {
        const {
            method = "GET",
            retries = 3,
            timeout = 10000,
            cacheTTL = 60000,
            enableQueue = true,
            enableCache = true,
            ...fetchOptions
        } = options

        const cacheKey = this.getCacheKey(url, method, fetchOptions.body)

        // Layer 2: Check cache for GET requests
        if (enableCache && method === "GET") {
            const cached = ResilientHttpClient.cache.get<T>(cacheKey)
            if (cached) {
                return {
                    data: cached,
                    fromCache: true,
                    fromQueue: false,
                    attempts: 0,
                }
            }
        }

        // Layer 1: Retry with exponential backoff
        let lastError: Error | null = null
        let attempts = 0

        for (let i = 0; i <= retries; i++) {
            attempts = i + 1

            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), timeout)

                const response = await fetch(url, {
                    ...fetchOptions,
                    method,
                    signal: controller.signal,
                })

                clearTimeout(timeoutId)

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()

                // Cache successful GET responses
                if (enableCache && method === "GET") {
                    ResilientHttpClient.cache.set(cacheKey, data, cacheTTL)
                }

                return {
                    data,
                    fromCache: false,
                    fromQueue: false,
                    attempts,
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error))

                // Don't retry on last attempt
                if (i < retries) {
                    const delay = Math.pow(2, i) * 1000 // 1s, 2s, 4s, 8s
                    await this.sleep(delay)
                }
            }
        }

        // Layer 3: Add to queue for non-GET requests
        if (enableQueue && method !== "GET") {
            const operationId = this.generateOperationId(url, method)

            ResilientHttpClient.queue.add({
                id: operationId,
                url,
                options,
                attempts: 0,
                timestamp: Date.now(),
                maxAttempts: 10, // Retry up to 10 times in background
            })

            // Track fallback trigger
            if (typeof window !== "undefined" && (window as any).posthog) {
                (window as any).posthog.capture("fallback_triggered", {
                    endpoint: url,
                    method,
                    error_type: lastError?.message || "Unknown",
                    fallback_source: "queue",
                    attempts,
                })
            }

            // Return error but indicate operation is queued
            return {
                data: null as any,
                fromCache: false,
                fromQueue: true,
                attempts,
                error: lastError || undefined,
            }
        }

        // Layer 4: Final error - no fallback possible
        throw lastError || new Error("Request failed after all retries")
    }

    /**
     * GET request shorthand
     */
    async get<T = any>(
        url: string,
        options?: Omit<ResilientRequestOptions, "method">
    ): Promise<ResilientResponse<T>> {
        return this.request<T>(url, { ...options, method: "GET" })
    }

    /**
     * POST request shorthand
     */
    async post<T = any>(
        url: string,
        body?: any,
        options?: Omit<ResilientRequestOptions, "method" | "body">
    ): Promise<ResilientResponse<T>> {
        return this.request<T>(url, { ...options, method: "POST", body })
    }

    /**
     * PUT request shorthand
     */
    async put<T = any>(
        url: string,
        body?: any,
        options?: Omit<ResilientRequestOptions, "method" | "body">
    ): Promise<ResilientResponse<T>> {
        return this.request<T>(url, { ...options, method: "PUT", body })
    }

    /**
     * PATCH request shorthand
     */
    async patch<T = any>(
        url: string,
        body?: any,
        options?: Omit<ResilientRequestOptions, "method" | "body">
    ): Promise<ResilientResponse<T>> {
        return this.request<T>(url, { ...options, method: "PATCH", body })
    }

    /**
     * DELETE request shorthand
     */
    async delete<T = any>(
        url: string,
        options?: Omit<ResilientRequestOptions, "method">
    ): Promise<ResilientResponse<T>> {
        return this.request<T>(url, { ...options, method: "DELETE" })
    }

    /**
     * Get queue status
     */
    static getQueueStatus() {
        return {
            size: this.queue.size(),
            operations: this.queue.getAll(),
        }
    }

    /**
     * Get cache status
     */
    static getCacheStatus() {
        return {
            size: this.cache.size(),
        }
    }

    /**
     * Clear cache
     */
    static clearCache() {
        this.cache.clear()
    }

    /**
     * Clear queue
     */
    static clearQueue() {
        this.queue.clear()
    }

    private getCacheKey(url: string, method: string, body?: any): string {
        const bodyStr = body ? JSON.stringify(body) : ""
        return `${method}:${url}:${bodyStr}`
    }

    private generateOperationId(url: string, method: string): string {
        return `${method}:${url}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}

/**
 * Global singleton instance
 */
export const resilientClient = new ResilientHttpClient()
