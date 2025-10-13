/**
 * 🌐 Unified HTTP Client
 * Resilient HTTP client with timeout, backoff, jitter, and 429 handling
 */

export interface HttpClientOptions {
  timeout?: number;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryOn?: number[];
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_OPTIONS: Required<HttpClientOptions> = {
  timeout: 30000, // 30s
  maxRetries: 3,
  baseDelay: 1000, // 1s
  maxDelay: 10000, // 10s
  retryOn: [408, 429, 500, 502, 503, 504],
};

// Test-friendly: near-zero delays in test environment
const getDelay = (baseDelay: number): number => {
  return process.env.NODE_ENV === 'test' ? 1 : baseDelay;
};

/**
 * Calculate exponential backoff with jitter
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  return getDelay(Math.floor(exponentialDelay + jitter));
}

/**
 * Sleep utility (test-friendly)
 */
function sleep(ms: number): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_OPTIONS.timeout, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Normalized error response
 */
export interface HttpError extends Error {
  status?: number;
  statusText?: string;
  retryAfter?: number;
  response?: Response;
}

function createHttpError(
  message: string,
  status?: number,
  statusText?: string,
  retryAfter?: number,
  response?: Response
): HttpError {
  const error = new Error(message) as HttpError;
  error.status = status;
  error.statusText = statusText;
  error.retryAfter = retryAfter;
  error.response = response;
  return error;
}

/**
 * Parse Retry-After header (seconds or HTTP date)
 */
function parseRetryAfter(retryAfter: string | null): number | undefined {
  if (!retryAfter) return undefined;

  // Try parsing as seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to ms
  }

  // Try parsing as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return undefined;
}

/**
 * Unified HTTP client with resilience features
 */
export class HttpClient {
  private options: Required<HttpClientOptions>;

  constructor(options: HttpClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Fetch with retries, backoff, jitter, and 429 handling
   */
  async fetch<T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { retries = this.options.maxRetries, ...fetchOptions } = options;
    let lastError: HttpError | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetchWithTimeout(url, {
          ...fetchOptions,
          timeout: options.timeout || this.options.timeout,
        });

        // Handle 429 with Retry-After
        if (response.status === 429) {
          const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
          const delay = retryAfter || calculateBackoff(attempt, this.options.baseDelay, this.options.maxDelay);

          if (attempt < retries) {
            if (process.env.NODE_ENV !== 'test') {
              console.warn(`[HTTP] 429 Rate Limited. Retrying after ${delay}ms...`);
            }
            await sleep(delay);
            continue;
          }

          throw createHttpError(
            'Rate limit exceeded',
            429,
            'Too Many Requests',
            retryAfter,
            response
          );
        }

        // Handle other retryable errors
        if (this.options.retryOn.includes(response.status)) {
          if (attempt < retries) {
            const delay = calculateBackoff(attempt, this.options.baseDelay, this.options.maxDelay);
            if (process.env.NODE_ENV !== 'test') {
              console.warn(`[HTTP] ${response.status} error. Retrying after ${delay}ms...`);
            }
            await sleep(delay);
            continue;
          }

          throw createHttpError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response.statusText,
            undefined,
            response
          );
        }

        // Success or non-retryable error
        if (!response.ok) {
          throw createHttpError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response.statusText,
            undefined,
            response
          );
        }

        // Parse JSON response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }

        return response as any;
      } catch (error) {
        lastError = error as HttpError;

        // Don't retry on non-retryable errors
        if (lastError.status && !this.options.retryOn.includes(lastError.status)) {
          throw lastError;
        }

        // Retry on network errors
        if (attempt < retries) {
          const delay = calculateBackoff(attempt, this.options.baseDelay, this.options.maxDelay);
          if (process.env.NODE_ENV !== 'test') {
            console.warn(`[HTTP] Network error. Retrying after ${delay}ms...`);
          }
          await sleep(delay);
          continue;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Convenience methods
   */
  async get<T = any>(url: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  async put<T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  async delete<T = any>(url: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'DELETE' });
  }
}

/**
 * Default HTTP client instance
 */
export const httpClient = new HttpClient();

/**
 * Create custom HTTP client with specific options
 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  return new HttpClient(options);
}
