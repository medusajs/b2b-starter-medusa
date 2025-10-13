/**
 * 📊 Fallback Metrics Tracker
 * Tracks fallback usage for observability
 */

interface FallbackMetric {
  total_calls: number
  cache_hits: number
  stale_served: number
  failures: number
  circuit_open_count: number
}

class FallbackMetrics {
  private static instance: FallbackMetrics
  private metrics = new Map<string, FallbackMetric>()

  private constructor() {}

  static getInstance(): FallbackMetrics {
    if (!this.instance) {
      this.instance = new FallbackMetrics()
    }
    return this.instance
  }

  recordCall(key: string) {
    const metric = this.getOrCreate(key)
    metric.total_calls++
  }

  recordCacheHit(key: string) {
    const metric = this.getOrCreate(key)
    metric.cache_hits++
  }

  recordStaleServed(key: string) {
    const metric = this.getOrCreate(key)
    metric.stale_served++
  }

  recordFailure(key: string) {
    const metric = this.getOrCreate(key)
    metric.failures++
  }

  recordCircuitOpen(key: string) {
    const metric = this.getOrCreate(key)
    metric.circuit_open_count++
  }

  getMetrics(key?: string) {
    if (key) {
      return this.metrics.get(key) || this.createMetric()
    }
    return Object.fromEntries(this.metrics)
  }

  reset(key?: string) {
    if (key) {
      this.metrics.delete(key)
    } else {
      this.metrics.clear()
    }
  }

  private getOrCreate(key: string): FallbackMetric {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, this.createMetric())
    }
    return this.metrics.get(key)!
  }

  private createMetric(): FallbackMetric {
    return {
      total_calls: 0,
      cache_hits: 0,
      stale_served: 0,
      failures: 0,
      circuit_open_count: 0,
    }
  }
}

export const fallbackMetrics = FallbackMetrics.getInstance()
