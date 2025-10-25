/**
 * Client Helper para consumir APIs do catálogo
 * Use este helper no storefront para buscar dados do catálogo
 */

export type CatalogProduct = {
    id: string
    name: string
    sku?: string
    distributor?: string
    manufacturer?: string
    model?: string
    price?: number
    description?: string
    image?: string
    image_url?: string
    specifications?: Record<string, any>
    metadata?: Record<string, any>
}

export type CatalogKit = {
    id: string
    name: string
    power_kwp?: number
    distributor?: string
    price?: number
    description?: string
    image?: string
    image_url?: string
    type?: string
    roof_type?: string
    components?: any[]
}

export type ProductCategory =
    | 'panels'
    | 'inverters'
    | 'batteries'
    | 'structures'
    | 'cables'
    | 'accessories'
    | 'stringboxes'

export type CatalogAPIResponse<T> = {
    success: boolean
    data: T
    error?: string
    message?: string
    timestamp: string
}

export type PaginatedResponse<T> = {
    items: T[]
    pagination: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
    filters?: Record<string, any>
}

/**
 * Buscar produtos de uma categoria
 */
export async function fetchProducts(params: {
    category: ProductCategory
    limit?: number
    offset?: number
    distributor?: string
    search?: string
    minPrice?: number
    maxPrice?: number
}): Promise<CatalogProduct[]> {
    try {
        const searchParams = new URLSearchParams()

        searchParams.set('category', params.category)
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.offset) searchParams.set('offset', params.offset.toString())
        if (params.distributor) searchParams.set('distributor', params.distributor)
        if (params.search) searchParams.set('search', params.search)
        if (params.minPrice !== undefined)
            searchParams.set('minPrice', params.minPrice.toString())
        if (params.maxPrice !== undefined)
            searchParams.set('maxPrice', params.maxPrice.toString())

        const response = await fetch(`/api/catalog/products?${searchParams.toString()}`, {
            next: { revalidate: 3600 }, // ISR: 1 hora
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            products: CatalogProduct[]
            pagination: any
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch products')
        }

        return result.data.products
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}

/**
 * Buscar kits prontos
 */
export async function fetchKits(params: {
    limit?: number
    offset?: number
    distributor?: string
    minPower?: number
    maxPower?: number
    type?: string
    roofType?: string
    search?: string
}): Promise<CatalogKit[]> {
    try {
        const searchParams = new URLSearchParams()

        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.offset) searchParams.set('offset', params.offset.toString())
        if (params.distributor) searchParams.set('distributor', params.distributor)
        if (params.minPower !== undefined)
            searchParams.set('minPower', params.minPower.toString())
        if (params.maxPower !== undefined)
            searchParams.set('maxPower', params.maxPower.toString())
        if (params.type) searchParams.set('type', params.type)
        if (params.roofType) searchParams.set('roofType', params.roofType)
        if (params.search) searchParams.set('search', params.search)

        const response = await fetch(`/api/catalog/kits?${searchParams.toString()}`, {
            next: { revalidate: 3600 },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            kits: CatalogKit[]
            pagination: any
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch kits')
        }

        return result.data.kits
    } catch (error) {
        console.error('Error fetching kits:', error)
        return []
    }
}

/**
 * Busca unificada em todo o catálogo
 */
export async function searchCatalog(params: {
    query: string
    categories?: ProductCategory[]
    limit?: number
    distributor?: string
}): Promise<any[]> {
    try {
        const searchParams = new URLSearchParams()

        searchParams.set('q', params.query)
        if (params.categories)
            searchParams.set('categories', params.categories.join(','))
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.distributor) searchParams.set('distributor', params.distributor)

        const response = await fetch(`/api/catalog/search?${searchParams.toString()}`, {
            next: { revalidate: 1800 }, // 30 minutos
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            query: string
            total: number
            results: any[]
            byCategory: Record<string, any[]>
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to search catalog')
        }

        return result.data.results
    } catch (error) {
        console.error('Error searching catalog:', error)
        return []
    }
}

/**
 * Obter informações de categorias
 */
export async function fetchCategories(includeStats = false): Promise<any[]> {
    try {
        const searchParams = new URLSearchParams()
        if (includeStats) searchParams.set('includeStats', 'true')

        const response = await fetch(`/api/catalog/categories?${searchParams.toString()}`, {
            next: { revalidate: 7200 }, // 2 horas
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            categories: any[]
            summary: any
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch categories')
        }

        return result.data.categories
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}

/**
 * Buscar produtos em destaque para showcase
 */
export async function fetchFeaturedProducts(params?: {
    limit?: number
    includeKits?: boolean
    categories?: ProductCategory[]
}): Promise<{ featured: CatalogProduct[]; kits: CatalogKit[] }> {
    try {
        const searchParams = new URLSearchParams()

        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.includeKits !== undefined)
            searchParams.set('includeKits', params.includeKits.toString())
        if (params?.categories)
            searchParams.set('categories', params.categories.join(','))

        const response = await fetch(`/api/catalog/featured?${searchParams.toString()}`, {
            next: { revalidate: 3600 },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            featured: CatalogProduct[]
            kits: CatalogKit[]
            total: number
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch featured products')
        }

        return {
            featured: result.data.featured,
            kits: result.data.kits,
        }
    } catch (error) {
        console.error('Error fetching featured products:', error)
        return { featured: [], kits: [] }
    }
}

/**
 * Buscar detalhes de um produto específico
 */
export async function fetchProduct(params: {
    id: string
    category?: ProductCategory
}): Promise<CatalogProduct | null> {
    try {
        const searchParams = new URLSearchParams()
        if (params.category) searchParams.set('category', params.category)

        const response = await fetch(
            `/api/catalog/product/${params.id}?${searchParams.toString()}`,
            {
                next: { revalidate: 3600 },
            }
        )

        if (!response.ok) {
            if (response.status === 404) return null
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            product: CatalogProduct
            category: string
            related: CatalogProduct[]
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch product')
        }

        return result.data.product
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

/**
 * Buscar detalhes de um kit específico
 */
export async function fetchKit(id: string): Promise<CatalogKit | null> {
    try {
        const response = await fetch(`/api/catalog/kit/${id}`, {
            next: { revalidate: 3600 },
        })

        if (!response.ok) {
            if (response.status === 404) return null
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            kit: CatalogKit
            components: any
            related: CatalogKit[]
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch kit')
        }

        return result.data.kit
    } catch (error) {
        console.error('Error fetching kit:', error)
        return null
    }
}

/**
 * Buscar lista de distribuidores
 */
export async function fetchDistributors(params?: {
    includeStats?: boolean
    includeProducts?: boolean
}): Promise<any[]> {
    try {
        const searchParams = new URLSearchParams()

        if (params?.includeStats) searchParams.set('includeStats', 'true')
        if (params?.includeProducts) searchParams.set('includeProducts', 'true')

        const response = await fetch(`/api/catalog/distributors?${searchParams.toString()}`, {
            next: { revalidate: 7200 }, // 2 horas
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: CatalogAPIResponse<{
            distributors: any[]
            summary: any
        }> = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch distributors')
        }

        return result.data.distributors
    } catch (error) {
        console.error('Error fetching distributors:', error)
        return []
    }
}

/**
 * Hook React para usar no client-side
 */
export function useCatalogAPI() {
    return {
        fetchProducts,
        fetchKits,
        searchCatalog,
        fetchCategories,
        fetchFeaturedProducts,
        fetchProduct,
        fetchKit,
        fetchDistributors,
    }
}
