/**
 * ==========================================
 * YSH Store - Unified Hooks Integration
 * ==========================================
 * 
 * Hooks personalizados para integração com APIs
 * Inclui retry, fallback e gerenciamento de estado
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import type { IntegrationModule } from './index'

// ==========================================
// Base Hook Types
// ==========================================

export interface UseAPIOptions {
    retry?: boolean
    retries?: number
    fallback?: boolean
    cache?: boolean
    revalidate?: number
}

export interface UseAPIResult<T> {
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => Promise<void>
    fromFallback: boolean
}

// ==========================================
// Generic API Hook
// ==========================================

export function useAPI<T>(
    fetcher: () => Promise<T>,
    options: UseAPIOptions = {}
): UseAPIResult<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [fromFallback, setFromFallback] = useState(false)

    const fetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await fetcher()
            setData(result)
            setFromFallback(false)
        } catch (err) {
            setError(err as Error)
            if (options.fallback) {
                // Fallback logic would go here
                setFromFallback(true)
            }
        } finally {
            setLoading(false)
        }
    }, [fetcher, options.fallback])

    useEffect(() => {
        fetch()
    }, [fetch])

    return { data, loading, error, refetch: fetch, fromFallback }
}

// ==========================================
// Products Hooks
// ==========================================

export function useProducts(params?: {
    category?: string
    limit?: number
    offset?: number
}) {
    const fetcher = useCallback(async () => {
        const query = new URLSearchParams()
        if (params?.category) query.append('category', params.category)
        if (params?.limit) query.append('limit', params.limit.toString())
        if (params?.offset) query.append('offset', params.offset.toString())

        const response = await fetch(`/api/catalog/products?${query.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch products')
        return response.json()
    }, [params])

    return useAPI(fetcher, { retry: true, fallback: true, cache: true })
}

export function useProduct(id: string, category?: string) {
    const fetcher = useCallback(async () => {
        const query = category ? `?category=${category}` : ''
        const response = await fetch(`/api/catalog/product/${id}${query}`)
        if (!response.ok) throw new Error('Failed to fetch product')
        return response.json()
    }, [id, category])

    return useAPI(fetcher, { retry: true, fallback: true, cache: true })
}

// ==========================================
// Categories Hooks
// ==========================================

export function useCategories(includeStats = false) {
    const fetcher = useCallback(async () => {
        const query = includeStats ? '?includeStats=true' : ''
        const response = await fetch(`/api/catalog/categories${query}`)
        if (!response.ok) throw new Error('Failed to fetch categories')
        return response.json()
    }, [includeStats])

    return useAPI(fetcher, { retry: true, fallback: true, cache: true })
}

// ==========================================
// Kits Hooks
// ==========================================

export function useKits(params?: {
    minPower?: number
    maxPower?: number
    type?: string
}) {
    const fetcher = useCallback(async () => {
        const query = new URLSearchParams()
        if (params?.minPower) query.append('minPower', params.minPower.toString())
        if (params?.maxPower) query.append('maxPower', params.maxPower.toString())
        if (params?.type) query.append('type', params.type)

        const response = await fetch(`/api/catalog/kits?${query.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch kits')
        return response.json()
    }, [params])

    return useAPI(fetcher, { retry: true, fallback: true, cache: true })
}

// ==========================================
// Search Hook
// ==========================================

export function useCatalogSearch(query: string, filters?: {
    category?: string
    distributor?: string
    minPrice?: number
    maxPrice?: number
}) {
    const fetcher = useCallback(async () => {
        const searchParams = new URLSearchParams({ q: query })
        if (filters?.category) searchParams.append('category', filters.category)
        if (filters?.distributor) searchParams.append('distributor', filters.distributor)
        if (filters?.minPrice) searchParams.append('minPrice', filters.minPrice.toString())
        if (filters?.maxPrice) searchParams.append('maxPrice', filters.maxPrice.toString())

        const response = await fetch(`/api/catalog/search?${searchParams.toString()}`)
        if (!response.ok) throw new Error('Failed to search catalog')
        return response.json()
    }, [query, filters])

    return useAPI(fetcher, { retry: true, fallback: true })
}

// ==========================================
// Integration Status Hook
// ==========================================

export function useIntegrationStatus(module: IntegrationModule) {
    const [status, setStatus] = useState<'active' | 'fallback' | 'offline'>('active')

    useEffect(() => {
        // Check integration health
        const checkHealth = async () => {
            try {
                const response = await fetch(`/api/health/${module}`)
                if (response.ok) {
                    setStatus('active')
                } else {
                    setStatus('fallback')
                }
            } catch {
                setStatus('offline')
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 60000) // Check every minute

        return () => clearInterval(interval)
    }, [module])

    return status
}

// ==========================================
// Route Integration Hook
// ==========================================

export function useRouteIntegration() {
    const pathname = usePathname()

    const getModuleForRoute = useCallback((path: string): IntegrationModule | null => {
        if (path.includes('/cart')) return 'cart'
        if (path.includes('/products') || path.includes('/produtos')) return 'products'
        if (path.includes('/categories')) return 'categories'
        if (path.includes('/collections')) return 'collections'
        if (path.includes('/orders') || path.includes('/order/confirmed')) return 'orders'
        if (path.includes('/quotes') || path.includes('/cotacao')) return 'quotes'
        if (path.includes('/approvals')) return 'approvals'
        if (path.includes('/company')) return 'companies'
        if (path.includes('/profile') || path.includes('/addresses')) return 'customer'
        if (path.includes('/account/@login')) return 'auth'
        if (path.includes('/solar-cv')) return 'solar-cv'
        if (path.includes('/dimensionamento')) return 'helio'
        return 'catalog'
    }, [])

    return {
        currentModule: getModuleForRoute(pathname),
        pathname,
    }
}

// ==========================================
// Offline Detection Hook
// ==========================================

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        setIsOnline(navigator.onLine)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}

// ==========================================
// Combined Integration Hook
// ==========================================

export function useIntegrations() {
    const { currentModule } = useRouteIntegration()
    const isOnline = useOnlineStatus()
    const integrationStatus = useIntegrationStatus(currentModule || 'catalog')

    return {
        currentModule,
        isOnline,
        integrationStatus,
        shouldUseFallback: !isOnline || integrationStatus === 'fallback',
    }
}

// ==========================================
// Export All
// ==========================================

const integrationHooks = {
    useAPI,
    useProducts,
    useProduct,
    useCategories,
    useKits,
    useCatalogSearch,
    useIntegrationStatus,
    useRouteIntegration,
    useOnlineStatus,
    useIntegrations,
}

export default integrationHooks