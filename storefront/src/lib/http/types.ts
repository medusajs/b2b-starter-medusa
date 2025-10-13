/**
 * Shared types for resilient HTTP operations
 */

export interface ResilientConfig {
    retries: number
    timeout: number
    cacheTTL: number
    enableQueue: boolean
    enableCache: boolean
}

export const DEFAULT_RESILIENT_CONFIG: ResilientConfig = {
    retries: 3,
    timeout: 10000, // 10s
    cacheTTL: 60000, // 1 minute
    enableQueue: true,
    enableCache: true,
}

export interface FallbackEvent {
    endpoint: string
    method: string
    error_type: string
    fallback_source: "cache" | "queue" | "local" | "none"
    journey?: string
    attempts?: number
}

export interface SyncEvent {
    operation_type: string
    operation_id?: string
    items_synced?: number
    queue_size?: number
    time_in_queue_ms?: number
    attempts?: number
    success: boolean
    error?: string
    will_retry?: boolean
}
