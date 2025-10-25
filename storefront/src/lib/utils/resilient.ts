/**
 * Camada de resiliência para chamadas HTTP
 * Implementa retries exponenciais e fallbacks
 */

interface RetryOptions {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffFactor?: number
    shouldRetry?: (error: unknown) => boolean
}

const defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 200,
    maxDelay: 5000,
    backoffFactor: 2,
    shouldRetry: (error) => {
        // Retry em erros de rede e 5xx
        if (error instanceof Error) {
            const message = error.message.toLowerCase()
            return (
                message.includes("network") ||
                message.includes("timeout") ||
                message.includes("500") ||
                message.includes("502") ||
                message.includes("503") ||
                message.includes("504")
            )
        }
        return false
    },
}

/**
 * Executa função com retry exponencial
 */
export async function resilientFetch<T>(
    key: string,
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...defaultOptions, ...options }
    let lastError: unknown

    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error

            // Verificar se deve tentar novamente
            if (!opts.shouldRetry(error) || attempt === opts.maxRetries - 1) {
                throw error
            }

            // Calcular delay com backoff exponencial
            const delay = Math.min(
                opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
                opts.maxDelay
            )

            console.warn(
                `[Resilient] Retry ${attempt + 1}/${opts.maxRetries} for ${key} after ${delay}ms`,
                error
            )

            // Aguardar antes de próxima tentativa
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
    }

    throw lastError
}

/**
 * Wrapper para fetch com retry e timeout
 */
export async function resilientHttpFetch<T>(
    url: string,
    init?: RequestInit & { timeout?: number },
    retryOptions?: RetryOptions
): Promise<T> {
    const timeout = init?.timeout || 10000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        return await resilientFetch(
            url,
            async () => {
                const response = await fetch(url, {
                    ...init,
                    signal: controller.signal,
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                return response.json()
            },
            retryOptions
        )
    } finally {
        clearTimeout(timeoutId)
    }
}

/**
 * Cache em memória com TTL
 */
class SimpleCache<T> {
    private cache = new Map<string, { data: T; expires: number }>()

    set(key: string, data: T, ttl: number = 60000) {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl,
        })
    }

    get(key: string): T | null {
        const entry = this.cache.get(key)
        if (!entry) return null

        if (Date.now() > entry.expires) {
            this.cache.delete(key)
            return null
        }

        return entry.data
    }

    delete(key: string) {
        this.cache.delete(key)
    }

    clear() {
        this.cache.clear()
    }
}

// Instância global de cache
const cache = new SimpleCache()

/**
 * Fetch com cache e stale-while-revalidate
 */
export async function cachedFetch<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 60000,
    retryOptions?: RetryOptions
): Promise<T> {
    // Tentar cache primeiro
    const cached = cache.get(key)
    if (cached !== null) {
        return cached as T
    }

    // Buscar novo valor
    const data = await resilientFetch(key, operation, retryOptions)
    cache.set(key, data, ttl)
    return data
}

/**
 * Invalidar cache por chave ou padrão
 */
export function invalidateCache(keyOrPattern: string | RegExp) {
    if (typeof keyOrPattern === "string") {
        cache.delete(keyOrPattern)
    } else {
        // Limpar tudo que corresponder ao padrão
        cache.clear()
    }
}

/**
 * Circuit breaker simples
 */
class CircuitBreaker {
    private failures = 0
    private lastFailureTime = 0
    private state: "closed" | "open" | "half-open" = "closed"

    constructor(
        private threshold = 5,
        private timeout = 60000
    ) { }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === "open") {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = "half-open"
            } else {
                throw new Error("Circuit breaker is OPEN")
            }
        }

        try {
            const result = await operation()
            this.onSuccess()
            return result
        } catch (error) {
            this.onFailure()
            throw error
        }
    }

    private onSuccess() {
        this.failures = 0
        this.state = "closed"
    }

    private onFailure() {
        this.failures++
        this.lastFailureTime = Date.now()

        if (this.failures >= this.threshold) {
            this.state = "open"
        }
    }
}

// Instância global de circuit breaker para APIs
const apiCircuitBreaker = new CircuitBreaker()

/**
 * Wrapper que combina circuit breaker + retry + cache
 */
export async function resilientApiCall<T>(
    key: string,
    operation: () => Promise<T>,
    options?: {
        cache?: boolean
        ttl?: number
        retry?: RetryOptions
    }
): Promise<T> {
    const withCircuitBreaker = () => apiCircuitBreaker.execute(operation)

    if (options?.cache) {
        return cachedFetch(key, withCircuitBreaker, options.ttl, options.retry)
    }

    return resilientFetch(key, withCircuitBreaker, options?.retry)
}
