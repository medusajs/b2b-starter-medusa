/**
 * 🛡️ Fallback Wrapper with Stale-If-Error Cache
 * Provides resilient API calls with timeout, retry, circuit breaker, and cache fallback
 */

import { CacheManager } from './cache-manager'
import { CircuitBreaker, CircuitBreakerConfig } from './circuit-breaker'
import { fallbackMetrics } from './fallback-metrics'

export interface FallbackOptions<T> {
  key: string
  ttlSec: number
  graceSec?: number
  call: () => Promise<T>
  isRetryable?: (error: any) => boolean
  retries?: number
  baseDelay?: number
  jitter?: boolean
  timeoutMs?: number
  circuit?: CircuitBreakerConfig
}

export interface FallbackResult<T> {
  data: T
  stale?: boolean
  cached?: boolean
}

const DEFAULT_RETRIES = 3
const DEFAULT_BASE_DELAY = 200
const DEFAULT_TIMEOUT = 5000

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function calculateBackoff(attempt: number, baseDelay: number, jitter: boolean): number {
  const exponential = baseDelay * Math.pow(2, attempt)
  return jitter ? exponential * (0.5 + Math.random() * 0.5) : exponential
}

function isRetryableError(error: any): boolean {
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true
  if (error.name === 'AbortError') return true
  if (error.status >= 500) return true
  return false
}

export async function withFallback<T>(options: FallbackOptions<T>): Promise<FallbackResult<T>> {
  const {
    key,
    ttlSec,
    graceSec = ttlSec * 3,
    call,
    isRetryable = isRetryableError,
    retries = DEFAULT_RETRIES,
    baseDelay = DEFAULT_BASE_DELAY,
    jitter = true,
    timeoutMs = DEFAULT_TIMEOUT,
    circuit,
  } = options

  const cache = CacheManager.getInstance()
  const circuitBreaker = circuit ? CircuitBreaker.getInstance(circuit) : null

  // Track call
  fallbackMetrics.recordCall(key)

  // Check circuit breaker
  if (circuitBreaker) {
    const state = circuitBreaker.getState()
    if (state.state === 'OPEN') {
      fallbackMetrics.recordCircuitOpen(key)
      const cached = await cache.get<T>(key)
      if (cached) {
        fallbackMetrics.recordStaleServed(key)
        return { data: cached, stale: true, cached: true }
      }
      throw new Error(`E503_UPSTREAM_UNAVAILABLE: Circuit breaker ${circuit.name} is OPEN`)
    }
  }

  // Try to get from cache first
  const cached = await cache.get<T>(key)

  // Attempt call with retry
  let lastError: any = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const callWithTimeout = async () => {
        const result = await call()
        clearTimeout(timeoutId)
        return result
      }

      const result = circuitBreaker
        ? await circuitBreaker.execute(callWithTimeout)
        : await callWithTimeout()

      // Success: cache and return
      await cache.set(key, result, ttlSec)
      fallbackMetrics.recordCacheHit(key)
      return { data: result, stale: false }
    } catch (error: any) {
      clearTimeout(timeoutId)
      lastError = error

      if (attempt < retries && isRetryable(error)) {
        const backoff = calculateBackoff(attempt, baseDelay, jitter)
        await sleep(backoff)
        continue
      }

      break
    }
  }

  // Call failed: try stale cache
  if (cached) {
    fallbackMetrics.recordStaleServed(key)
    fallbackMetrics.recordFailure(key)
    console.warn(`[Fallback] Serving stale cache for key: ${key}`, {
      error: lastError?.message,
    })
    return { data: cached, stale: true, cached: true }
  }

  // No cache: record failure
  fallbackMetrics.recordFailure(key)

  // No cache available: throw error
  throw lastError || new Error('E504_UPSTREAM_TIMEOUT')
}
