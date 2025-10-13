/**
 * API Route: /api/catalog/search
 * Busca unificada em todo o catálogo
 * 
 * Query params:
 * - q: termo de busca (obrigatório)
 * - categories: categorias separadas por vírgula (ex: panels,inverters,kits)
 * - limit: número de resultados por categoria (default: 10)
 * - distributor: filtrar por distribuidor
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

type SearchResult = {
    id: string
    name: string
    category: string
    distributor?: string
    sku?: string
    price?: number
    image?: string
    description?: string
    relevance: number
}

const SEARCHABLE_CATEGORIES = [
    'panels_unified.json',
    'inverters_unified.json',
    'batteries_unified.json',
    'kits_unified.json',
    'structures_unified.json',
    'cables_unified.json',
    'accessories_unified.json',
    'stringboxes_unified.json',
]

async function searchInCategory(
    categoryFile: string,
    query: string,
    limit: number
): Promise<SearchResult[]> {
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

        const queryLower = query.toLowerCase()
        const categoryName = categoryFile.replace('_unified.json', '')

        // Buscar e calcular relevância
        const results: SearchResult[] = itemsArray
            .map((item: any) => {
                const searchableText = [
                    item.name,
                    item.sku,
                    item.id,
                    item.manufacturer,
                    item.model,
                    item.description,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()

                // Calcular relevância
                let relevance = 0

                // Match exato no nome (maior peso)
                if (item.name?.toLowerCase().includes(queryLower)) {
                    relevance += 10
                    if (item.name?.toLowerCase() === queryLower) {
                        relevance += 20 // Match exato completo
                    }
                }

                // Match no SKU
                if (item.sku?.toLowerCase().includes(queryLower)) {
                    relevance += 8
                }

                // Match no ID
                if (item.id?.toLowerCase().includes(queryLower)) {
                    relevance += 7
                }

                // Match no fabricante/modelo
                if (
                    item.manufacturer?.toLowerCase().includes(queryLower) ||
                    item.model?.toLowerCase().includes(queryLower)
                ) {
                    relevance += 5
                }

                // Match na descrição (menor peso)
                if (item.description?.toLowerCase().includes(queryLower)) {
                    relevance += 2
                }

                // Match genérico
                if (searchableText.includes(queryLower) && relevance === 0) {
                    relevance += 1
                }

                if (relevance === 0) return null

                return {
                    id: item.id || item.sku,
                    name: item.name || item.id,
                    category: categoryName,
                    distributor: item.distributor,
                    sku: item.sku,
                    price: item.price,
                    image: item.image || item.image_url,
                    description: item.description,
                    relevance,
                }
            })
            .filter(Boolean) as SearchResult[]

        // Ordenar por relevância e limitar
        return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
    } catch (error) {
        console.error(`Error searching in ${categoryFile}:`, error)
        return []
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse query params
        const query = searchParams.get('q')
        const categoriesParam = searchParams.get('categories')
        const limit = parseInt(searchParams.get('limit') || '10')
        const distributor = searchParams.get('distributor')

        // Validar query
        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Query must be at least 2 characters',
                },
                { status: 400 }
            )
        }

        // Tentar buscar do backend primeiro
        const backendParams = new URLSearchParams()
        backendParams.set('q', query.trim())
        if (categoriesParam) backendParams.set('categories', categoriesParam)
        if (limit) backendParams.set('limit', limit.toString())
        if (distributor) backendParams.set('distributor', distributor)

        const backendEndpoint = `/store/internal-catalog/search`
        const backendData = await tryBackendFetch(backendEndpoint, backendParams)

        let allResults: SearchResult[] = []
        let resultsByCategory: Record<string, SearchResult[]> = {}
        let fromBackend = false

        if (backendData && backendData.success && backendData.data) {
            // Usar dados do backend
            allResults = backendData.data.results || []
            resultsByCategory = backendData.data.byCategory || {}
            fromBackend = true
        } else {
            // Fallback para busca local
            // Determinar categorias para buscar
            let categoriesToSearch = SEARCHABLE_CATEGORIES

            if (categoriesParam) {
                const requestedCategories = categoriesParam.split(',')
                categoriesToSearch = SEARCHABLE_CATEGORIES.filter((file) =>
                    requestedCategories.some((cat) => file.includes(cat))
                )
            }

            // Buscar em paralelo em todas as categorias
            const searchPromises = categoriesToSearch.map((categoryFile) =>
                searchInCategory(categoryFile, query.trim(), limit)
            )

            const searchResults = await Promise.all(searchPromises)

            // Combinar e ordenar resultados
            allResults = searchResults.flat()

            // Filtrar por distribuidor se especificado
            if (distributor) {
                const distUpper = distributor.toUpperCase()
                allResults = allResults.filter(
                    (r) =>
                        r.id?.toUpperCase().includes(distUpper) ||
                        r.distributor?.toUpperCase() === distUpper
                )
            }

            // Ordenar por relevância global
            allResults.sort((a, b) => b.relevance - a.relevance)

            // Agrupar por categoria
            resultsByCategory = allResults.reduce((acc, result) => {
                if (!acc[result.category]) {
                    acc[result.category] = []
                }
                acc[result.category].push(result)
                return acc
            }, {} as Record<string, SearchResult[]>)
        }

        // Resposta
        return NextResponse.json(
            {
                success: true,
                data: {
                    query: query.trim(),
                    total: allResults.length,
                    results: allResults.slice(0, limit * 3), // Top results
                    byCategory: resultsByCategory,
                },
                fromBackend,
                timestamp: new Date().toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                },
            }
        )
    } catch (error: any) {
        console.error('Error in search API:', error)
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
