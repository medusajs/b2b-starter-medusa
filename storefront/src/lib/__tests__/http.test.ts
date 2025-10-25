/**
 * HTTP Client Tests
 */

import { HttpClient, createHttpClient } from '../http';

// Mock fetch globally
global.fetch = jest.fn();

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('timeout', () => {
    it('should timeout after configured duration', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 60000))
      );

      const promise = client.fetch('https://api.example.com/test', { timeout: 100 });

      jest.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow('Request timeout after 100ms');
    });
  });

  describe('429 handling', () => {
    it('should respect Retry-After header (seconds)', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 429,
          headers: new Map([['Retry-After', '2']]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: async () => ({ success: true }),
        });

      const promise = client.fetch('https://api.example.com/test');

      // In test env, delays are near-zero
      jest.advanceTimersByTime(1);

      const result = await promise;
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('exponential backoff', () => {
    it('should retry with exponential backoff on 500', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ status: 500, statusText: 'Internal Server Error' })
        .mockResolvedValueOnce({ status: 500, statusText: 'Internal Server Error' })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: async () => ({ success: true }),
        });

      const promise = client.fetch('https://api.example.com/test');

      // Advance timers for retries (near-zero in test)
      jest.advanceTimersByTime(10);

      const result = await promise;
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
      });

      const promise = client.fetch('https://api.example.com/test', { retries: 2 });

      jest.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow('HTTP 500');
      expect(global.fetch).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('convenience methods', () => {
    it('should support GET', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ data: 'test' }),
      });

      const result = await client.get('https://api.example.com/test');
      expect(result).toEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should support POST with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ id: '123' }),
      });

      const result = await client.post('https://api.example.com/test', { name: 'test' });
      expect(result).toEqual({ id: '123' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });
  });

  describe('custom client', () => {
    it('should create client with custom options', () => {
      const customClient = createHttpClient({
        timeout: 5000,
        maxRetries: 5,
      });

      expect(customClient).toBeInstanceOf(HttpClient);
    });
  });
});
