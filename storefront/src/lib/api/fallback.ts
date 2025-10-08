/**
 * API Fallback System
 * Fornece dados estáticos do catálogo quando o backend está offline
 * 
 * Estratégia:
 * 1. Tenta buscar do backend Medusa
 * 2. Em caso de falha, usa dados do catálogo unificado
 * 3. Cache local com TTL curto para performance
 */

import { cache } from 'react'
import path from 'path'
import fs from 'fs/promises'

// ==========================================
// Types
// ==========================================

export type FallbackProduct = {
    id: string
    title: string
    handle: string
    description: string
    thumbnail: string | null
    category: string
    manufacturer: string
    sku: string
    price: number
    currency: string
    availability: boolean
    stock: number
    metadata: Record<string, any>
    specifications: Record<string, any>
}

export type FallbackCart = {
    id: string
    items: FallbackCartItem[]
    subtotal: number
    total: number
    currency: string
}

export type FallbackCartItem = {
    id: string
    product_id: string
    title: string
    sku: string
    quantity: number
    unit_price: number
    total: number
    thumbnail: string | null
}

export type BackendStatus = {
    online: boolean
    lastCheck: Date
    errorCount: number
    lastError?: string
}

// ==========================================
// Configuration
// ==========================================

const CATALOG_PATH = process.env.CATALOG_PATH ||
    path.join(process.cwd(), '../../../ysh-erp/data/catalog/unified_schemas')

const IMAGE_MAP_PATH = process.env.IMAGE_MAP_PATH ||
    path.join(process.cwd(), '../../../ysh-erp/data/catalog/images/IMAGE_MAP.json')

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const HEALTH_CHECK_ENDPOINT = '/health'
const HEALTH_CHECK_TIMEOUT = 5000 // 5s
const HEALTH_CHECK_INTERVAL = 30000 // 30s
const MAX_ERROR_COUNT = 3

// ==========================================
// Backend Health Monitoring
// ==========================================

let backendStatus: BackendStatus = {
    online: true,
    lastCheck: new Date(),
    errorCount: 0
}

/**
 * Verifica se o backend está online
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)

        const response = await fetch(`${BACKEND_URL}${HEALTH_CHECK_ENDPOINT}`, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store'
        })

        clearTimeout(timeout)

        const isOnline = response.ok

        backendStatus = {
            online: isOnline,
            lastCheck: new Date(),
            errorCount: isOnline ? 0 : backendStatus.errorCount + 1
        }

        return isOnline
    } catch (error) {
        backendStatus = {
            online: false,
            lastCheck: new Date(),
            errorCount: backendStatus.errorCount + 1,
            lastError: error instanceof Error ? error.message : 'Unknown error'
        }

        return false
    }
}

/**
 * Retorna o status atual do backend
 */
export function getBackendStatus(): BackendStatus {
    return backendStatus
}

/**
 * Verifica se deve usar fallback baseado no status e contagem de erros
 */
export function shouldUseFallback(): boolean {
    const timeSinceLastCheck = Date.now() - backendStatus.lastCheck.getTime()

    // Se passou mais de 30s desde última verificação, considera offline
    if (timeSinceLastCheck > HEALTH_CHECK_INTERVAL) {
        return true
    }

    // Se teve muitos erros consecutivos, usa fallback
    if (backendStatus.errorCount >= MAX_ERROR_COUNT) {
        return true
    }

    return !backendStatus.online
}

// ==========================================
// Catalog Data Loading (Cached)
// ==========================================

/**
 * Carrega dados de uma categoria do catálogo unificado
 */
const loadCatalogCategory = cache(async (category: string): Promise<any[]> => {
    try {
        const categoryMap: Record<string, string> = {
            'inversores': 'inverters',
            'inverters': 'inverters',
            'paineis': 'panels',
            'panels': 'panels',
            'baterias': 'batteries',
            'batteries': 'batteries',
            'kits': 'kits',
            'estruturas': 'structures',
            'structures': 'structures',
            'cabos': 'cables',
            'cables': 'cables',
            'conectores': 'connectors',
            'connectors': 'connectors',
            'protecoes': 'protections',
            'protections': 'protections',
            'monitoramento': 'monitoring',
            'monitoring': 'monitoring',
            'ferramentas': 'tools',
            'tools': 'tools',
            'acessorios': 'accessories',
            'accessories': 'accessories',
            'servicos': 'services',
            'services': 'services'
        }

        const mappedCategory = categoryMap[category.toLowerCase()] || category
        const filePath = path.join(CATALOG_PATH, `${mappedCategory}_unified.json`)

        const fileContent = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(fileContent)

        return Array.isArray(data) ? data : []
    } catch (error) {
        console.warn(`[Fallback] Failed to load category ${category}:`, error)
        return []
    }
})

/**
 * Carrega mapa de imagens
 */
const loadImageMap = cache(async (): Promise<Record<string, string>> => {
    try {
        const fileContent = await fs.readFile(IMAGE_MAP_PATH, 'utf-8')
        return JSON.parse(fileContent)
    } catch (error) {
        console.warn('[Fallback] Failed to load image map:', error)
        return {}
    }
})

/**
 * Carrega todas as categorias disponíveis
 */
const loadAllCategories = cache(async (): Promise<string[]> => {
    try {
        const files = await fs.readdir(CATALOG_PATH)
        const categories = files
            .filter(f => f.endsWith('_unified.json'))
            .map(f => f.replace('_unified.json', ''))

        return categories
    } catch (error) {
        console.warn('[Fallback] Failed to list categories:', error)
        return ['inverters', 'panels', 'batteries', 'kits', 'structures', 'cables']
    }
})

// ==========================================
// Data Transformation
// ==========================================

/**
 * Converte produto do catálogo para formato Medusa-like
 */
function transformCatalogToProduct(item: any, imageMap: Record<string, string>): FallbackProduct {
    const sku = item.sku || item.id || ''
    const image = imageMap[sku] || item.image || null

    // Extrai preço (prioriza o primeiro preço disponível)
    const price = item.price?.value ||
        item.prices?.[0]?.amount ||
        item.metadata?.price ||
        0

    return {
        id: sku,
        title: item.name || item.title || 'Produto Solar',
        handle: sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: item.description || item.metadata?.description || '',
        thumbnail: image,
        category: item.category || '',
        manufacturer: item.manufacturer || item.brand || '',
        sku: sku,
        price: price,
        currency: 'BRL',
        availability: item.availability !== false && item.availability !== 'unavailable',
        stock: item.stock || (item.availability ? 10 : 0),
        metadata: item.metadata || {},
        specifications: item.specifications || item.specs || {}
    }
}

// ==========================================
// Fallback API Functions
// ==========================================

/**
 * Lista produtos com paginação
 */
export async function fallbackListProducts(options?: {
    category?: string
    limit?: number
    offset?: number
    search?: string
}): Promise<{ products: FallbackProduct[], count: number }> {
    const { category, limit = 12, offset = 0, search } = options || {}

    try {
        let allProducts: any[] = []

        if (category) {
            // Carrega apenas a categoria especificada
            allProducts = await loadCatalogCategory(category)
        } else {
            // Carrega todas as categorias
            const categories = await loadAllCategories()
            const results = await Promise.all(
                categories.map(cat => loadCatalogCategory(cat))
            )
            allProducts = results.flat()
        }

        const imageMap = await loadImageMap()

        // Filtra por busca se fornecida
        let filtered = allProducts
        if (search) {
            const searchLower = search.toLowerCase()
            filtered = allProducts.filter(item => {
                const name = (item.name || item.title || '').toLowerCase()
                const sku = (item.sku || '').toLowerCase()
                const manufacturer = (item.manufacturer || item.brand || '').toLowerCase()

                return name.includes(searchLower) ||
                    sku.includes(searchLower) ||
                    manufacturer.includes(searchLower)
            })
        }

        // Paginação
        const paginatedProducts = filtered.slice(offset, offset + limit)

        // Transforma para formato Medusa-like
        const products = paginatedProducts.map(item =>
            transformCatalogToProduct(item, imageMap)
        )

        return {
            products,
            count: filtered.length
        }
    } catch (error) {
        console.error('[Fallback] Error listing products:', error)
        return { products: [], count: 0 }
    }
}

/**
 * Busca produto por ID/SKU
 */
export async function fallbackGetProduct(id: string): Promise<FallbackProduct | null> {
    try {
        const categories = await loadAllCategories()
        const imageMap = await loadImageMap()

        // Busca em todas as categorias
        for (const category of categories) {
            const items = await loadCatalogCategory(category)
            const found = items.find(item =>
                item.sku === id ||
                item.id === id ||
                item.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
            )

            if (found) {
                return transformCatalogToProduct(found, imageMap)
            }
        }

        return null
    } catch (error) {
        console.error('[Fallback] Error getting product:', error)
        return null
    }
}

/**
 * Busca produtos por categoria
 */
export async function fallbackGetProductsByCategory(
    category: string,
    limit = 12
): Promise<FallbackProduct[]> {
    const { products } = await fallbackListProducts({ category, limit })
    return products
}

/**
 * Busca recomendações de produtos relacionados
 */
export async function fallbackGetRelatedProducts(
    productId: string,
    limit = 4
): Promise<FallbackProduct[]> {
    try {
        const product = await fallbackGetProduct(productId)
        if (!product) return []

        // Busca produtos da mesma categoria e fabricante
        const { products } = await fallbackListProducts({
            category: product.category,
            limit: limit + 5 // Pega mais para filtrar
        })

        // Filtra produtos relacionados (mesma categoria, fabricante similar)
        const related = products
            .filter(p => p.id !== productId)
            .filter(p =>
                p.manufacturer === product.manufacturer ||
                p.category === product.category
            )
            .slice(0, limit)

        return related
    } catch (error) {
        console.error('[Fallback] Error getting related products:', error)
        return []
    }
}

/**
 * Busca produtos em destaque
 */
export async function fallbackGetFeaturedProducts(limit = 8): Promise<FallbackProduct[]> {
    try {
        const { products } = await fallbackListProducts({ limit: 100 })

        // Seleciona produtos em estoque com melhor disponibilidade
        const featured = products
            .filter(p => p.availability && p.stock > 0)
            .sort((a, b) => b.stock - a.stock)
            .slice(0, limit)

        return featured
    } catch (error) {
        console.error('[Fallback] Error getting featured products:', error)
        return []
    }
}

// ==========================================
// Cart Fallback (Local Storage)
// ==========================================

const CART_STORAGE_KEY = 'ysh_fallback_cart'

/**
 * Cria carrinho fallback
 */
export function fallbackCreateCart(): FallbackCart {
    const cart: FallbackCart = {
        id: `fallback_cart_${Date.now()}`,
        items: [],
        subtotal: 0,
        total: 0,
        currency: 'BRL'
    }

    if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }

    return cart
}

/**
 * Carrega carrinho fallback
 */
export function fallbackGetCart(): FallbackCart | null {
    if (typeof window === 'undefined') return null

    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        if (!stored) return null

        return JSON.parse(stored)
    } catch (error) {
        console.error('[Fallback] Error loading cart:', error)
        return null
    }
}

/**
 * Adiciona item ao carrinho fallback
 */
export async function fallbackAddToCart(
    productId: string,
    quantity: number
): Promise<FallbackCart> {
    let cart = fallbackGetCart()
    if (!cart) {
        cart = fallbackCreateCart()
    }

    const product = await fallbackGetProduct(productId)
    if (!product) {
        throw new Error('Product not found')
    }

    // Verifica se item já existe
    const existingIndex = cart.items.findIndex(item => item.product_id === productId)

    if (existingIndex >= 0) {
        // Atualiza quantidade
        cart.items[existingIndex].quantity += quantity
        cart.items[existingIndex].total =
            cart.items[existingIndex].quantity * cart.items[existingIndex].unit_price
    } else {
        // Adiciona novo item
        cart.items.push({
            id: `item_${Date.now()}`,
            product_id: productId,
            title: product.title,
            sku: product.sku,
            quantity,
            unit_price: product.price,
            total: quantity * product.price,
            thumbnail: product.thumbnail
        })
    }

    // Recalcula totais
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0)
    cart.total = cart.subtotal

    // Salva no localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }

    return cart
}

/**
 * Remove item do carrinho fallback
 */
export function fallbackRemoveFromCart(itemId: string): FallbackCart {
    let cart = fallbackGetCart()
    if (!cart) {
        cart = fallbackCreateCart()
    }

    cart.items = cart.items.filter(item => item.id !== itemId)

    // Recalcula totais
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0)
    cart.total = cart.subtotal

    // Salva no localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }

    return cart
}

/**
 * Atualiza quantidade de item no carrinho
 */
export function fallbackUpdateCartItem(
    itemId: string,
    quantity: number
): FallbackCart {
    let cart = fallbackGetCart()
    if (!cart) {
        cart = fallbackCreateCart()
    }

    const item = cart.items.find(i => i.id === itemId)
    if (item) {
        item.quantity = quantity
        item.total = quantity * item.unit_price
    }

    // Recalcula totais
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0)
    cart.total = cart.subtotal

    // Salva no localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }

    return cart
}

/**
 * Limpa carrinho fallback
 */
export function fallbackClearCart(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CART_STORAGE_KEY)
    }
}

// ==========================================
// Export Status
// ==========================================

export const FallbackAPI = {
    // Health
    checkHealth: checkBackendHealth,
    getStatus: getBackendStatus,
    shouldUseFallback,

    // Products
    listProducts: fallbackListProducts,
    getProduct: fallbackGetProduct,
    getProductsByCategory: fallbackGetProductsByCategory,
    getRelatedProducts: fallbackGetRelatedProducts,
    getFeaturedProducts: fallbackGetFeaturedProducts,

    // Cart
    createCart: fallbackCreateCart,
    getCart: fallbackGetCart,
    addToCart: fallbackAddToCart,
    removeFromCart: fallbackRemoveFromCart,
    updateCartItem: fallbackUpdateCartItem,
    clearCart: fallbackClearCart
}
