/**
 * Monitoring and Analytics Configuration
 *
 * PostHog events for 360º fallback system tracking
 */

export const FALLBACK_EVENTS = {
    // HTTP Client Events
    HTTP_REQUEST_FAILED: 'http_request_failed',
    HTTP_RETRY_ATTEMPT: 'http_retry_attempt',
    HTTP_RETRY_SUCCESS: 'http_retry_success',
    HTTP_CACHE_HIT: 'http_cache_hit',
    HTTP_CACHE_MISS: 'http_cache_miss',
    HTTP_QUEUE_ADDED: 'http_queue_added',
    HTTP_QUEUE_PROCESSED: 'http_queue_processed',

    // Cart Events
    CART_OPERATION_FAILED: 'cart_operation_failed',
    CART_LOCAL_STORAGE_USED: 'cart_local_storage_used',
    CART_SYNC_STARTED: 'cart_sync_started',
    CART_SYNC_SUCCESS: 'cart_sync_success',
    CART_SYNC_FAILED: 'cart_sync_failed',
    CART_AUTO_SYNC_TRIGGERED: 'cart_auto_sync_triggered',

    // Error Boundary Events
    ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
    ERROR_BOUNDARY_RETRY: 'error_boundary_retry',
    ERROR_BOUNDARY_RETRY_SUCCESS: 'error_boundary_retry_success',
    ERROR_BOUNDARY_RETRY_FAILED: 'error_boundary_retry_failed',
    ERROR_BOUNDARY_RELOAD: 'error_boundary_reload',

    // UI Events
    FALLBACK_UI_SHOWN: 'fallback_ui_shown',
    MANUAL_RETRY_CLICKED: 'manual_retry_clicked',
    SYNC_INDICATOR_CLICKED: 'sync_indicator_clicked',
} as const

export type FallbackEvent = typeof FALLBACK_EVENTS[keyof typeof FALLBACK_EVENTS]

/**
 * PostHog event properties interfaces
 */
export interface BaseEventProps {
    timestamp: string
    user_agent: string
    url: string
    context?: string
}

export interface HttpEventProps extends BaseEventProps {
    endpoint: string
    method: string
    attempt_count: number
    error_message?: string
    response_time?: number
}

export interface CartEventProps extends BaseEventProps {
    operation: string
    item_count?: number
    total_value?: number
    error_message?: string
    sync_duration?: number
}

export interface ErrorBoundaryEventProps extends BaseEventProps {
    error_message: string
    error_stack?: string
    component_stack?: string
    retry_count: number
    max_retries: number
}

/**
 * Monitoring service for fallback system
 */
export class FallbackMonitoring {
    private static instance: FallbackMonitoring
    private eventQueue: Array<{ event: FallbackEvent; properties: any }> = []
    private isProcessing = false

    private constructor() { }

    static getInstance(): FallbackMonitoring {
        if (!FallbackMonitoring.instance) {
            FallbackMonitoring.instance = new FallbackMonitoring()
        }
        return FallbackMonitoring.instance
    }

    /**
     * Track fallback event
     */
    track(event: FallbackEvent, properties: any = {}) {
        const enrichedProperties = {
            ...properties,
            timestamp: new Date().toISOString(),
            user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'server',
        }

        // Add to queue for processing
        this.eventQueue.push({ event, properties: enrichedProperties })

        // Process queue
        this.processQueue()
    }

    /**
     * Process event queue
     */
    private async processQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) {
            return
        }

        this.isProcessing = true

        try {
            while (this.eventQueue.length > 0) {
                const { event, properties } = this.eventQueue.shift()!

                // Send to PostHog if available
                if (typeof window !== 'undefined' && (window as any).posthog) {
                    ; (window as any).posthog.capture(event, properties)
                }

                // Also log to console in development
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[FallbackMonitoring] ${event}:`, properties)
                }
            }
        } catch (error) {
            console.error('[FallbackMonitoring] Error processing queue:', error)
        } finally {
            this.isProcessing = false
        }
    }

    /**
     * Get fallback rate for monitoring dashboard
     */
    getFallbackRate(timeWindow: number = 3600000): number { // 1 hour default
        const now = Date.now()
        const windowStart = now - timeWindow

        const fallbackEvents = this.eventQueue.filter(({ event, properties }) => {
            const eventTime = new Date(properties.timestamp).getTime()
            return eventTime >= windowStart && (
                event.includes('failed') ||
                event.includes('error') ||
                event === FALLBACK_EVENTS.FALLBACK_UI_SHOWN
            )
        })

        const totalEvents = this.eventQueue.filter(({ properties }) => {
            const eventTime = new Date(properties.timestamp).getTime()
            return eventTime >= windowStart
        }).length

        return totalEvents > 0 ? (fallbackEvents.length / totalEvents) * 100 : 0
    }

    /**
     * Clear event queue (for testing)
     */
    clearQueue() {
        this.eventQueue = []
    }
}

/**
 * Global monitoring instance
 */
export const fallbackMonitoring = FallbackMonitoring.getInstance()

/**
 * Helper functions for common tracking scenarios
 */
export const trackHttpFailure = (endpoint: string, method: string, error: Error, attemptCount: number) => {
    fallbackMonitoring.track(FALLBACK_EVENTS.HTTP_REQUEST_FAILED, {
        endpoint,
        method,
        attempt_count: attemptCount,
        error_message: error.message,
        context: 'http_client',
    })
}

export const trackCartFailure = (operation: string, error: Error) => {
    fallbackMonitoring.track(FALLBACK_EVENTS.CART_OPERATION_FAILED, {
        operation,
        error_message: error.message,
        context: 'cart',
    })
}

export const trackErrorBoundary = (error: Error, context: string, retryCount: number) => {
    fallbackMonitoring.track(FALLBACK_EVENTS.ERROR_BOUNDARY_TRIGGERED, {
        error_message: error.message,
        error_stack: error.stack,
        context,
        retry_count: retryCount,
        max_retries: 3,
    })
}
