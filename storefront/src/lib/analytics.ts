/**
 * 📊 YSH Analytics Utilities - PLG Event Tracking
 * Consent-aware event tracking for key user actions
 */

export type AnalyticsEvent = {
    event: string
    properties?: Record<string, any>
    timestamp?: number
}

export type ConsentStatus = {
    analytics: boolean
    marketing: boolean
}

// Check user consent (mock implementation - integrate with real consent manager)
function hasAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false

    // Check localStorage or cookie for consent
    try {
        const consent = localStorage.getItem('ysh_cookie_consent')
        if (!consent) return false

        const consentObj = JSON.parse(consent) as ConsentStatus
        return consentObj.analytics === true
    } catch {
        return false
    }
}

// Send event to analytics backend (PostHog, Segment, etc.)
async function sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!hasAnalyticsConsent()) {
        console.debug('[Analytics] Event blocked - no consent:', event.event)
        return
    }

    try {
        // If PostHog is available, use it
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture(event.event, event.properties)
            return
        }

        // Otherwise, send to custom endpoint
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...event,
                timestamp: event.timestamp || Date.now(),
            }),
        })
    } catch (error) {
        console.error('[Analytics] Failed to send event:', error)
    }
}

// ============================================================================
// PLG Event Tracking Functions
// ============================================================================

/**
 * Track SKU copy to clipboard
 */
export function trackSKUCopy(sku: string, context?: { productName?: string; category?: string }) {
    sendEvent({
        event: 'sku_copied',
        properties: {
            sku,
            product_name: context?.productName,
            category: context?.category,
            source: 'clipboard_button',
        },
    })
}

/**
 * Track manufacturer/model link click
 */
export function trackModelLinkClick(manufacturer: string, model: string, url: string) {
    sendEvent({
        event: 'model_link_clicked',
        properties: {
            manufacturer,
            model,
            external_url: url,
            source: 'product_card',
        },
    })
}

/**
 * Track category view/navigation
 */
export function trackCategoryView(category: string, context?: { productsCount?: number; filters?: Record<string, any> }) {
    sendEvent({
        event: 'category_viewed',
        properties: {
            category,
            products_count: context?.productsCount,
            filters: context?.filters,
        },
    })
}

/**
 * Track product detail page view
 */
export function trackProductView(product: { sku: string; name: string; category: string; manufacturer?: string }) {
    sendEvent({
        event: 'product_viewed',
        properties: {
            sku: product.sku,
            product_name: product.name,
            category: product.category,
            manufacturer: product.manufacturer,
        },
    })
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultsCount?: number) {
    sendEvent({
        event: 'search_performed',
        properties: {
            query,
            results_count: resultsCount,
        },
    })
}

/**
 * Track add to cart
 */
export function trackAddToCart(product: { sku: string; name: string; price?: number; quantity: number }) {
    sendEvent({
        event: 'add_to_cart',
        properties: {
            sku: product.sku,
            product_name: product.name,
            price: product.price,
            quantity: product.quantity,
        },
    })
}

// ============================================================================
// React Hook for Event Tracking
// ============================================================================

export function useAnalytics() {
    return {
        trackSKUCopy,
        trackModelLinkClick,
        trackCategoryView,
        trackProductView,
        trackSearch,
        trackAddToCart,
        hasConsent: hasAnalyticsConsent,
    }
}

// ============================================================================
// Data Attributes for Declarative Tracking
// ============================================================================

/**
 * Add to interactive elements:
 * 
 * <button data-track-event="sku_copied" data-track-sku="INV-001">
 *   Copy SKU
 * </button>
 */
export function initDeclarativeTracking() {
    if (typeof window === 'undefined') return

    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const trackElement = target.closest('[data-track-event]') as HTMLElement

        if (!trackElement) return

        const event = trackElement.dataset.trackEvent
        if (!event) return

        const properties: Record<string, any> = {}

        // Extract all data-track-* attributes
        Object.keys(trackElement.dataset).forEach((key) => {
            if (key.startsWith('track') && key !== 'trackEvent') {
                const propKey = key.replace('track', '').toLowerCase()
                properties[propKey] = trackElement.dataset[key]
            }
        })

        sendEvent({ event, properties })
    })
}
