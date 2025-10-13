/**
 * SKU Analytics & History Manager
 * Gerencia tracking de eventos e histórico de SKUs copiados
 */

'use client'

import { useEffect, useState } from 'react'

// Types
export interface SKUCopyEvent {
    sku: string
    timestamp: number
    product?: {
        id: string
        name: string
        category: string
    }
}

export interface SKUHistory {
    items: SKUCopyEvent[]
    maxItems: number
}

// LocalStorage keys
const STORAGE_KEY_HISTORY = 'ysh_sku_history'
const MAX_HISTORY_ITEMS = 10

/**
 * Hook para gerenciar histórico de SKUs
 */
export function useSKUHistory() {
    const [history, setHistory] = useState<SKUCopyEvent[]>([])

    // Carrega histórico do localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_HISTORY)
            if (stored) {
                const parsed = JSON.parse(stored) as SKUHistory
                setHistory(parsed.items || [])
            }
        } catch (error) {
            console.error('Error loading SKU history:', error)
        }
    }, [])

    // Adiciona SKU ao histórico
    const addToHistory = (event: SKUCopyEvent) => {
        setHistory((prev) => {
            // Remove duplicados
            const filtered = prev.filter((item) => item.sku !== event.sku)

            // Adiciona no início
            const newHistory = [event, ...filtered].slice(0, MAX_HISTORY_ITEMS)

            // Salva no localStorage
            try {
                localStorage.setItem(
                    STORAGE_KEY_HISTORY,
                    JSON.stringify({
                        items: newHistory,
                        maxItems: MAX_HISTORY_ITEMS,
                    } as SKUHistory)
                )
            } catch (error) {
                console.error('Error saving SKU history:', error)
            }

            return newHistory
        })
    }

    // Limpa histórico
    const clearHistory = () => {
        setHistory([])
        try {
            localStorage.removeItem(STORAGE_KEY_HISTORY)
        } catch (error) {
            console.error('Error clearing SKU history:', error)
        }
    }

    // Remove item específico
    const removeFromHistory = (sku: string) => {
        setHistory((prev) => {
            const newHistory = prev.filter((item) => item.sku !== sku)
            try {
                localStorage.setItem(
                    STORAGE_KEY_HISTORY,
                    JSON.stringify({
                        items: newHistory,
                        maxItems: MAX_HISTORY_ITEMS,
                    } as SKUHistory)
                )
            } catch (error) {
                console.error('Error updating SKU history:', error)
            }
            return newHistory
        })
    }

    return {
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
    }
}

/**
 * PLG Analytics Tracking Functions
 * Production-grade tracking with consent management
 */

// Enhanced consent check with multiple sources
function hasAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false

    try {
        // Check multiple consent sources
        const cookieConsent = document.cookie.includes('analytics_consent=true')
        const localConsent = localStorage.getItem('analytics_consent') === 'true'
        const sessionConsent = sessionStorage.getItem('analytics_consent') === 'true'
        
        return cookieConsent || localConsent || sessionConsent
    } catch {
        return false // Default opt-out if checks fail
    }
}

// Enhanced tracking interfaces
export interface TrackingEvent {
    event: string
    properties: Record<string, any>
    timestamp?: string
    user_id?: string
    session_id?: string
}

export interface SKUTrackingData {
    sku: string
    product_id?: string
    category?: string
    manufacturer?: string
    price?: number
    source?: 'product_card' | 'product_page' | 'search' | 'comparison'
}

export interface ModelTrackingData {
    manufacturer: string
    model: string
    product_id?: string
    url?: string
    source?: 'product_card' | 'product_page' | 'catalog'
}

export interface CategoryTrackingData {
    category: string
    filters?: Record<string, any>
    page?: number
    total_results?: number
    source?: 'navigation' | 'search' | 'filter'
}

// Enhanced SKU copy tracking
export function trackSKUCopy(data: SKUTrackingData): void {
    if (!hasAnalyticsConsent()) {
        console.log('[Analytics] SKU copy tracking disabled - no consent')
        return
    }

    const event: TrackingEvent = {
        event: 'sku_copied',
        properties: {
            ...data,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
        }
    }

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(event.event, event.properties)
    }

    // Google Analytics (gtag)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sku_copy', {
            event_category: 'Product Interaction',
            event_label: data.sku,
            custom_parameters: event.properties,
        })
    }

    // Custom analytics endpoint (if needed)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        }).catch(console.error)
    }

    console.log('[Analytics] SKU Copied:', event)
}

// Enhanced model link tracking
export function trackModelLinkClick(data: ModelTrackingData): void {
    if (!hasAnalyticsConsent()) {
        console.log('[Analytics] Model link tracking disabled - no consent')
        return
    }

    const event: TrackingEvent = {
        event: 'product_model_clicked',
        properties: {
            ...data,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
        }
    }

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(event.event, event.properties)
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'model_link_click', {
            event_category: 'Product Interaction',
            event_label: `${data.manufacturer} - ${data.model}`,
            custom_parameters: event.properties,
        })
    }

    console.log('[Analytics] Model Link Clicked:', event)
}

// Enhanced category view tracking
export function trackCategoryView(data: CategoryTrackingData): void {
    if (!hasAnalyticsConsent()) {
        console.log('[Analytics] Category view tracking disabled - no consent')
        return
    }

    const event: TrackingEvent = {
        event: 'category_viewed',
        properties: {
            ...data,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            referrer: document.referrer,
        }
    }

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(event.event, event.properties)
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'category_view', {
            event_category: 'Navigation',
            event_label: data.category,
            custom_parameters: event.properties,
        })
    }

    console.log('[Analytics] Category Viewed:', event)
}

// Additional PLG tracking functions
export function trackProductView(productId: string, category?: string): void {
    if (!hasAnalyticsConsent()) return

    const event: TrackingEvent = {
        event: 'product_viewed',
        properties: {
            product_id: productId,
            category,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
        }
    }

    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(event.event, event.properties)
    }
}

export function trackQuoteRequest(productIds: string[], totalValue?: number): void {
    if (!hasAnalyticsConsent()) return

    const event: TrackingEvent = {
        event: 'quote_requested',
        properties: {
            product_ids: productIds,
            product_count: productIds.length,
            total_value: totalValue,
            timestamp: new Date().toISOString(),
        }
    }

    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(event.event, event.properties)
    }
}

/**
 * SKU History Dropdown Component
 */
export function SKUHistoryDropdown() {
    const { history, clearHistory, removeFromHistory } = useSKUHistory()
    const [isOpen, setIsOpen] = useState(false)

    if (history.length === 0) {
        return null
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                title="Histórico de SKUs copiados"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Histórico ({history.length})</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">SKUs Copiados Recentemente</h3>
                        <button
                            onClick={() => {
                                clearHistory()
                                setIsOpen(false)
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Limpar tudo
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {history.map((item) => (
                            <div
                                key={item.sku}
                                className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <code className="text-xs font-mono text-gray-900 break-all">
                                            {item.sku}
                                        </code>
                                        {item.product && (
                                            <p className="text-xs text-gray-600 mt-1 truncate">
                                                {item.product.name}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(item.timestamp).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(item.sku)
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded"
                                            title="Copiar novamente"
                                        >
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => removeFromHistory(item.sku)}
                                            className="p-1 hover:bg-gray-200 rounded"
                                            title="Remover"
                                        >
                                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Utility function to set consent
export function setAnalyticsConsent(consent: boolean): void {
    try {
        const value = consent.toString()
        localStorage.setItem('analytics_consent', value)
        sessionStorage.setItem('analytics_consent', value)
        
        // Set cookie with 1 year expiry
        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 1)
        document.cookie = `analytics_consent=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
        
        console.log(`[Analytics] Consent ${consent ? 'granted' : 'revoked'}`)
    } catch (error) {
        console.error('[Analytics] Failed to set consent:', error)
    }
}

export default {
    useSKUHistory,
    trackSKUCopy,
    trackModelLinkClick,
    trackCategoryView,
    trackProductView,
    trackQuoteRequest,
    setAnalyticsConsent,
    hasAnalyticsConsent,
    SKUHistoryDropdown,
}
