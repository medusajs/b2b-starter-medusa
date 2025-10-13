/**
 * Unit tests for Fallback Wrapper
 */

import { withFallback } from '../fallback-wrapper'
import { CacheManager } from '../cache-manager'

jest.mock('../cache-manager')

describe('withFallback', () => {
  let mockCache: jest.Mocked<CacheManager>

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      ping: jest.fn(),
    } as any

    ;(CacheManager.getInstance as jest.Mock).mockReturnValue(mockCache)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fresh data on success', async () => {
    const mockData = { id: 1, name: 'Test' }
    const call = jest.fn().mockResolvedValue(mockData)

    const result = await withFallback({
      key: 'test-key',
      ttlSec: 60,
      call,
    })

    expect(result).toEqual({ data: mockData, stale: false })
    expect(mockCache.set).toHaveBeenCalledWith('test-key', mockData, 60)
  })

  it('should return stale cache on failure', async () => {
    const cachedData = { id: 1, name: 'Cached' }
    mockCache.get.mockResolvedValue(cachedData)

    const call = jest.fn().mockRejectedValue(new Error('Upstream failed'))

    const result = await withFallback({
      key: 'test-key',
      ttlSec: 60,
      call,
      retries: 0,
    })

    expect(result).toEqual({ data: cachedData, stale: true, cached: true })
  })

  it('should retry on retryable errors', async () => {
    const mockData = { id: 1, name: 'Test' }
    const call = jest.fn()
      .mockRejectedValueOnce({ status: 500 })
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValueOnce(mockData)

    const result = await withFallback({
      key: 'test-key',
      ttlSec: 60,
      call,
      retries: 3,
      baseDelay: 10,
      jitter: false,
    })

    expect(result).toEqual({ data: mockData, stale: false })
    expect(call).toHaveBeenCalledTimes(3)
  })

  it('should not retry on non-retryable errors', async () => {
    mockCache.get.mockResolvedValue(null)

    const call = jest.fn().mockRejectedValue({ status: 404 })

    await expect(
      withFallback({
        key: 'test-key',
        ttlSec: 60,
        call,
        retries: 3,
      })
    ).rejects.toMatchObject({ status: 404 })

    expect(call).toHaveBeenCalledTimes(1)
  })

  it('should throw if no cache available on failure', async () => {
    mockCache.get.mockResolvedValue(null)

    const call = jest.fn().mockRejectedValue(new Error('Upstream failed'))

    await expect(
      withFallback({
        key: 'test-key',
        ttlSec: 60,
        call,
        retries: 0,
      })
    ).rejects.toThrow('Upstream failed')
  })
})
