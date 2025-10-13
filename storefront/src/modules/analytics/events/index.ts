/**
 * Analytics Events Module
 *
 * Provides centralized event tracking and analytics functionality
 * for the storefront application.
 */

export interface AnalyticsEvent {
    name: string
    properties?: Record<string, any>
    timestamp?: Date
}

export interface ProductViewEvent extends AnalyticsEvent {
    name: "product_view"
    properties: {
        product_id: string
        product_name: string
        category?: string
        price?: number
        currency?: string
    }
}

export interface CartEvent extends AnalyticsEvent {
    name: "cart_add" | "cart_remove" | "cart_update"
    properties: {
        product_id: string
        quantity: number
        cart_total?: number
    }
}

export interface SearchEvent extends AnalyticsEvent {
    name: "search_performed"
    properties: {
        query: string
        results_count: number
        filters?: Record<string, any>
    }
}

export type AnalyticsEventType = ProductViewEvent | CartEvent | SearchEvent

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEventType): void {
    // PostHog integration
    if (typeof window !== "undefined" && (window as any).posthog) {
        ;(window as any).posthog.capture(event.name, {
            ...event.properties,
            timestamp: event.timestamp || new Date(),
        })
    }

    // Console logging for development
    if (process.env.NODE_ENV === "development") {
        console.log("[Analytics]", event.name, event.properties)
    }
}

/**
 * Track product view
 */
export function trackProductView(
    productId: string,
    productName: string,
    options?: {
        category?: string
        price?: number
        currency?: string
    }
): void {
    trackEvent({
        name: "product_view",
        properties: {
            product_id: productId,
            product_name: productName,
            ...options,
        },
    })
}

/**
 * Track cart operations
 */
export function trackCartEvent(
    action: "add" | "remove" | "update",
    productId: string,
    quantity: number,
    cartTotal?: number
): void {
    trackEvent({
        name: `cart_${action}`,
        properties: {
            product_id: productId,
            quantity,
            cart_total: cartTotal,
        },
    })
}

/**
 * Track search operations
 */
export function trackSearch(
    query: string,
    resultsCount: number,
    filters?: Record<string, any>
): void {
    trackEvent({
        name: "search_performed",
        properties: {
            query,
            results_count: resultsCount,
            filters,
        },
    })
}