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

// Cache em memória (1 hora)
let cache: {
    data: any
    timestamp: number
} | null = null

const CACHE_TTL = 60 * 60 * 1000 // 1 hora

/**
 * GET /api/catalog/featured
 * 
 * Retorna produtos em destaque para showcase na home
 * 
 * Query Params:
 * - limit: number (default: 12) - Total de produtos featured
 * - includeKits: boolean (default: true) - Incluir kits no resultado
 * - categories: string (comma-separated) - Categorias específicas (ex: "panels,inverters")
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     featured: [...products],
 *     kits: [...kits],
 *     total: number
 *   },
 *   timestamp: string
 * }
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '12')
        const includeKits = searchParams.get('includeKits') !== 'false'
        const categoriesParam = searchParams.get('categories')
        const categories = categoriesParam ? categoriesParam.split(',') : ['panels', 'inverters', 'batteries']

        // Tentar buscar do backend primeiro
        const backendParams = new URLSearchParams()
        if (limit) backendParams.set('limit', limit.toString())
        if (includeKits !== undefined) backendParams.set('includeKits', includeKits.toString())
        if (categoriesParam) backendParams.set('categories', categoriesParam)

        const backendEndpoint = `/store/internal-catalog/featured`
        const backendData = await tryBackendFetch(backendEndpoint, backendParams)

        let result: any
        let fromBackend = false

        if (backendData && backendData.success && backendData.data) {
            // Usar dados do backend
            result = {
                success: true,
                data: backendData.data,
                fromBackend: true,
                timestamp: new Date().toISOString(),
            }
            fromBackend = true
        } else {
            // Check cache
            if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
                return NextResponse.json(cache.data, {
                    headers: {
                        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
                    },
                })
            }

            const catalogPath = path.join(process.cwd(), '../../ysh-erp/data/catalog/unified_schemas')

            const featured: any[] = []
            const kits: any[] = []

            // Load featured products from each category
            for (const category of categories) {
                try {
                    const filePath = path.join(catalogPath, `${category}_unified.json`)
                    const data = await fs.readFile(filePath, 'utf-8')
                    const products = JSON.parse(data)

                    // Get top products (by tier, efficiency, or popularity)
                    const topProducts = products
                        .filter((p: any) => {
                            // Filter high-quality products
                            if (category === 'panels') {
                                return p.tier_recommendation?.[0] === 'XPP' ||
                                    p.tier_recommendation?.[0] === 'PP' ||
                                    (p.efficiency_pct && p.efficiency_pct > 20)
                            }
                            if (category === 'inverters') {
                                return p.manufacturer?.toLowerCase().includes('fronius') ||
                                    p.manufacturer?.toLowerCase().includes('growatt') ||
                                    p.manufacturer?.toLowerCase().includes('sma')
                            }
                            return p.price_brl !== undefined && p.price_brl > 0
                        })
                        .slice(0, Math.ceil(limit / categories.length))

                    featured.push(...topProducts)
                } catch (error) {
                    console.error(`Error loading featured products for ${category}:`, error)
                }
            }

            // Load featured kits if requested
            if (includeKits) {
                try {
                    const kitsPath = path.join(catalogPath, 'kits_unified.json')
                    const kitsData = await fs.readFile(kitsPath, 'utf-8')
                    const allKits = JSON.parse(kitsData)

                    // Get popular kits (between 5-15 kWp)
                    const popularKits = allKits
                        .filter((k: any) => {
                            const power = k.potencia_kwp || 0
                            return power >= 5 && power <= 15
                        })
                        .slice(0, 4)

                    kits.push(...popularKits)
                } catch (error) {
                    console.error('Error loading featured kits:', error)
                }
            }

            result = {
                success: true,
                data: {
                    featured: featured.slice(0, limit),
                    kits: includeKits ? kits : [],
                    total: featured.length + kits.length,
                    categories: categories,
                },
                fromBackend: false,
                timestamp: new Date().toISOString(),
            }

            // Update cache
            cache = {
                data: result,
                timestamp: Date.now(),
            }
        }

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        })
    } catch (error) {
        console.error('Error in /api/catalog/featured:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to load featured products',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
