// packages/shared/src/http-client.ts

/**
 * 🌐 Robust HTTP Client with Retry, Timeout, and Error Normalization
 * Production-grade fetch wrapper for API consumption
 */

export interface HttpClientConfig {
    timeoutMs?: number
    retries?: number
    baseDelayMs?: number
    jitter?: boolean
    headers?: Record<string, string>
}

export interface NormalizedError {
    status: number
    code: string
    message: string
    request_id?: string
    retry_after?: number
}

export interface FetchResult<T> {
    data: T
    stale?: boolean
    cached?: boolean
    error?: NormalizedError
}

const DEFAULT_CONFIG: Required<HttpClientConfig> = {
    timeoutMs: 30000,
    retries: 3,
    baseDelayMs: 1000,
    jitter: true,
    headers: {},
}

// For testing: allow overriding setTimeout
let sleepFn = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function __setTestSleepFn(fn: typeof sleepFn) {
    sleepFn = fn
}

export function __resetSleepFn() {
    sleepFn = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
}

function calculateBackoff(attempt: number, baseDelay: number, jitter: boolean): number {
    const exponential = baseDelay * Math.pow(2, attempt)
    return jitter ? exponential * (0.5 + Math.random() * 0.5) : exponential
}

function normalizeError(error: any, status?: number): NormalizedError {
    if (error.name === 'AbortError') {
        return {
            status: 408,
            code: 'E408_TIMEOUT',
            message: 'Request timeout',
        }
    }

    return {
        status: status || 500,
        code: `E${status || 500}_${error.code || 'UNKNOWN'}`,
        message: error.message || 'Unknown error',
        request_id: error.request_id,
        retry_after: error.retry_after,
    }
}

export async function fetchWithRetry<T = any>(
    url: string,
    options: RequestInit & { config?: HttpClientConfig } = {}
): Promise<FetchResult<T>> {
    const config = { ...DEFAULT_CONFIG, ...options.config }
    const { timeoutMs, retries, baseDelayMs, jitter, headers: configHeaders } = config

    const headers = {
        'Content-Type': 'application/json',
        'X-Client-Version': (globalThis as any).process?.env?.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        ...configHeaders,
        ...options.headers,
    }

    let lastError: NormalizedError | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))

                // Check if backend sent stale data with error
                if (errorData.success === false && errorData.data && errorData.meta?.stale) {
                    return {
                        data: errorData.data as T,
                        stale: true,
                        error: normalizeError(errorData.error, response.status),
                    }
                }

                if (response.status === 429) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10)
                    lastError = {
                        status: 429,
                        code: 'E429_RATE_LIMIT',
                        message: 'Rate limit exceeded',
                        retry_after: retryAfter,
                        request_id: response.headers.get('X-Request-ID') || undefined,
                    }

                    if (attempt < retries) {
                        const backoff = Math.max(retryAfter * 1000, calculateBackoff(attempt, baseDelayMs, jitter))
                        await sleepFn(backoff)
                        continue
                    }
                } else if (response.status >= 500 && attempt < retries) {
                    lastError = normalizeError(errorData, response.status)
                    const backoff = calculateBackoff(attempt, baseDelayMs, jitter)
                    await sleepFn(backoff)
                    continue
                }

                throw normalizeError(errorData, response.status)
            }

            const jsonData = await response.json()

            // Check for stale indicator in successful response
            if (jsonData.meta?.stale === true) {
                return {
                    data: jsonData.data || jsonData,
                    stale: true,
                }
            }

            return {
                data: jsonData.data || jsonData,
                stale: false,
            }
        } catch (error: any) {
            clearTimeout(timeoutId)

            if (error.status) {
                throw error
            }

            lastError = normalizeError(error)

            if (attempt < retries) {
                const backoff = calculateBackoff(attempt, baseDelayMs, jitter)
                await sleepFn(backoff)
                continue
            }
        }
    }

    throw lastError
}

export const httpClient = {
    get: <T = any>(url: string, config?: HttpClientConfig) =>
        fetchWithRetry<T>(url, { method: 'GET', ...(config && { config }) }),

    post: <T = any>(url: string, body?: any, config?: HttpClientConfig) =>
        fetchWithRetry<T>(url, {
            method: 'POST',
            ...(body && { body: JSON.stringify(body) }),
            ...(config && { config }),
        }),

    put: <T = any>(url: string, body?: any, config?: HttpClientConfig) =>
        fetchWithRetry<T>(url, {
            method: 'PUT',
            ...(body && { body: JSON.stringify(body) }),
            ...(config && { config }),
        }),

    delete: <T = any>(url: string, config?: HttpClientConfig) =>
        fetchWithRetry<T>(url, { method: 'DELETE', ...(config && { config }) }),
}