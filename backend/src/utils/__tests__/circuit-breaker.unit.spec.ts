/**
 * Unit tests for Circuit Breaker
 */

import { CircuitBreaker, CircuitState } from '../circuit-breaker'

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    breaker = CircuitBreaker.getInstance({
      name: 'test-breaker',
      failureThreshold: 3,
      openDurationMs: 1000,
      halfOpenSuccesses: 2,
    })
  })

  it('should start in CLOSED state', () => {
    const state = breaker.getState()
    expect(state.state).toBe(CircuitState.CLOSED)
    expect(state.failures).toBe(0)
  })

  it('should open after threshold failures', async () => {
    const failingFn = jest.fn().mockRejectedValue(new Error('Fail'))

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow()
    }

    const state = breaker.getState()
    expect(state.state).toBe(CircuitState.OPEN)
    expect(state.failures).toBe(3)
  })

  it('should reject immediately when OPEN', async () => {
    const failingFn = jest.fn().mockRejectedValue(new Error('Fail'))

    // Trigger OPEN
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow()
    }

    // Should fail fast without calling function
    await expect(breaker.execute(failingFn)).rejects.toThrow('Circuit breaker')
    expect(failingFn).toHaveBeenCalledTimes(3) // Not called again
  })

  it('should transition to HALF_OPEN after timeout', async () => {
    jest.useFakeTimers()
    const failingFn = jest.fn().mockRejectedValue(new Error('Fail'))

    // Trigger OPEN
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow()
    }

    // Advance time
    jest.advanceTimersByTime(1000)

    // Next call should attempt (HALF_OPEN)
    const successFn = jest.fn().mockResolvedValue('success')
    await breaker.execute(successFn)

    expect(successFn).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('should close after successful calls in HALF_OPEN', async () => {
    jest.useFakeTimers()
    const failingFn = jest.fn().mockRejectedValue(new Error('Fail'))

    // Trigger OPEN
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow()
    }

    // Advance to HALF_OPEN
    jest.advanceTimersByTime(1000)

    // Succeed twice
    const successFn = jest.fn().mockResolvedValue('success')
    await breaker.execute(successFn)
    await breaker.execute(successFn)

    const state = breaker.getState()
    expect(state.state).toBe(CircuitState.CLOSED)
    expect(state.failures).toBe(0)

    jest.useRealTimers()
  })
})
