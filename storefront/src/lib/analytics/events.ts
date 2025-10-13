/**
 * PLG Event Tracking with Consent Guard
 * Tracks user interactions for product-led growth
 */

import { hasAnalyticsConsent } from './consent'

export type EventName =
  | 'sku_copied'
  | 'model_link_clicked'
  | 'category_viewed'
  | 'product_quick_view'
  | 'quote_requested'
  | 'cart_item_added'
  | 'search_performed'

export interface EventProperties {
  [key: string]: string | number | boolean | undefined
}

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void
    }
  }
}

export function trackEvent(event: EventName, properties?: EventProperties): void {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return

  try {
    // PostHog integration
    if (window.posthog) {
      window.posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title,
      })
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties)
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error)
  }
}

// Convenience functions
export const analytics = {
  skuCopied: (sku: string, category?: string) =>
    trackEvent('sku_copied', { sku, category }),

  modelLinkClicked: (model: string, manufacturer?: string) =>
    trackEvent('model_link_clicked', { model, manufacturer }),

  categoryViewed: (category: string, itemCount?: number) =>
    trackEvent('category_viewed', { category, item_count: itemCount }),

  productQuickView: (productId: string, productName: string) =>
    trackEvent('product_quick_view', { product_id: productId, product_name: productName }),

  quoteRequested: (cartTotal: number, itemCount: number) =>
    trackEvent('quote_requested', { cart_total: cartTotal, item_count: itemCount }),

  cartItemAdded: (productId: string, quantity: number, price: number) =>
    trackEvent('cart_item_added', { product_id: productId, quantity, price }),

  searchPerformed: (query: string, resultCount: number) =>
    trackEvent('search_performed', { query, result_count: resultCount }),
}
