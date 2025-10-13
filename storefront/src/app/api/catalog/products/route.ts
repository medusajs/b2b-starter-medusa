import { NextRequest, NextResponse } from 'next/server'/**/**/**



export async function GET(request: NextRequest) { * API Route: /api/catalog/products

    return NextResponse.json({ success: true, message: 'Catalog products API' })

} * * API Route: /api/catalog / products * API Route: /api/catalog / products

 * Retorna produtos do catálogo com sistema robusto de fallback

 *    * *

 * Query params:

 * - category: panels, inverters, batteries, structures, cables, accessories, stringboxes, kits, etc. * Retorna produtos do catálogo com sistema robusto de fallback * Retorna produtos do catálogo com sistema robusto de fallback

 * - limit: número de produtos(default: 50)

 * - offset: paginação(default: 0)    * *

 * - distributor: filtrar por distribuidor(FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV)

 * - search: buscar por nome / SKU / fabricante * Query params: * Query params:

 *

 * Sistema de Fallback(em cascata): * - category: panels, inverters, batteries, structures, cables, accessories, stringboxes, kits, etc. * - category: panels, inverters, batteries, structures, cables, accessories, stringboxes, kits, etc.

 * 1. Backend Medusa(/store/internal - catalog)

 * 2. Backend Fallback API(/store/fallback / products) * - limit: número de produtos(default: 50) * - limit: número de produtos(default: 50)

 * 3. Arquivos JSON locais

 */    * - offset: paginação(default: 0) * - offset: paginação(default: 0)



import { NextRequest, NextResponse } from 'next/server'        * - distributor: filtrar por distribuidor(FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV) * - distributor: filtrar por distribuidor(FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV)

import { loadCatalogProducts, type ProductCategory } from '@/lib/catalog/fallback-loader'

import fs from 'fs/promises'            * - search: buscar por nome / SKU / fabricante * - search: buscar por nome / SKU / fabricante

import path from 'path'

                * *

// Cache em memória com TTL de 1 hora

const CACHE_TTL = 3600000 // 1 hora em ms * Sistema de Fallback(em cascata): * Sistema de Fallback(em cascata):

let cache: Map<string, { data: any; timestamp: number }> = new Map()

    * 1. Backend Medusa(/store/internal - catalog) * 1. Backend Medusa(/store/internal - catalog)

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000' * 2. Backend Fallback API(/store/fallback / products) * 2. Backend Fallback API(/store/fallback / products)

export const revalidate = 3600 // 1 hora

const REQUEST_TIMEOUT_MS = 10000 * 3. Arquivos JSON locais * 3. Arquivos JSON locais



const CATEGORY_FILES: Record<ProductCategory, string> = { * / */

panels: 'panels_unified.json',

    inverters: 'inverters_unified.json',

        batteries: 'batteries_unified.json',

            structures: 'structures_unified.json',import { NextRequest, NextResponse } from 'next/server'import { NextRequest, NextResponse } from 'next/server'

cables: 'cables_unified.json',

    accessories: 'accessories_unified.json',import { loadCatalogProducts, type ProductCategory } from '@/lib/catalog/fallback-loader'

stringboxes: 'stringboxes_unified.json',

    kits: 'kits_unified.json',import fs from 'fs/promises'// Cache em memória com TTL de 1 hora

controllers: 'controllers_unified.json',

    ev_chargers: 'ev_chargers_unified.json',import path from 'path'

posts: 'posts_unified.json',

    others: 'others_unified.json',import { NextRequest, NextResponse } from 'next/server'const CACHE_TTL = 3600000 // 1 hora em ms

}

// Cache em memória com TTL de 1 hora

async function fetchWithTimeout(

    url: string,const CACHE_TTL = 3600000 // 1 hora em msimport { loadCatalogProducts, type ProductCategory } from '@/lib/catalog/fallback-loader'let cache: Map<string, { data: any; timestamp: number }> = new Map()

    options: RequestInit = {},

    timeout: number = REQUEST_TIMEOUT_MSlet cache: Map<string, { data: any; timestamp: number }> = new Map()

): Promise<Response> {

    const controller = new AbortController()

    const timeoutId = setTimeout(() => controller.abort(), timeout)

    export const dynamic = 'force-dynamic'

    try {

        const response = await fetch(url, {
            const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'export const dynamic = 'force-dynamic'const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

            ...options,

            signal: controller.signalexport const revalidate = 3600 // 1 hora

        })

        clearTimeout(timeoutId)const REQUEST_TIMEOUT_MS = 10000export const revalidate = 3600 // 1 horaconst REQUEST_TIMEOUT_MS = 10000

        return response

    } catch (error) {

        clearTimeout(timeoutId)

        throw errorconst CATEGORY_FILES: Record<ProductCategory, string> = {

        }

    } panels: 'panels_unified.json',



        async function tryBackendFetch(endpoint: string, params: URLSearchParams): Promise<any | null> {
            inverters: 'inverters_unified.json', export async function GET(request: NextRequest) {

                try {

                    const url = `${BACKEND_URL}${endpoint}?${params.toString()}`        batteries: 'batteries_unified.json', type ProductCategory =

        const headers: HeadersInit = {

                        'Content-Type': 'application/json', structures: 'structures_unified.json',

                    }

                    cables: 'cables_unified.json', try {    | 'panels'

                        // Add publishable key header for Medusa v2

                        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
                            accessories: 'accessories_unified.json',

                                headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

                        } stringboxes: 'stringboxes_unified.json',        const { searchParams } = new URL(request.url) | 'inverters'



                        const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)kits: 'kits_unified.json',



                        if (!response.ok) {
                            controllers: 'controllers_unified.json',            | 'batteries'

                            throw new Error(`HTTP ${response.status}: ${response.statusText}`)

                        } ev_chargers: 'ev_chargers_unified.json',



        const data = await response.json()    posts: 'posts_unified.json',        // Parse query params    | 'structures'

                        return data

                    } catch (error) {
                        others: 'others_unified.json',

                            console.warn(`Backend fetch failed for ${endpoint}:`, error)

                        return null
                    } const category = (searchParams.get('category') || 'panels') as ProductCategory | 'cables'

                }

}



            async function loadCatalogFile(category: ProductCategory): Promise<any[]> {
                async function fetchWithTimeout(        const limit = parseInt(searchParams.get('limit') || '50') | 'accessories'

    const cacheKey = `catalog_${category}`

    const cached = cache.get(cacheKey)    url: string,



    // Verificar cache    options: RequestInit = {},        const offset = parseInt(searchParams.get('offset') || '0') | 'stringboxes'

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {

                    return cached.data    timeout: number = REQUEST_TIMEOUT_MS

                }

): Promise < Response > {

                    try {
                        const distributor = searchParams.get('distributor') || undefined

        // Caminho correto para o catálogo unificado

        const catalogPath = path.join(    const controller = new AbortController()

            process.cwd(),

                        '..', const timeoutId = setTimeout(() => controller.abort(), timeout)        const search = searchParams.get('search') || undefinedconst CATEGORY_FILES: Record<ProductCategory, string> = {

                            '..',

                            'ysh-erp',

                            'data',

                            'catalog', try {

                                'unified_schemas', panels: 'panels_unified.json',

                                CATEGORY_FILES[category]

        ) const response = await fetch(url, {



                                    const fileContent = await fs.readFile(catalogPath, 'utf8')                ...options,            // Validar categoria    inverters: 'inverters_unified.json',

                                    const data = JSON.parse(fileContent)

                signal: controller.signal

        // Normalizar estrutura (alguns arquivos tem wrapper, outros não)

        const products = Array.isArray(data) ? data : data[category] || []
                                })            const validCategories = [batteries: 'batteries_unified.json',



                                    // Atualizar cache                clearTimeout(timeoutId)

                                    cache.set(cacheKey, { data: products, timestamp: Date.now() })

        return response                'panels', structures: 'structures_unified.json',

                                return products

                            } catch(error) { } catch(error) {

                                console.error(`Error loading catalog file for ${category}:`, error)

                                return []            clearTimeout(timeoutId)                'inverters', cables: 'cables_unified.json',

    }

                        }        throw error



function filterProducts(        }                'batteries', accessories: 'accessories_unified.json',

                    products: any[],

                    filters: {}

        distributor?: string

        search?: string    'structures', stringboxes: 'stringboxes_unified.json',

                    minPrice?: number

        maxPrice?: number        async function tryBackendFetch(endpoint: string, params: URLSearchParams): Promise<any | null > {

                    }

): any[] {
                    try { 'cables',}

    let filtered = [...products]

                    const url = `${BACKEND_URL}${endpoint}?${params.toString()}`

                    // Filtrar por distribuidor

                    if (filters.distributor) {
                        const headers: HeadersInit = {

                            const dist = filters.distributor.toUpperCase()                'accessories',

                            filtered = filtered.filter(

                                (p) => 'Content-Type': 'application/json',

                                p.id?.toUpperCase().includes(dist) ||

                                p.distributor?.toUpperCase() === dist ||            }            'stringboxes', async function fetchWithTimeout(

                                    p.sku?.toUpperCase().includes(dist)

        )

                    }

                    // Add publishable key header for Medusa v2      'kits', url: string,

                    // Busca por texto

                    if (filters.search) {
                        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {

                            const searchLower = filters.search.toLowerCase()

                            filtered = filtered.filter((p) => {
                                headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY      'controllers', options: RequestInit = {},

            const searchable = [

                                    p.name,        }

                p.sku,

                                p.manufacturer, 'ev_chargers', timeout: number = REQUEST_TIMEOUT_MS

                p.model,

                                p.description,            const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

                            p.id,

            ]'posts',): Promise < Response > {

                .filter(Boolean)

                                    .join(' ')                if(!response.ok) {

                .toLowerCase()

                                throw new Error(`HTTP ${response.status}: ${response.statusText}`)                'others',    const controller = new AbortController()

                                return searchable.includes(searchLower)

                            })
                        }

                    }

                    'all'    const timeoutId = setTimeout(() => controller.abort(), timeout)

                    // Filtrar por preço

                    if (filters.minPrice !== undefined) {
                        const data = await response.json()

                        filtered = filtered.filter((p) => (p.price || 0) >= filters.minPrice!)

                    } return data    ]



                    if (filters.maxPrice !== undefined) { } catch (error) {

                        filtered = filtered.filter((p) => (p.price || 0) <= filters.maxPrice!)

                    } console.warn(`Backend fetch failed for ${endpoint}:`, error)                try {



                        return filtered                return null

                    }

            } if (!validCategories.includes(category)) {

                    export async function GET(request: NextRequest) {

                        try { } const response = await fetch(url, {

                            const { searchParams } = new URL(request.url)



        // Parse query params

        const category = (searchParams.get('category') || 'panels') as ProductCategory                async function loadCatalogFile(category: ProductCategory): Promise<any[]> {

                                const limit = parseInt(searchParams.get('limit') || '50')                    return NextResponse.json(...options,

        const offset = parseInt(searchParams.get('offset') || '0')

        const distributor = searchParams.get('distributor') || undefined    const cacheKey = `catalog_${category}`

        const search = searchParams.get('search') || undefined

        const minPrice = searchParams.get('minPrice')    const cached = cache.get(cacheKey)                                {

            ? parseFloat(searchParams.get('minPrice')!)

                            : undefined                signal: controller.signal

        const maxPrice = searchParams.get('maxPrice')

                            ? parseFloat(searchParams.get('maxPrice')!)    // Verificar cache

                            : undefined

                        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                            success: false,

        // Validar categoria

        if (!Object.keys(CATEGORY_FILES).includes(category)) { return cached.data })

                            return NextResponse.json(

                                {}

                    error: 'Invalid category',

                                validCategories: Object.keys(CATEGORY_FILES), error: 'Invalid category',

                },

                        { status: 400 } try {

            )

                        }        // Caminho correto para o catálogo unificado                            validCategories, clearTimeout(timeoutId)



        // Tentar buscar do backend primeiro        const catalogPath = path.join(

        const backendParams = new URLSearchParams()

                        if (limit) backendParams.set('limit', limit.toString())            process.cwd(),                        }, return response

                    if (offset) backendParams.set('offset', offset.toString())

                    if (distributor) backendParams.set('distributor', distributor)    '..',

        if (search) backendParams.set('search', search)

                    if (minPrice !== undefined) backendParams.set('minPrice', minPrice.toString())        '..', { status: 400 }

                    if (maxPrice !== undefined) backendParams.set('maxPrice', maxPrice.toString())

                    'ysh-erp',                    } catch (error) {

                        const backendEndpoint = `/store/internal-catalog/${category}`

                        const backendData = await tryBackendFetch(backendEndpoint, backendParams)        'data',



                            let products: any[] = []            'catalog',      ) clearTimeout(timeoutId)

                        let fromBackend = false

                        'unified_schemas',

        if (backendData && backendData.success && backendData.data) {

                            // Usar dados do backend            CATEGORY_FILES[category]

                            products = backendData.data.products || backendData.data.items || []
                        } throw error

                        fromBackend = true

                    } else {        )

                    // Fallback para dados locais

                    products = await loadCatalogFile(category)
                }



                // Aplicar filtros locaisconst fileContent = await fs.readFile(catalogPath, 'utf8')

                products = filterProducts(products, {

                    distributor, const data = JSON.parse(fileContent)    // Carregar produtos com fallback}

                search,

                    minPrice,

                    maxPrice,

                })// Normalizar estrutura (alguns arquivos tem wrapper, outros não)    const result = await loadCatalogProducts(category, {

            }

            const products = Array.isArray(data) ? data : data[category] || []

            // Paginação

            const total = products.lengthlimit, async function tryBackendFetch(endpoint: string, params: URLSearchParams): Promise<any | null> {

                const paginatedProducts = products.slice(offset, offset + limit)

                // Atualizar cache

                // Resposta

                return NextResponse.json(cache.set(cacheKey, { data: products, timestamp: Date.now() })                        offset, try {

                    {

                        success: true,

                            data: {

                            products: paginatedProducts,        return products                            search, const url = `${BACKEND_URL}${endpoint}?${params.toString()}`

                            pagination: {

                                total,    } catch (error) {

                                    limit,

                                        offset, console.error(`Error loading catalog file for ${category}:`, error)      distributor, const headers: HeadersInit = {

                                            hasMore: offset + limit < total,

                                        },            return []

                                    filters: {

                                        category,        } useCache: true            'Content-Type': 'application/json',

                                            distributor,

                                            search,}

                            minPrice,

                                maxPrice,})

                    },

                }, function filterProducts(            }

            fromBackend,

                timestamp: new Date().toISOString(), products: any[],

            },

    {
        filters: {

            headers: {

                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', distributor?: string

            },

        }        search?: string        // Resposta        // Add publishable key header for Medusa v2

        )

    } catch (error: any) {
        minPrice ?: number

        console.error('Error in products API:', error)

        return NextResponse.json(maxPrice ?: number        return NextResponse.json(        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {

            {

                success: false,        }

            error: 'Internal server error',

                message: error.message,): any[] {

            }, {

                { status: 500 }

        ) let filtered = [...products]                headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

            }

        }



        // Limpar cache periodicamente        // Filtrar por distribuidor                success: true,        }

        if (typeof setInterval !== 'undefined') {

            setInterval(() => {
                if (filters.distributor) {

                    const now = Date.now()

                    for (const [key, value] of cache.entries()) {
                        const dist = filters.distributor.toUpperCase()            data: {

                            if(now - value.timestamp > CACHE_TTL) {

                cache.delete(key)        filtered = filtered.filter(

            }

        } (p) => products: result.products,        const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

    }, CACHE_TTL)

} p.id?.toUpperCase().includes(dist) ||

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
