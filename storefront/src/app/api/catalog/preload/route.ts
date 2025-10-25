/**
 * API Route: /api/catalog/preload
 * Preload critical catalog data for faster initial page loads
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     categories: [...],
 *     featuredProducts: [...],
 *     distributors: [...],
 *     stats: {
 *       totalProducts: number,
 *       totalKits: number,
 *       lastUpdate: string
 *     }
 *   }
 * }
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

async function tryBackendFetch(endpoint: string): Promise<any | null> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const response = await fetchWithTimeout(`${BACKEND_URL}${endpoint}`, { headers }, REQUEST_TIMEOUT_MS)

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

async function getLocalPreloadData() {
    const catalogPath = path.join(process.cwd(), '../../ysh-erp/data/catalog/unified_schemas')

    // Load basic stats from each category
    const categories = ['panels', 'inverters', 'batteries', 'kits']
    const stats: any = {
        totalProducts: 0,
        totalKits: 0,
        byCategory: {},
    }

    for (const category of categories) {
        try {
            const filePath = path.join(catalogPath, `${category}_unified.json`)
            const data = await fs.readFile(filePath, 'utf-8')
            const items = JSON.parse(data)
            const count = Array.isArray(items) ? items.length : 0

            if (category === 'kits') {
                stats.totalKits = count
            } else {
                stats.totalProducts += count
            }

            stats.byCategory[category] = count
        } catch (error) {
            console.error(`Error loading ${category}:`, error)
            stats.byCategory[category] = 0
        }
    }

    return {
        categories: categories.map(cat => ({
            id: cat,
            name: cat,
            count: stats.byCategory[cat] || 0
        })),
        featuredProducts: [], // Would require more processing
        distributors: [],
        stats: {
            totalProducts: stats.totalProducts,
            totalKits: stats.totalKits,
            lastUpdate: new Date().toISOString(),
        }
    }
}

export async function GET(request: NextRequest) {
    try {
        // Try backend first
        const backendEndpoint = `/store/internal-catalog/preload`
        const backendData = await tryBackendFetch(backendEndpoint)

        if (backendData && backendData.success && backendData.data) {
            return NextResponse.json(
                {
                    success: true,
                    data: backendData.data,
                    fromBackend: true,
                    timestamp: new Date().toISOString(),
                },
                {
                    headers: {
                        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                    },
                }
            )
        }

        // Fallback to local data
        const localData = await getLocalPreloadData()

        return NextResponse.json(
            {
                success: true,
                data: localData,
                fromBackend: false,
                timestamp: new Date().toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                },
            }
        )
    } catch (error: any) {
        console.error('Error in preload API:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Preload failed',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
