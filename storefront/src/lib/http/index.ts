/**
 * Resilient HTTP module
 * 
 * Provides HTTP client with 4-layer resilience:
 * 1. Retry with exponential backoff
 * 2. In-memory cache
 * 3. Operation queue for failed requests
 * 4. Graceful error handling
 */

export {
  ResilientHttpClient,
  resilientClient,
  type HttpMethod,
  type ResilientRequestOptions,
  type ResilientResponse,
  type CachedResponse,
  type QueuedOperation,
} from "./resilient-client"

export {
  DEFAULT_RESILIENT_CONFIG,
  type ResilientConfig,
  type FallbackEvent,
  type SyncEvent,
} from "./types"
