/**
 * Unit tests for HTTP client with fake timers
 */

import { fetchWithRetry, httpClient, __setTestSleepFn, __resetSleepFn } from '../http-client'

describe('HTTP Client', () => {
  let mockFetch: jest.Mock
  let fakeSleep: jest.Mock

  beforeEach(() => {
    mockFetch = jest.fn()
    global.fetch = mockFetch

    // Use fake timers for sleep
    fakeSleep = jest.fn((ms: number) => Promise.resolve())
    __setTestSleepFn(fakeSleep)
  })

  afterEach(() => {
    __resetSleepFn()
    jest.clearAllMocks()
  })

  describe('fetchWithRetry', () => {
    it('should return data on successful request', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await fetchWithRetry('https://api.test.com/data')

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(fakeSleep).not.toHaveBeenCalled()
    })

    it('should retry on 500 error with exponential backoff', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })

      const result = await fetchWithRetry('https://api.test.com/data', {
        config: { retries: 3, baseDelayMs: 1000, jitter: false },
      })

      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(fakeSleep).toHaveBeenCalledTimes(2)
      expect(fakeSleep).toHaveBeenNthCalledWith(1, 1000) // 1st retry: 1000ms
      expect(fakeSleep).toHaveBeenNthCalledWith(2, 2000) // 2nd retry: 2000ms
    })

    it('should handle 429 rate limit with Retry-After header', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Map([
            ['Retry-After', '5'],
            ['X-Request-ID', 'req-123'],
          ]),
          json: async () => ({ message: 'Rate limit exceeded' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })

      const result = await fetchWithRetry('https://api.test.com/data', {
        config: { retries: 1, baseDelayMs: 1000 },
      })

      expect(result).toEqual({ success: true })
      expect(fakeSleep).toHaveBeenCalledWith(5000) // Retry-After: 5 seconds
    })

    it('should throw normalized error after max retries', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Persistent error' }),
      })

      await expect(
        fetchWithRetry('https://api.test.com/data', {
          config: { retries: 2, baseDelayMs: 100, jitter: false },
        })
      ).rejects.toMatchObject({
        status: 500,
        code: expect.stringContaining('E500'),
        message: 'Persistent error',
      })

      expect(mockFetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
      expect(fakeSleep).toHaveBeenCalledTimes(2)
    })

    it('should handle timeout with AbortController', async () => {
      mockFetch.mockImplementation(() => {
        const error: any = new Error('The operation was aborted')
        error.name = 'AbortError'
        return Promise.reject(error)
      })

      await expect(
        fetchWithRetry('https://api.test.com/data', {
          config: { retries: 0, timeoutMs: 5000 },
        })
      ).rejects.toMatchObject({
        status: 408,
        code: 'E408_TIMEOUT',
        message: 'Request timeout',
      })
    })

    it('should not retry on 4xx client errors (except 429)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      })

      await expect(
        fetchWithRetry('https://api.test.com/data', {
          config: { retries: 3 },
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(fakeSleep).not.toHaveBeenCalled()
    })

    it('should include custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await fetchWithRetry('https://api.test.com/data', {
        config: {
          headers: {
            'x-publishable-api-key': 'pk_test_123',
            'X-API-Version': 'v2.10.3',
          },
        },
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/data',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-publishable-api-key': 'pk_test_123',
            'X-API-Version': 'v2.10.3',
            'X-Client-Version': expect.any(String),
          }),
        })
      )
    })
  })

  describe('httpClient helpers', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      })

      const result = await httpClient.get('https://api.test.com/data')

      expect(result).toEqual({ data: 'test' })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/data',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      })

      const body = { name: 'Test' }
      await httpClient.post('https://api.test.com/data', body)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/data',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
    })
  })
})
