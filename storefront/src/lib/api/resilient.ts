/**
 * Resilient API Client
 * Wrapper que tenta usar o backend Medusa, com fallback automático para dados estáticos
 * 
 * Features:
 * - Automatic retry com exponential backoff
 * - Circuit breaker pattern
 * - Fallback automático para catálogo local
 * - Health monitoring
 * - Graceful degradation
 */

import { cache } from 'react'
import { FallbackAPI, shouldUseFallback, checkBackendHealth } from './fallback'

// ==========================================
// Configuration
// ==========================================

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000
const REQUEST_TIMEOUT_MS = 10000

// ==========================================
// Types
// ==========================================

export type ResilientOptions = {
    retry?: boolean
    retries?: number
    timeout?: number
    fallback?: boolean
    cache?: RequestCache
}

export type ApiResponse<T> = {
    data: T | null
    error: string | null
    fromFallback: boolean
    backendOnline: boolean
}

// ==========================================
// Retry Logic
// ==========================================

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number,
    delay: number
): Promise<T> {
    try {
        return await fn()
    } catch (error) {
        if (retries === 0) throw error

        console.warn(`[Resilient] Retrying after ${delay}ms... (${retries} retries left)`)
        await sleep(delay)

        return retryWithBackoff(fn, retries - 1, delay * 2)
    }
}

// ==========================================
// Fetch with Timeout
// ==========================================

async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        })

        clearTimeout(timeoutId)
        return response
    } catch (error) {
        clearTimeout(timeoutId)
        throw error
    }
}

// ==========================================
// Circuit Breaker
// ==========================================

class CircuitBreaker {
    private failures = 0
    private lastFailureTime = 0
    private state: 'closed' | 'open' | 'half-open' = 'closed'

    constructor(
        private failureThreshold = 5,
        private recoveryTimeout = 60000, // 1 minute
        private monitoringPeriod = 60000 // 1 minute
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = 'half-open'
                console.log('[CircuitBreaker] Entering half-open state')
            } else {
                throw new Error('Circuit breaker is open')
            }
        }

        try {
            const result = await fn()
            this.onSuccess()
            return result
        } catch (error) {
            this.onFailure()
            throw error
        }
    }

    private onSuccess() {
        this.failures = 0
        this.state = 'closed'
    }

    private onFailure() {
        this.failures++
        this.lastFailureTime = Date.now()

        if (this.failures >= this.failureThreshold) {
            this.state = 'open'
            console.warn(`[CircuitBreaker] Opening circuit after ${this.failures} failures`)
        }
    }
}

const apiCircuitBreaker = new CircuitBreaker()

// ==========================================
// Resilient Fetch
// ==========================================

async function resilientFetch<T>(
    endpoint: string,
    options: ResilientOptions = {}
): Promise<ApiResponse<T>> {
    const {
        retry = true,
        retries = MAX_RETRIES,
        timeout = REQUEST_TIMEOUT_MS,
        fallback = true,
        cache = 'default'
    } = options

    // Verifica se deve usar fallback imediatamente
    if (fallback && shouldUseFallback()) {
        return {
            data: null,
            error: 'Backend offline - using fallback',
            fromFallback: true,
            backendOnline: false
        }
    }

    // Tenta buscar do backend com circuit breaker
    try {
        const data = await apiCircuitBreaker.execute(async () => {
            const fetchFn = async () => {
                const response = await fetchWithTimeout(
                    `${BACKEND_URL}${endpoint}`,
                    { cache },
                    timeout
                )

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                return response.json()
            }

            return retry
                ? await retryWithBackoff(fetchFn, retries, RETRY_DELAY_MS)
                : await fetchFn()
        })

        return {
            data,
            error: null,
            fromFallback: false,
            backendOnline: true
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[Resilient] Error fetching ${endpoint}:`, errorMessage)

        // Verifica saúde do backend após erro
        await checkBackendHealth()

        return {
            data: null,
            error: errorMessage,
            fromFallback: fallback,
            backendOnline: false
        }
    }
}

// ==========================================
// Product APIs with Fallback
// ==========================================

/**
 * Lista produtos com fallback automático
 */
export const listProducts = cache(async (options?: {
    category?: string
    limit?: number
    offset?: number
    search?: string
    fallback?: boolean
}): Promise<ApiResponse<any>> => {
    const { category, limit = 12, offset = 0, search, fallback = true } = options || {}

    // Monta query string
    const params = new URLSearchParams()
    if (category) params.append('collection_id[]', category)
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    if (search) params.append('q', search)

    const endpoint = `/store/products?${params.toString()}`

    const response = await resilientFetch(endpoint, { fallback })

    // Se falhou e fallback está habilitado, usa catálogo local
    if (!response.data && fallback) {
        console.log('[Resilient] Using fallback for listProducts')
        const fallbackData = await FallbackAPI.listProducts({
            category,
            limit,
            offset,
            search
        })

        return {
            data: {
                products: fallbackData.products,
                count: fallbackData.count
            },
            error: null,
            fromFallback: true,
            backendOnline: false
        }
    }

    return response
})

/**
 * Busca produto por ID com fallback automático
 */
export const getProduct = cache(async (
    id: string,
    fallback = true
): Promise<ApiResponse<any>> => {
    const endpoint = `/store/products/${id}`

    const response = await resilientFetch(endpoint, { fallback })

    // Se falhou e fallback está habilitado, usa catálogo local
    if (!response.data && fallback) {
        console.log('[Resilient] Using fallback for getProduct')
        const fallbackProduct = await FallbackAPI.getProduct(id)

        return {
            data: { product: fallbackProduct },
            error: null,
            fromFallback: true,
            backendOnline: false
        }
    }

    return response
})

/**
 * Busca produtos por categoria com fallback
 */
export const getProductsByCategory = cache(async (
    category: string,
    limit = 12,
    fallback = true
): Promise<ApiResponse<any>> => {
    const response = await listProducts({ category, limit, fallback })

    // Se falhou e fallback está habilitado
    if (!response.data && fallback) {
        console.log('[Resilient] Using fallback for getProductsByCategory')
        const fallbackProducts = await FallbackAPI.getProductsByCategory(category, limit)

        return {
            data: { products: fallbackProducts },
            error: null,
            fromFallback: true,
            backendOnline: false
        }
    }

    return response
})

/**
 * Busca produtos em destaque com fallback
 */
export const getFeaturedProducts = cache(async (
    limit = 8,
    fallback = true
): Promise<ApiResponse<any>> => {
    const endpoint = `/store/products?limit=${limit}&is_giftcard=false`

    const response = await resilientFetch(endpoint, { fallback })

    // Se falhou e fallback está habilitado
    if (!response.data && fallback) {
        console.log('[Resilient] Using fallback for getFeaturedProducts')
        const fallbackProducts = await FallbackAPI.getFeaturedProducts(limit)

        return {
            data: { products: fallbackProducts },
            error: null,
            fromFallback: true,
            backendOnline: false
        }
    }

    return response
})

/**
 * Busca produtos relacionados com fallback
 */
export const getRelatedProducts = cache(async (
    productId: string,
    limit = 4,
    fallback = true
): Promise<ApiResponse<any>> => {
    // Medusa não tem endpoint nativo de "related", simula com mesma categoria
    const productResponse = await getProduct(productId, false)

    if (!productResponse.data) {
        if (fallback) {
            console.log('[Resilient] Using fallback for getRelatedProducts')
            const fallbackProducts = await FallbackAPI.getRelatedProducts(productId, limit)

            return {
                data: { products: fallbackProducts },
                error: null,
                fromFallback: true,
                backendOnline: false
            }
        }

        return productResponse
    }

    // Busca produtos da mesma categoria
    const category = productResponse.data.product?.collection_id
    if (category) {
        return listProducts({ category, limit: limit + 1, fallback })
    }

    return {
        data: { products: [] },
        error: null,
        fromFallback: false,
        backendOnline: true
    }
})

// ==========================================
// Cart APIs with Fallback
// ==========================================

/**
 * Cria carrinho com fallback
 */
export async function createCart(fallback = true): Promise<ApiResponse<any>> {
    const endpoint = '/store/carts'

    const response = await resilientFetch(endpoint, {
        fallback,
        retry: true
    })

    // Se falhou e fallback está habilitado, usa carrinho local
    if (!response.data && fallback) {
        console.log('[Resilient] Using fallback for createCart')
        const fallbackCart = FallbackAPI.createCart()

        return {
            data: { cart: fallbackCart },
            error: null,
            fromFallback: true,
            backendOnline: false
        }
    }

    return response
}

/**
 * Busca carrinho com fallback
 */
export async function getCart(cartId: string, fallback = true): Promise<ApiResponse<any>> {
    const endpoint = `/store/carts/${cartId}`

    const response = await resilientFetch(endpoint, { fallback })

    // Se falhou e fallback está habilitado, usa carrinho local
    if (!response.data && fallback) {
        console.log('[Resilient] Using fallback for getCart')
        const fallbackCart = await FallbackAPI.getCart(cartId)

        return {
            data: { cart: fallbackCart },
            error: null,
            fromFallback: true,
            backendOnline: false
        }
    }

    return response
}

/**
 * Adiciona item ao carrinho com fallback
 */
export async function addToCart(
    cartId: string,
    variantId: string,
    quantity: number,
    fallback = true
): Promise<ApiResponse<any>> {
    const endpoint = `/store/carts/${cartId}/line-items`

    try {
        const response = await fetchWithTimeout(
            `${BACKEND_URL}${endpoint}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variant_id: variantId, quantity })
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        return {
            data,
            error: null,
            fromFallback: false,
            backendOnline: true
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Se falhou e fallback está habilitado, usa carrinho local
        if (fallback) {
            console.log('[Resilient] Using fallback for addToCart')
            const fallbackCart = await FallbackAPI.addToCart(variantId, quantity)

            return {
                data: { cart: fallbackCart },
                error: null,
                fromFallback: true,
                backendOnline: false
            }
        }

        return {
            data: null,
            error: errorMessage,
            fromFallback: false,
            backendOnline: false
        }
    }
}

// ==========================================
// Health Check
// ==========================================

/**
 * Verifica saúde do backend
 */
export async function healthCheck(): Promise<boolean> {
    return checkBackendHealth()
}

/**
 * Retorna status do backend
 */
export function getBackendStatus() {
    return FallbackAPI.getStatus()
}

// ==========================================
// Export
// ==========================================

export const ResilientAPI = {
    // Products
    listProducts,
    getProduct,
    getProductsByCategory,
    getFeaturedProducts,
    getRelatedProducts,

    // Cart
    createCart,
    getCart,
    addToCart,

    // Health
    healthCheck,
    getBackendStatus
}

export default ResilientAPI
