/**
 * Fallback Catalog Loader
 * Sistema robusto para carregar dados do catálogo com múltiplas estratégias de fallback
 * 
 * Estratégias (em ordem de prioridade):
 * 1. Backend Medusa (/store/internal-catalog)
 * 2. Backend Fallback API (/store/fallback/products)
 * 3. Arquivos JSON locais (copiados do backend)
 */

import { promises as fs } from 'fs'
import path from 'path'

// Configurações
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const FALLBACK_BACKEND_URL = process.env.FALLBACK_BACKEND_URL || BACKEND_URL
const REQUEST_TIMEOUT_MS = 10000
const CACHE_TTL_MS = 3600000 // 1 hora

// Cache em memória
interface CacheEntry {
    data: any
    timestamp: number
    source: 'backend' | 'fallback-api' | 'local-file'
}

const cache = new Map<string, CacheEntry>()

/**
 * Categorias suportadas
 */
export type ProductCategory =
    | 'panels'
    | 'inverters'
    | 'batteries'
    | 'structures'
    | 'cables'
    | 'accessories'
    | 'stringboxes'
    | 'kits'
    | 'controllers'
    | 'ev_chargers'
    | 'posts'
    | 'others'
    | 'all'

/**
 * Mapeamento de categorias para arquivos
 */
const CATEGORY_FILES: Record<ProductCategory, string> = {
    panels: 'panels.json',
    inverters: 'inverters.json',
    batteries: 'batteries.json',
    structures: 'structures.json',
    cables: 'cables.json',
    accessories: 'accessories.json',
    stringboxes: 'stringboxes.json',
    kits: 'kits.json',
    controllers: 'controllers.json',
    ev_chargers: 'ev_chargers.json',
    posts: 'posts.json',
    others: 'others.json',
    all: 'products_master.json'
}

/**
 * Fetch com timeout
 */
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

/**
 * Estratégia 1: Tentar backend Medusa principal
 */
async function tryBackendFetch(
    category: ProductCategory,
    params?: Record<string, string>
): Promise<{ data: any[]; source: 'backend' } | null> {
    try {
        const queryParams = new URLSearchParams(params)
        const url = `${BACKEND_URL}/store/internal-catalog/${category}?${queryParams.toString()}`

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        const products = result.data?.products || result.data?.items || result.products || []

        console.log(`[Fallback Loader] ✅ Backend fetch successful: ${products.length} products`)
        return { data: products, source: 'backend' }
    } catch (error) {
        console.warn(`[Fallback Loader] ⚠️  Backend fetch failed for ${category}:`, error instanceof Error ? error.message : error)
        return null
    }
}

/**
 * Estratégia 2: Tentar API de fallback do backend
 */
async function tryFallbackAPI(
    category: ProductCategory,
    params?: Record<string, string>
): Promise<{ data: any[]; source: 'fallback-api' } | null> {
    try {
        const queryParams = new URLSearchParams(params)
        if (category !== 'all') {
            queryParams.set('category', category)
        }

        const url = `${FALLBACK_BACKEND_URL}/store/fallback/products?${queryParams.toString()}`

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        const products = result.data || result.products || []

        console.log(`[Fallback Loader] ✅ Fallback API successful: ${products.length} products`)
        return { data: products, source: 'fallback-api' }
    } catch (error) {
        console.warn(`[Fallback Loader] ⚠️  Fallback API failed for ${category}:`, error instanceof Error ? error.message : error)
        return null
    }
}

/**
 * Estratégia 3: Carregar arquivo JSON local
 */
async function tryLocalFile(category: ProductCategory): Promise<{ data: any[]; source: 'local-file' } | null> {
    try {
        // Caminho relativo ao backend
        const backendPath = path.join(
            process.cwd(),
            '..',
            'backend',
            'data',
            'catalog',
            'fallback_exports',
            CATEGORY_FILES[category]
        )

        const fileContent = await fs.readFile(backendPath, 'utf8')
        const jsonData = JSON.parse(fileContent)

        // Normalizar estrutura
        const products = jsonData.products || (Array.isArray(jsonData) ? jsonData : [])

        console.log(`[Fallback Loader] ✅ Local file loaded: ${products.length} products`)
        return { data: products, source: 'local-file' }
    } catch (error) {
        console.error(`[Fallback Loader] ❌ Local file failed for ${category}:`, error instanceof Error ? error.message : error)
        return null
    }
}

/**
 * Carregar produtos com fallback em cascata
 */
export async function loadCatalogProducts(
    category: ProductCategory,
    options?: {
        limit?: number
        offset?: number
        search?: string
        distributor?: string
        useCache?: boolean
    }
): Promise<{
    products: any[]
    total: number
    source: 'backend' | 'fallback-api' | 'local-file'
    fromCache: boolean
}> {
    const { limit = 50, offset = 0, search, distributor, useCache = true } = options || {}

    // Verificar cache
    const cacheKey = `${category}_${JSON.stringify(options)}`
    if (useCache) {
        const cached = cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            console.log(`[Fallback Loader] 📦 Cache hit for ${category}`)
            return {
                products: cached.data,
                total: cached.data.length,
                source: cached.source,
                fromCache: true
            }
        }
    }

    // Preparar parâmetros
    const params: Record<string, string> = {
        limit: limit.toString(),
        offset: offset.toString(),
    }
    if (search) params.search = search
    if (distributor) params.distributor = distributor

    // Tentar estratégias em ordem
    let result = await tryBackendFetch(category, params)

    if (!result) {
        result = await tryFallbackAPI(category, params)
    }

    if (!result) {
        result = await tryLocalFile(category)
    }

    // Se todas falharam, retornar vazio
    if (!result) {
        console.error(`[Fallback Loader] ❌ All strategies failed for ${category}`)
        return {
            products: [],
            total: 0,
            source: 'local-file',
            fromCache: false
        }
    }

    // Aplicar filtros locais se necessário
    let products = result.data

    if (search) {
        const searchLower = search.toLowerCase()
        products = products.filter((p: any) => {
            const searchable = [
                p.name,
                p.sku,
                p.manufacturer,
                p.model,
                p.description,
                p.id,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return searchable.includes(searchLower)
        })
    }

    if (distributor) {
        const distUpper = distributor.toUpperCase()
        products = products.filter((p: any) =>
            p.id?.toUpperCase().includes(distUpper) ||
            p.distributor?.toUpperCase() === distUpper ||
            p.sku?.toUpperCase().includes(distUpper) ||
            p.source?.toUpperCase() === distUpper
        )
    }

    // Aplicar paginação
    const total = products.length
    const paginatedProducts = products.slice(offset, offset + limit)

    // Atualizar cache
    if (useCache) {
        cache.set(cacheKey, {
            data: paginatedProducts,
            timestamp: Date.now(),
            source: result.source
        })
    }

    return {
        products: paginatedProducts,
        total,
        source: result.source,
        fromCache: false
    }
}

/**
 * Limpar cache expirado
 */
export function clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL_MS) {
            cache.delete(key)
        }
    }
}

/**
 * Limpar todo o cache
 */
export function clearAllCache(): void {
    cache.clear()
}

// Limpar cache periodicamente (apenas no servidor)
if (typeof setInterval !== 'undefined' && typeof window === 'undefined') {
    setInterval(clearExpiredCache, CACHE_TTL_MS)
}
