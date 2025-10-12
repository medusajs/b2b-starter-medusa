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
 * Analytics Tracking Functions
 */

// Consent check helper
function hasAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false

    // Check for consent cookie (adjust to your consent mechanism)
    try {
        const consent = localStorage.getItem('analytics_consent')
        return consent === 'true' || consent === null // Default opt-in for now
    } catch {
        return true // Default opt-in if localStorage unavailable
    }
}

// Track copy SKU event
export function trackSKUCopy(sku: string, productId?: string, category?: string): void {
    if (!hasAnalyticsConsent()) {
        console.log('[Analytics] Tracking disabled - no consent')
        return
    }

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('sku_copied', {
            sku,
            product_id: productId,
            category,
            timestamp: new Date().toISOString(),
        })
    }

    // Google Analytics (gtag)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sku_copy', {
            event_category: 'Product Interaction',
            event_label: sku,
            product_id: productId,
            category,
        })
    }

    console.log('[Analytics] SKU Copied:', { sku, productId, category })
}

// Track ProductModel link click
export function trackModelLinkClick(manufacturer: string, model: string): void {
    if (!hasAnalyticsConsent()) return

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('product_model_clicked', {
            manufacturer,
            model,
            timestamp: new Date().toISOString(),
        })
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'model_link_click', {
            event_category: 'Product Interaction',
            event_label: `${manufacturer} - ${model}`,
            manufacturer,
            model,
        })
    }

    console.log('[Analytics] Model Link Clicked:', { manufacturer, model })
}

// Track category view
export function trackCategoryView(category: string): void {
    if (!hasAnalyticsConsent()) return

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('category_viewed', {
            category,
            timestamp: new Date().toISOString(),
        })
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'category_view', {
            event_category: 'Navigation',
            event_label: category,
            category,
        })
    }

    console.log('[Analytics] Category Viewed:', category)
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

export default {
    useSKUHistory,
    trackSKUCopy,
    trackModelLinkClick,
    trackCategoryView,
    SKUHistoryDropdown,
}
