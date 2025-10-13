/**/**

 * API Route: /api/catalog / products * API Route: /api/catalog / products

    * *

 * Retorna produtos do catálogo com sistema robusto de fallback * Retorna produtos do catálogo com sistema robusto de fallback

    * *

 * Query params: * Query params:

 * - category: panels, inverters, batteries, structures, cables, accessories, stringboxes, kits, etc. * - category: panels, inverters, batteries, structures, cables, accessories, stringboxes, kits, etc.

 * - limit: número de produtos(default: 50) * - limit: número de produtos(default: 50)

    * - offset: paginação(default: 0) * - offset: paginação(default: 0)

        * - distributor: filtrar por distribuidor(FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV) * - distributor: filtrar por distribuidor(FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV)

            * - search: buscar por nome / SKU / fabricante * - search: buscar por nome / SKU / fabricante

                * *

 * Sistema de Fallback(em cascata): * Sistema de Fallback(em cascata):

 * 1. Backend Medusa(/store/internal - catalog) * 1. Backend Medusa(/store/internal - catalog)

    * 2. Backend Fallback API(/store/fallback / products) * 2. Backend Fallback API(/store/fallback / products)

        * 3. Arquivos JSON locais * 3. Arquivos JSON locais

            * / */



import { NextRequest, NextResponse } from 'next/server'import { NextRequest, NextResponse } from 'next/server'

import { loadCatalogProducts, type ProductCategory } from '@/lib/catalog/fallback-loader'

import fs from 'fs/promises'// Cache em memória com TTL de 1 hora

import path from 'path'

import { NextRequest, NextResponse } from 'next/server'const CACHE_TTL = 3600000 // 1 hora em ms

// Cache em memória com TTL de 1 hora

const CACHE_TTL = 3600000 // 1 hora em msimport { loadCatalogProducts, type ProductCategory } from '@/lib/catalog/fallback-loader'let cache: Map<string, { data: any; timestamp: number }> = new Map()

let cache: Map<string, { data: any; timestamp: number }> = new Map()



export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'export const dynamic = 'force-dynamic'const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export const revalidate = 3600 // 1 hora

const REQUEST_TIMEOUT_MS = 10000export const revalidate = 3600 // 1 horaconst REQUEST_TIMEOUT_MS = 10000



const CATEGORY_FILES: Record<ProductCategory, string> = {

    panels: 'panels_unified.json',

    inverters: 'inverters_unified.json', export async function GET(request: NextRequest) {

        batteries: 'batteries_unified.json', type ProductCategory =

        structures: 'structures_unified.json',

        cables: 'cables_unified.json', try {    | 'panels'

accessories: 'accessories_unified.json',

    stringboxes: 'stringboxes_unified.json',        const { searchParams } = new URL(request.url) | 'inverters'

kits: 'kits_unified.json',

    controllers: 'controllers_unified.json',            | 'batteries'

ev_chargers: 'ev_chargers_unified.json',

    posts: 'posts_unified.json',        // Parse query params    | 'structures'

        others: 'others_unified.json',

}        const category = (searchParams.get('category') || 'panels') as ProductCategory | 'cables'



async function fetchWithTimeout(        const limit = parseInt(searchParams.get('limit') || '50') | 'accessories'

    url: string,

    options: RequestInit = {},        const offset = parseInt(searchParams.get('offset') || '0') | 'stringboxes'

    timeout: number = REQUEST_TIMEOUT_MS

): Promise<Response> {
    const distributor = searchParams.get('distributor') || undefined

    const controller = new AbortController()

    const timeoutId = setTimeout(() => controller.abort(), timeout)        const search = searchParams.get('search') || undefinedconst CATEGORY_FILES: Record<ProductCategory, string> = {



        try {
            panels: 'panels_unified.json',

            const response = await fetch(url, {

                ...options,            // Validar categoria    inverters: 'inverters_unified.json',

                signal: controller.signal

            })            const validCategories = [batteries: 'batteries_unified.json',

                clearTimeout(timeoutId)

        return response                'panels', structures: 'structures_unified.json',

        } catch(error) {

            clearTimeout(timeoutId)                'inverters', cables: 'cables_unified.json',

        throw error

        }                'batteries', accessories: 'accessories_unified.json',

    }

    'structures', stringboxes: 'stringboxes_unified.json',

        async function tryBackendFetch(endpoint: string, params: URLSearchParams): Promise<any | null> {

            try { 'cables',}

        const url = `${BACKEND_URL}${endpoint}?${params.toString()}`

            const headers: HeadersInit = {
                'accessories',

                'Content-Type': 'application/json',

            }            'stringboxes', async function fetchWithTimeout(



        // Add publishable key header for Medusa v2      'kits', url: string,

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {

                headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY      'controllers', options: RequestInit = {},

        }

            'ev_chargers', timeout: number = REQUEST_TIMEOUT_MS

            const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

            'posts',): Promise < Response > {

                if(!response.ok) {

                throw new Error(`HTTP ${response.status}: ${response.statusText}`)                'others',    const controller = new AbortController()

            }

            'all'    const timeoutId = setTimeout(() => controller.abort(), timeout)

            const data = await response.json()

            return data    ]

        } catch (error) {

            console.warn(`Backend fetch failed for ${endpoint}:`, error)                try {

                return null

            }                    if (!validCategories.includes(category)) {

            } const response = await fetch(url, {



                async function loadCatalogFile(category: ProductCategory): Promise<any[]> {
                    return NextResponse.json(...options,

    const cacheKey = `catalog_${category}`

    const cached = cache.get(cacheKey)                                {

                signal: controller.signal

    // Verificar cache

    if(cached && Date.now() - cached.timestamp < CACHE_TTL) { success: false,

                    return cached.data })

        }

    error: 'Invalid category',

    try {

        // Caminho correto para o catálogo unificado                            validCategories, clearTimeout(timeoutId)

        const catalogPath = path.join(

            process.cwd(),                        }, return response

    '..',

        '..', { status: 400 }

    'ysh-erp',                    } catch (error) {

        'data',

            'catalog',      ) clearTimeout(timeoutId)

        'unified_schemas',

            CATEGORY_FILES[category]
    } throw error

        )

                }

const fileContent = await fs.readFile(catalogPath, 'utf8')

const data = JSON.parse(fileContent)    // Carregar produtos com fallback}



// Normalizar estrutura (alguns arquivos tem wrapper, outros não)    const result = await loadCatalogProducts(category, {

const products = Array.isArray(data) ? data : data[category] || []

limit, async function tryBackendFetch(endpoint: string, params: URLSearchParams): Promise<any | null> {

    // Atualizar cache

    cache.set(cacheKey, { data: products, timestamp: Date.now() })                        offset, try {



        return products                            search, const url = `${BACKEND_URL}${endpoint}?${params.toString()}`

    } catch (error) {

        console.error(`Error loading catalog file for ${category}:`, error)      distributor, const headers: HeadersInit = {

            return []

        }                                useCache: true            'Content-Type': 'application/json',

}

})

function filterProducts(            }

    products: any[],

    filters: {

        distributor?: string

        search?: string        // Resposta        // Add publishable key header for Medusa v2

        minPrice?: number

        maxPrice?: number        return NextResponse.json(        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {

        }

): any[] {
    {

        let filtered = [...products]                headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY



        // Filtrar por distribuidor                success: true,        }

        if (filters.distributor) {

            const dist = filters.distributor.toUpperCase()            data: {

        filtered = filtered.filter(

                (p) => products: result.products,        const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

            p.id?.toUpperCase().includes(dist) ||

                p.distributor?.toUpperCase() === dist || pagination: {

                p.sku?.toUpperCase().includes(dist)

        ) total: result.total,        if (!response.ok) {

                }

                limit,            throw new Error(`HTTP ${response.status}: ${response.statusText}`)

                // Busca por texto

                if (filters.search) { offset,        }

                const searchLower = filters.search.toLowerCase()

                filtered = filtered.filter((p) => {
                    hasMore: offset + limit < result.total,

            const searchable = [

                        p.name,          }, const data = await response.json()

                p.sku,

                    p.manufacturer, filters: {

                    p.model,                    return data

                    p.description,

                        p.id, category,    } catch (error) {

            ]

                .filter(Boolean)                        distributor, console.warn(`Backend fetch failed for ${endpoint}:`, error)

                                .join(' ')

                                .toLowerCase()                        search,        return null



                            return searchable.includes(searchLower)
                        },

            })
        }

    }

},

// Filtrar por preço    }

if (filters.minPrice !== undefined) {

    filtered = filtered.filter((p) => (p.price || 0) >= filters.minPrice!)    meta: {

    }

    source: result.source, async function loadCatalogFile(category: ProductCategory): Promise<any[]> {

        if (filters.maxPrice !== undefined) {

            filtered = filtered.filter((p) => (p.price || 0) <= filters.maxPrice!)            fromCache: result.fromCache,    const cacheKey = `catalog_${category}`

        }

        timestamp: new Date().toISOString(),    const cached = cache.get(cacheKey)

        return filtered

    }
},



export async function GET(request: NextRequest) { },    // Verificar cache

try {

    const { searchParams } = new URL(request.url)    {

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {

        // Parse query params

        const category = (searchParams.get('category') || 'panels') as ProductCategory            headers: {

        const limit = parseInt(searchParams.get('limit') || '50')                return cached.data

        const offset = parseInt(searchParams.get('offset') || '0')

        const distributor = searchParams.get('distributor') || undefined                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',    }

    const search = searchParams.get('search') || undefined

    const minPrice = searchParams.get('minPrice')            'X-Data-Source': result.source,

            ? parseFloat(searchParams.get('minPrice')!)

            : undefined                'X-From-Cache': result.fromCache ? 'true' : 'false',    try {

                const maxPrice = searchParams.get('maxPrice')

                    ? parseFloat(searchParams.get('maxPrice')!)                },        // Caminho correto para o catálogo unificado

            : undefined

} const catalogPath = path.join(

        // Validar categoria

        if (!Object.keys(CATEGORY_FILES).includes(category)) {        ) process.cwd(),

            return NextResponse.json(

    {} catch (error: any) {

        error: 'Invalid category', '..',

            validCategories: Object.keys(CATEGORY_FILES),

                }, console.error('[Products API] Error:', error)            '..',

        { status: 400 }

            ) return NextResponse.json('ysh-erp',

        }

{

    // Tentar buscar do backend primeiro                    'data',

    const backendParams = new URLSearchParams()

    if (limit) backendParams.set('limit', limit.toString())                    success: false, 'catalog',

        if (offset) backendParams.set('offset', offset.toString())

    if (distributor) backendParams.set('distributor', distributor)                    error: 'Internal server error', 'unified_schemas',

        if (search) backendParams.set('search', search)

    if (minPrice !== undefined) backendParams.set('minPrice', minPrice.toString())                    message: error.message, CATEGORY_FILES[category]

    if (maxPrice !== undefined) backendParams.set('maxPrice', maxPrice.toString())

    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,        )

    const backendEndpoint = `/store/internal-catalog/${category}`

    const backendData = await tryBackendFetch(backendEndpoint, backendParams)
},



let products: any[] = []    { status: 500 } const fileContent = await fs.readFile(catalogPath, 'utf8')

let fromBackend = false

    ) const data = JSON.parse(fileContent)

if (backendData && backendData.success && backendData.data) {

    // Usar dados do backend}

    products = backendData.data.products || backendData.data.items || []

    fromBackend = true
}        // Normalizar estrutura (alguns arquivos tem wrapper, outros não)

        } else {

    // Fallback para dados locaisconst products = Array.isArray(data) ? data : data[category] || []

    products = await loadCatalogFile(category)

    // Atualizar cache

    // Aplicar filtros locaiscache.set(cacheKey, { data: products, timestamp: Date.now() })

    products = filterProducts(products, {

        distributor, return products

                search,
    } catch (error) {

        minPrice, console.error(`Error loading catalog file for ${category}:`, error)

        maxPrice,    return []

    })
}

        }}



// Paginaçãofunction filterProducts(

const total = products.length    products: any[],

const paginatedProducts = products.slice(offset, offset + limit)    filters: {

    distributor?: string

        // Resposta        search?: string

        return NextResponse.json(minPrice ?: number

            {
            maxPrice?: number

                success: true,
        }

                data: {): any[] {

    products: paginatedProducts, let filtered = [...products]

    pagination: {

        total,    // Filtrar por distribuidor

            limit,    if (filters.distributor) {

                offset,        const dist = filters.distributor.toUpperCase()

                hasMore: offset + limit < total, filtered = filtered.filter(

                    }, (p) =>

            filters: {
                p.id?.toUpperCase().includes(dist) ||

                category, p.distributor?.toUpperCase() === dist ||

                distributor, p.sku?.toUpperCase().includes(dist)

            search,        )

            minPrice,    }

        maxPrice,

                    },    // Busca por texto

}, if (filters.search) {

    fromBackend,        const searchLower = filters.search.toLowerCase()

    timestamp: new Date().toISOString(), filtered = filtered.filter((p) => {

    },            const searchable = [

        {
            p.name,

            headers: {
                p.sku,

                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', p.manufacturer,

            }, p.model,

        }                p.description,

        ) p.id,

    } catch (error: any) {            ]

    console.error('Error in products API:', error).filter(Boolean)

    return NextResponse.json(                .join(' ')

            {                .toLowerCase()

                success: false,

            error: 'Internal server error', return searchable.includes(searchLower)

                message: error.message,
        })

},    }

{ status: 500 }

        )    // Filtrar por preço

    }    if (filters.minPrice !== undefined) {

} filtered = filtered.filter((p) => (p.price || 0) >= filters.minPrice!)

    }

// Limpar cache periodicamente

if (typeof setInterval !== 'undefined') {
    if (filters.maxPrice !== undefined) {

        setInterval(() => {
            filtered = filtered.filter((p) => (p.price || 0) <= filters.maxPrice!)

            const now = Date.now()
        }

        for (const [key, value] of cache.entries()) {

            if (now - value.timestamp > CACHE_TTL) {
                return filtered

                cache.delete(key)
            }

        }

    } export async function GET(request: NextRequest) {

    }, CACHE_TTL) try {

    }        const { searchParams } = new URL(request.url)

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
