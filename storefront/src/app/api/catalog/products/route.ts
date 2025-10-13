/**
 * API Route: /api/catalog/products
 *
 * Retorna produtos do catálogo com sistema robusto de fallback
 *
 * Query params:
 * - category: panels, inverters, batteries, structures, cables, accessories, stringboxes, kits, etc.
 * - limit: número de produtos(default: 50)
 * - offset: paginação(default: 0)
 * - distributor: filtrar por distribuidor(FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV)
 * - search: buscar por nome / SKU / fabricante
 *
 * Sistema de Fallback(em cascata):
 * 1. Backend Medusa(/store/internal - catalog)
 * 2. Backend Fallback API(/store/fallback / products)
 * 3. Arquivos JSON locais
 */

import { NextRequest, NextResponse } from 'next/server'

// Cache em memória com TTL de 1 hora

import { NextRequest, NextResponse } from 'next/server'const CACHE_TTL = 3600000 // 1 hora em ms

import { loadCatalogProducts, type ProductCategory } from '@/lib/catalog/fallback-loader'let cache: Map<string, { data: any; timestamp: number }> = new Map()



export const dynamic = 'force-dynamic'const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export const revalidate = 3600 // 1 horaconst REQUEST_TIMEOUT_MS = 10000



export async function GET(request: NextRequest) {
    type ProductCategory =

        try {    | 'panels'

        const { searchParams } = new URL(request.url) | 'inverters'

            | 'batteries'

        // Parse query params    | 'structures'

        const category = (searchParams.get('category') || 'panels') as ProductCategory | 'cables'

        const limit = parseInt(searchParams.get('limit') || '50') | 'accessories'

        const offset = parseInt(searchParams.get('offset') || '0') | 'stringboxes'

        const distributor = searchParams.get('distributor') || undefined

        const search = searchParams.get('search') || undefinedconst CATEGORY_FILES: Record<ProductCategory, string> = {

            panels: 'panels_unified.json',

            // Validar categoria    inverters: 'inverters_unified.json',

            const validCategories = [batteries: 'batteries_unified.json',

                'panels', structures: 'structures_unified.json',

                'inverters', cables: 'cables_unified.json',

                'batteries', accessories: 'accessories_unified.json',

                'structures', stringboxes: 'stringboxes_unified.json',

                'cables',}

        'accessories',

            'stringboxes', async function fetchWithTimeout(

      'kits', url: string,

      'controllers', options: RequestInit = {},

      'ev_chargers', timeout: number = REQUEST_TIMEOUT_MS

      'posts',): Promise<Response> {

                'others',    const controller = new AbortController()

                'all'    const timeoutId = setTimeout(() => controller.abort(), timeout)

    ]

                try {

                    if (!validCategories.includes(category)) {
                        const response = await fetch(url, {

                            return NextResponse.json(...options,

                                {
                                    signal: controller.signal

          success: false,
                                })

          error: 'Invalid category',

                            validCategories, clearTimeout(timeoutId)

                        },        return response

                        { status: 400 }
                    } catch (error) {

      ) clearTimeout(timeoutId)

                    } throw error

                }

    // Carregar produtos com fallback}

    const result = await loadCatalogProducts(category, {

                    limit, async function tryBackendFetch(endpoint: string, params: URLSearchParams): Promise<any | null > {

                        offset, try {

                            search, const url = `${BACKEND_URL}${endpoint}?${params.toString()}`

      distributor, const headers: HeadersInit = {

                                useCache: true            'Content-Type': 'application/json',

                            })
            }



        // Resposta        // Add publishable key header for Medusa v2

        return NextResponse.json(        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {

            {
                headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

                success: true,        }

            data: {

                products: result.products,        const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

                pagination: {

                    total: result.total,        if (!response.ok) {

                        limit,            throw new Error(`HTTP ${response.status}: ${response.statusText}`)

                        offset,        }

                    hasMore: offset + limit < result.total,

          }, const data = await response.json()

                filters: {
                    return data

                    category,    } catch (error) {

                        distributor, console.warn(`Backend fetch failed for ${endpoint}:`, error)

                        search,        return null

                    },
            }

        },
    }

    meta: {

        source: result.source, async function loadCatalogFile(category: ProductCategory): Promise<any[]> {

            fromCache: result.fromCache,    const cacheKey = `catalog_${category}`

            timestamp: new Date().toISOString(),    const cached = cache.get(cacheKey)

        },

      },    // Verificar cache

    {
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {

            headers: {
                return cached.data

                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',    }

            'X-Data-Source': result.source,

                'X-From-Cache': result.fromCache ? 'true' : 'false',    try {

                },        // Caminho correto para o catálogo unificado

        } const catalogPath = path.join(

        )            process.cwd(),

  } catch (error: any) {
        '..',

            console.error('[Products API] Error:', error)            '..',

    return NextResponse.json('ysh-erp',

                {
                    'data',

                    success: false, 'catalog',

                    error: 'Internal server error', 'unified_schemas',

                    message: error.message, CATEGORY_FILES[category]

        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,        )

    },

    { status: 500 } const fileContent = await fs.readFile(catalogPath, 'utf8')

    ) const data = JSON.parse(fileContent)

}

}        // Normalizar estrutura (alguns arquivos tem wrapper, outros não)

const products = Array.isArray(data) ? data : data[category] || []

// Atualizar cache
cache.set(cacheKey, { data: products, timestamp: Date.now() })

return products
    } catch (error) {
    console.error(`Error loading catalog file for ${category}:`, error)
    return []
}
}

function filterProducts(
    products: any[],
    filters: {
        distributor?: string
        search?: string
        minPrice?: number
        maxPrice?: number
    }
): any[] {
    let filtered = [...products]

    // Filtrar por distribuidor
    if (filters.distributor) {
        const dist = filters.distributor.toUpperCase()
        filtered = filtered.filter(
            (p) =>
                p.id?.toUpperCase().includes(dist) ||
                p.distributor?.toUpperCase() === dist ||
                p.sku?.toUpperCase().includes(dist)
        )
    }

    // Busca por texto
    if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter((p) => {
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

    // Filtrar por preço
    if (filters.minPrice !== undefined) {
        filtered = filtered.filter((p) => (p.price || 0) >= filters.minPrice!)
    }

    if (filters.maxPrice !== undefined) {
        filtered = filtered.filter((p) => (p.price || 0) <= filters.maxPrice!)
    }

    return filtered
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse query params
        const category = (searchParams.get('category') || 'panels') as ProductCategory
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const distributor = searchParams.get('distributor') || undefined
        const search = searchParams.get('search') || undefined
        const minPrice = searchParams.get('minPrice')
            ? parseFloat(searchParams.get('minPrice')!)
            : undefined
        const maxPrice = searchParams.get('maxPrice')
            ? parseFloat(searchParams.get('maxPrice')!)
            : undefined

        // Validar categoria
        if (!Object.keys(CATEGORY_FILES).includes(category)) {
            return NextResponse.json(
                {
                    error: 'Invalid category',
                    validCategories: Object.keys(CATEGORY_FILES),
                },
                { status: 400 }
            )
        }

        // Tentar buscar do backend primeiro
        const backendParams = new URLSearchParams()
        if (limit) backendParams.set('limit', limit.toString())
        if (offset) backendParams.set('offset', offset.toString())
        if (distributor) backendParams.set('distributor', distributor)
        if (search) backendParams.set('search', search)
        if (minPrice !== undefined) backendParams.set('minPrice', minPrice.toString())
        if (maxPrice !== undefined) backendParams.set('maxPrice', maxPrice.toString())

        const backendEndpoint = `/store/internal-catalog/${category}`
        const backendData = await tryBackendFetch(backendEndpoint, backendParams)

        let products: any[] = []
        let fromBackend = false

        if (backendData && backendData.success && backendData.data) {
            // Usar dados do backend
            products = backendData.data.products || backendData.data.items || []
            fromBackend = true
        } else {
            // Fallback para dados locais
            products = await loadCatalogFile(category)

            // Aplicar filtros locais
            products = filterProducts(products, {
                distributor,
                search,
                minPrice,
                maxPrice,
            })
        }

        // Paginação
        const total = products.length
        const paginatedProducts = products.slice(offset, offset + limit)

        // Resposta
        return NextResponse.json(
            {
                success: true,
                data: {
                    products: paginatedProducts,
                    pagination: {
                        total,
                        limit,
                        offset,
                        hasMore: offset + limit < total,
                    },
                    filters: {
                        category,
                        distributor,
                        search,
                        minPrice,
                        maxPrice,
                    },
                },
                fromBackend,
                timestamp: new Date().toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
                },
            }
        )
    } catch (error: any) {
        console.error('Error in products API:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message,
            },
            { status: 500 }
        )
    }
}

// Limpar cache periodicamente
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
                cache.delete(key)
            }
        }
    }, CACHE_TTL)
}
