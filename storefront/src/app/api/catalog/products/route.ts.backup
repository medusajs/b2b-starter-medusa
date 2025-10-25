/**
 * API Route: /api/catalog/products
 * Retorna produtos do catálogo unificado
 * 
 * Query params:
 * - category: panels, inverters, batteries, structures, cables, accessories, stringboxes
 * - limit: número de produtos (default: 50)
 * - offset: paginação (default: 0)
 * - distributor: filtrar por distribuidor (FOTUS, NEOSOLAR, ODEX, SOLFACIL, FORTLEV)
 * - search: buscar por nome/SKU/fabricante
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Cache em memória com TTL de 1 hora
const CACHE_TTL = 3600000 // 1 hora em ms
let cache: Map<string, { data: any; timestamp: number }> = new Map()

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const REQUEST_TIMEOUT_MS = 10000

type ProductCategory =
    | 'panels'
    | 'inverters'
    | 'batteries'
    | 'structures'
    | 'cables'
    | 'accessories'
    | 'stringboxes'

const CATEGORY_FILES: Record<ProductCategory, string> = {
    panels: 'panels_unified.json',
    inverters: 'inverters_unified.json',
    batteries: 'batteries_unified.json',
    structures: 'structures_unified.json',
    cables: 'cables_unified.json',
    accessories: 'accessories_unified.json',
    stringboxes: 'stringboxes_unified.json',
}

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

async function tryBackendFetch(endpoint: string, params: URLSearchParams): Promise<any | null> {
    try {
        const url = `${BACKEND_URL}${endpoint}?${params.toString()}`
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        // Add publishable key header for Medusa v2
        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const response = await fetchWithTimeout(url, { headers }, REQUEST_TIMEOUT_MS)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.warn(`Backend fetch failed for ${endpoint}:`, error)
        return null
    }
}

async function loadCatalogFile(category: ProductCategory): Promise<any[]> {
    const cacheKey = `catalog_${category}`
    const cached = cache.get(cacheKey)

    // Verificar cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }

    try {
        // Caminho correto para o catálogo unificado
        const catalogPath = path.join(
            process.cwd(),
            '..',
            '..',
            'ysh-erp',
            'data',
            'catalog',
            'unified_schemas',
            CATEGORY_FILES[category]
        )

        const fileContent = await fs.readFile(catalogPath, 'utf8')
        const data = JSON.parse(fileContent)

        // Normalizar estrutura (alguns arquivos tem wrapper, outros não)
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
