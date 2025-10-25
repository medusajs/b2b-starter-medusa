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
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hora

/**
 * GET /api/catalog/product/[id]
 * 
 * Retorna detalhes completos de um produto específico
 * 
 * Path Params:
 * - id: string - ID do produto
 * 
 * Query Params:
 * - category: string (optional) - Categoria para busca mais rápida
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     product: {...},
 *     category: string,
 *     related: [...] // produtos relacionados
 *   },
 *   timestamp: string
 * }
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const categoryHint = searchParams.get('category')

        const cacheKey = `product_${id}`

        // Tentar buscar do backend primeiro
        const backendParams = new URLSearchParams()
        if (categoryHint) backendParams.set('category', categoryHint)

        const backendEndpoint = `/store/internal-catalog/product/${id}`
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
            const cached = cache.get(cacheKey)
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                return NextResponse.json(cached.data, {
                    headers: {
                        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
                    },
                })
            }

            const catalogPath = path.join(process.cwd(), '../../ysh-erp/data/catalog/unified_schemas')

            // Categories to search
            const categories = categoryHint
                ? [categoryHint]
                : ['panels', 'inverters', 'batteries', 'structures', 'cables', 'accessories', 'stringboxes']

            let foundProduct: any = null
            let foundCategory: string = ''

            // Search in categories
            for (const category of categories) {
                try {
                    const filePath = path.join(catalogPath, `${category}_unified.json`)
                    const data = await fs.readFile(filePath, 'utf-8')
                    const products = JSON.parse(data)

                    const product = products.find((p: any) =>
                        p.id === id ||
                        p.sku === id ||
                        p.id?.toLowerCase() === id.toLowerCase()
                    )

                    if (product) {
                        foundProduct = product
                        foundCategory = category
                        break
                    }
                } catch (error) {
                    console.error(`Error searching product in ${category}:`, error)
                }
            }

            if (!foundProduct) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Product not found',
                        message: `Product with ID ${id} not found in catalog`,
                    },
                    { status: 404 }
                )
            }

            // Find related products (same manufacturer or category)
            const related: any[] = []
            if (foundCategory) {
                try {
                    const filePath = path.join(catalogPath, `${foundCategory}_unified.json`)
                    const data = await fs.readFile(filePath, 'utf-8')
                    const products = JSON.parse(data)

                    const relatedProducts = products
                        .filter((p: any) => {
                            if (p.id === foundProduct.id) return false

                            // Same manufacturer
                            if (p.manufacturer && foundProduct.manufacturer) {
                                if (p.manufacturer.toLowerCase() === foundProduct.manufacturer.toLowerCase()) {
                                    return true
                                }
                            }

                            // Similar price range (±20%)
                            if (p.price_brl && foundProduct.price_brl) {
                                const priceDiff = Math.abs(p.price_brl - foundProduct.price_brl) / foundProduct.price_brl
                                if (priceDiff <= 0.2) return true
                            }

                            return false
                        })
                        .slice(0, 6)

                    related.push(...relatedProducts)
                } catch (error) {
                    console.error('Error loading related products:', error)
                }
            }

            result = {
                success: true,
                data: {
                    product: foundProduct,
                    category: foundCategory,
                    related: related,
                },
                fromBackend: false,
                timestamp: new Date().toISOString(),
            }

            // Update cache
            cache.set(cacheKey, {
                data: result,
                timestamp: Date.now(),
            })
        }

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        })
    } catch (error) {
        console.error('Error in /api/catalog/product/[id]:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to load product',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
