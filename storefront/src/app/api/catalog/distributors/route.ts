import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const REQUEST_TIMEOUT_MS = 10000

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

// Cache em memória (2 horas)
let cache: {
    data: any
    timestamp: number
} | null = null

const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 horas

/**
 * GET /api/catalog/distributors
 * 
 * Retorna lista de distribuidores com estatísticas
 * 
 * Query Params:
 * - includeStats: boolean (default: false) - Incluir estatísticas detalhadas
 * - includeProducts: boolean (default: false) - Incluir sample de produtos
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     distributors: [
 *       {
 *         name: string,
 *         totalProducts: number,
 *         categories: string[],
 *         priceRange: { min, max, avg },
 *         sampleProducts: [...] // if includeProducts=true
 *       }
 *     ],
 *     summary: {
 *       totalDistributors: number,
 *       totalProducts: number
 *     }
 *   },
 *   timestamp: string
 * }
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const includeStats = searchParams.get('includeStats') === 'true'
        const includeProducts = searchParams.get('includeProducts') === 'true'

        // Tentar buscar do backend primeiro
        const backendParams = new URLSearchParams()
        if (includeStats) backendParams.set('includeStats', 'true')
        if (includeProducts) backendParams.set('includeProducts', 'true')

        const backendEndpoint = `/store/internal-catalog/distributors`
        const backendData = await tryBackendFetch(backendEndpoint, backendParams)

        if (backendData && backendData.success && backendData.data) {
            // Usar dados do backend
            return NextResponse.json({
                success: true,
                data: backendData.data,
                fromBackend: true,
                timestamp: new Date().toISOString(),
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400',
                },
            })
        }

        // Check cache (only for basic request without products)
        if (!includeProducts && cache && Date.now() - cache.timestamp < CACHE_TTL) {
            return NextResponse.json(cache.data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400',
                },
            })
        }

        const catalogPath = path.join(process.cwd(), '../../ysh-erp/data/catalog/unified_schemas')

        const categories = [
            'panels',
            'inverters',
            'batteries',
            'structures',
            'cables',
            'accessories',
            'stringboxes',
        ]

        const distributorMap = new Map<string, {
            name: string
            totalProducts: number
            categories: Set<string>
            products: any[]
            prices: number[]
        }>()

        // Load products from all categories
        for (const category of categories) {
            try {
                const filePath = path.join(catalogPath, `${category}_unified.json`)
                const data = await fs.readFile(filePath, 'utf-8')
                const products = JSON.parse(data)

                for (const product of products) {
                    const distributor = product.distributor || product.centro_distribuicao || 'UNKNOWN'

                    if (!distributorMap.has(distributor)) {
                        distributorMap.set(distributor, {
                            name: distributor,
                            totalProducts: 0,
                            categories: new Set(),
                            products: [],
                            prices: [],
                        })
                    }

                    const dist = distributorMap.get(distributor)!
                    dist.totalProducts++
                    dist.categories.add(category)

                    if (includeProducts && dist.products.length < 6) {
                        dist.products.push({
                            ...product,
                            category,
                        })
                    }

                    if (includeStats && product.price_brl) {
                        dist.prices.push(product.price_brl)
                    }
                }
            } catch (error) {
                console.error(`Error loading products for ${category}:`, error)
            }
        }

        // Also load kits
        try {
            const kitsPath = path.join(catalogPath, 'kits_unified.json')
            const kitsData = await fs.readFile(kitsPath, 'utf-8')
            const allKits = JSON.parse(kitsData)

            for (const kit of allKits) {
                const distributor = kit.distributor || kit.centro_distribuicao || 'UNKNOWN'

                if (!distributorMap.has(distributor)) {
                    distributorMap.set(distributor, {
                        name: distributor,
                        totalProducts: 0,
                        categories: new Set(),
                        products: [],
                        prices: [],
                    })
                }

                const dist = distributorMap.get(distributor)!
                dist.totalProducts++
                dist.categories.add('kits')

                if (includeProducts && dist.products.length < 6) {
                    dist.products.push({
                        ...kit,
                        category: 'kits',
                    })
                }

                if (includeStats && kit.price_brl) {
                    dist.prices.push(kit.price_brl)
                }
            }
        } catch (error) {
            console.error('Error loading kits:', error)
        }

        // Build distributors array
        const distributors = Array.from(distributorMap.values()).map((dist) => {
            const result: any = {
                name: dist.name,
                totalProducts: dist.totalProducts,
                categories: Array.from(dist.categories),
            }

            if (includeStats && dist.prices.length > 0) {
                const sortedPrices = dist.prices.sort((a, b) => a - b)
                result.priceRange = {
                    min: sortedPrices[0],
                    max: sortedPrices[sortedPrices.length - 1],
                    avg: sortedPrices.reduce((a, b) => a + b, 0) / sortedPrices.length,
                }
            }

            if (includeProducts) {
                result.sampleProducts = dist.products
            }

            return result
        })

        // Sort by total products (descending)
        distributors.sort((a, b) => b.totalProducts - a.totalProducts)

        const result = {
            success: true,
            data: {
                distributors: distributors,
                summary: {
                    totalDistributors: distributors.length,
                    totalProducts: distributors.reduce((sum, d) => sum + d.totalProducts, 0),
                },
            },
            fromBackend: false,
            timestamp: new Date().toISOString(),
        }

        // Update cache (only if not including products)
        if (!includeProducts) {
            cache = {
                data: result,
                timestamp: Date.now(),
            }
        }

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400',
            },
        })
    } catch (error) {
        console.error('Error in /api/catalog/distributors:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to load distributors',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
