/**
 * 🔌 Circuit Breaker Pattern
 * Prevents cascading failures by failing fast when upstream is down
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  name: string
  failureThreshold: number
  openDurationMs: number
  halfOpenSuccesses: number
}

export class CircuitBreaker {
  private static instances = new Map<string, CircuitBreaker>()
  
  private state: CircuitState = CircuitState.CLOSED
  private failures = 0
  private successes = 0
  private lastFailureTime = 0

  private constructor(private config: CircuitBreakerConfig) {}

  static getInstance(config: CircuitBreakerConfig): CircuitBreaker {
    if (!this.instances.has(config.name)) {
      this.instances.set(config.name, new CircuitBreaker(config))
    }
    return this.instances.get(config.name)!
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.config.openDurationMs) {
        this.state = CircuitState.HALF_OPEN
        this.successes = 0
      } else {
        throw new Error(`Circuit breaker ${this.config.name} is OPEN`)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++
      if (this.successes >= this.config.halfOpenSuccesses) {
        this.state = CircuitState.CLOSED
      }
    }
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
    }
  }
}
