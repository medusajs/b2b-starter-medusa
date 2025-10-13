/**
 * API Route: /api/catalog/categories
 * Retorna estatísticas e informações sobre categorias do catálogo
 * 
 * Query params:
 * - includeStats: incluir estatísticas detalhadas (default: false)
 */

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

type CategoryInfo = {
    id: string
    name: string
    displayName: string
    totalProducts: number
    distributors?: string[]
    priceRange?: {
        min: number
        max: number
        avg: number
    }
}

const CATEGORIES = [
    {
        id: 'panels',
        file: 'panels_unified.json',
        displayName: 'Painéis Solares',
    },
    {
        id: 'inverters',
        file: 'inverters_unified.json',
        displayName: 'Inversores',
    },
    {
        id: 'batteries',
        file: 'batteries_unified.json',
        displayName: 'Baterias',
    },
    {
        id: 'kits',
        file: 'kits_unified.json',
        displayName: 'Kits Prontos',
    },
    {
        id: 'structures',
        file: 'structures_unified.json',
        displayName: 'Estruturas',
    },
    {
        id: 'cables',
        file: 'cables_unified.json',
        displayName: 'Cabos',
    },
    {
        id: 'accessories',
        file: 'accessories_unified.json',
        displayName: 'Acessórios',
    },
    {
        id: 'stringboxes',
        file: 'stringboxes_unified.json',
        displayName: 'String Boxes',
    },
]

async function getCategoryStats(categoryFile: string): Promise<any> {
    try {
        const catalogPath = path.join(
            process.cwd(),
            '..',
            '..',
            'ysh-erp',
            'data',
            'catalog',
            'unified_schemas',
            categoryFile
        )

        const fileContent = await fs.readFile(catalogPath, 'utf8')
        const items = JSON.parse(fileContent)
        const itemsArray = Array.isArray(items) ? items : []

        // Estatísticas básicas
        const total = itemsArray.length

        // Distribuidores únicos
        const distributors = [
            ...new Set(
                itemsArray
                    .map((item: any) => {
                        // Extrair distribuidor do ID ou campo específico
                        if (item.distributor) return item.distributor
                        if (item.id) {
                            const match = item.id.match(/^([A-Z]+)-/)
                            return match ? match[1] : null
                        }
                        return null
                    })
                    .filter(Boolean)
            ),
        ]

        // Faixa de preços
        const prices = itemsArray
            .map((item: any) => item.price)
            .filter((p: any) => p && p > 0)

        const priceRange =
            prices.length > 0
                ? {
                    min: Math.min(...prices),
                    max: Math.max(...prices),
                    avg: prices.reduce((a: number, b: number) => a + b, 0) / prices.length,
                }
                : undefined

        return {
            total,
            distributors,
            priceRange,
        }
    } catch (error) {
        console.error(`Error getting stats for ${categoryFile}:`, error)
        return { total: 0, distributors: [], priceRange: undefined }
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const includeStats = searchParams.get('includeStats') === 'true'

        // Carregar estatísticas de todas as categorias em paralelo
        const categoriesPromises = CATEGORIES.map(async (cat) => {
            const stats = await getCategoryStats(cat.file)

            const categoryInfo: CategoryInfo = {
                id: cat.id,
                name: cat.id,
                displayName: cat.displayName,
                totalProducts: stats.total,
            }

            if (includeStats) {
                categoryInfo.distributors = stats.distributors
                categoryInfo.priceRange = stats.priceRange
            }

            return categoryInfo
        })

        const categories = await Promise.all(categoriesPromises)

        // Estatísticas globais
        const totalProducts = categories.reduce(
            (sum, cat) => sum + cat.totalProducts,
            0
        )

        const allDistributors = [
            ...new Set(
                categories.flatMap((cat) => cat.distributors || [])
            ),
        ]

        // Resposta
        return NextResponse.json(
            {
                success: true,
                data: {
                    categories,
                    summary: {
                        totalCategories: categories.length,
                        totalProducts,
                        distributors: allDistributors,
                    },
                },
                timestamp: new Date().toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400',
                },
            }
        )
    } catch (error: any) {
        console.error('Error in categories API:', error)
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
