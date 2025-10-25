/**
 * API Route: /api/catalog/kits
 * Retorna kits prontos do catálogo
 * 
 * Query params:
 * - limit: número de kits (default: 50)
 * - offset: paginação (default: 0)
 * - distributor: filtrar por distribuidor (FOTUS, NEOSOLAR)
 * - minPower: potência mínima em kWp
 * - maxPower: potência máxima em kWp
 * - type: tipo de kit (grid-tie, hybrid, off-grid)
 * - search: buscar por nome/SKU
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const REQUEST_TIMEOUT_MS = 10000

// Cache em memória
const CACHE_TTL = 3600000 // 1 hora
let kitsCache: { data: any[]; timestamp: number } | null = null

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

async function loadKits(): Promise<any[]> {
    // Verificar cache
    if (kitsCache && Date.now() - kitsCache.timestamp < CACHE_TTL) {
        return kitsCache.data
    }

    try {
        const catalogPath = path.join(
            process.cwd(),
            '..',
            '..',
            'ysh-erp',
            'data',
            'catalog',
            'unified_schemas',
            'kits_unified.json'
        )

        const fileContent = await fs.readFile(catalogPath, 'utf8')
        const kits = JSON.parse(fileContent)

        // Validar estrutura
        const kitsArray = Array.isArray(kits) ? kits : []

        // Atualizar cache
        kitsCache = { data: kitsArray, timestamp: Date.now() }

        return kitsArray
    } catch (error) {
        console.error('Error loading kits:', error)
        return []
    }
}

function extractPowerFromName(name: string): number | null {
    // Extrair potência do nome (ex: "Kit 10.5kWp" -> 10.5)
    const match = name.match(/(\d+\.?\d*)\s*kWp/i)
    return match ? parseFloat(match[1]) : null
}

function filterKits(
    kits: any[],
    filters: {
        distributor?: string
        minPower?: number
        maxPower?: number
        type?: string
        search?: string
        roofType?: string
    }
): any[] {
    let filtered = [...kits]

    // Filtrar por distribuidor
    if (filters.distributor) {
        const dist = filters.distributor.toUpperCase()
        filtered = filtered.filter(
            (k) =>
                k.id?.toUpperCase().includes(dist) ||
                k.distributor?.toUpperCase() === dist
        )
    }

    // Filtrar por potência
    if (filters.minPower !== undefined || filters.maxPower !== undefined) {
        filtered = filtered.filter((k) => {
            const power = k.power_kwp || extractPowerFromName(k.name || '')
            if (!power) return false

            if (filters.minPower !== undefined && power < filters.minPower) return false
            if (filters.maxPower !== undefined && power > filters.maxPower) return false

            return true
        })
    }

    // Filtrar por tipo
    if (filters.type) {
        const typeLower = filters.type.toLowerCase()
        filtered = filtered.filter((k) => {
            const kitType = (k.type || k.category || '').toLowerCase()
            return (
                kitType.includes(typeLower) ||
                k.id?.toLowerCase().includes('hibrido') ||
                k.name?.toLowerCase().includes(typeLower)
            )
        })
    }

    // Filtrar por tipo de telhado
    if (filters.roofType) {
        const roofLower = filters.roofType.toLowerCase()
        filtered = filtered.filter((k) => {
            const roofType = (k.roof_type || '').toLowerCase()
            return roofType.includes(roofLower) || k.name?.toLowerCase().includes(roofLower)
        })
    }

    // Busca por texto
    if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter((k) => {
            const searchable = [
                k.name,
                k.id,
                k.sku,
                k.description,
                k.manufacturer,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return searchable.includes(searchLower)
        })
    }

    return filtered
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse query params
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const distributor = searchParams.get('distributor') || undefined
        const minPower = searchParams.get('minPower')
            ? parseFloat(searchParams.get('minPower')!)
            : undefined
        const maxPower = searchParams.get('maxPower')
            ? parseFloat(searchParams.get('maxPower')!)
            : undefined
        const type = searchParams.get('type') || undefined
        const roofType = searchParams.get('roofType') || undefined
        const search = searchParams.get('search') || undefined

        // Tentar buscar do backend primeiro
        const backendParams = new URLSearchParams()
        if (limit) backendParams.set('limit', limit.toString())
        if (offset) backendParams.set('offset', offset.toString())
        if (distributor) backendParams.set('distributor', distributor)
        if (minPower !== undefined) backendParams.set('minPower', minPower.toString())
        if (maxPower !== undefined) backendParams.set('maxPower', maxPower.toString())
        if (type) backendParams.set('type', type)
        if (roofType) backendParams.set('roofType', roofType)
        if (search) backendParams.set('search', search)

        const backendEndpoint = `/store/internal-catalog/kits`
        const backendData = await tryBackendFetch(backendEndpoint, backendParams)

        let kits: any[] = []
        let fromBackend = false

        if (backendData && backendData.success && backendData.data) {
            // Usar dados do backend
            kits = backendData.data.kits || backendData.data.items || []
            fromBackend = true
        } else {
            // Fallback para dados locais
            kits = await loadKits()

            // Aplicar filtros locais
            kits = filterKits(kits, {
                distributor,
                minPower,
                maxPower,
                type,
                roofType,
                search,
            })
        }

        // Paginação
        const total = kits.length
        const paginatedKits = kits.slice(offset, offset + limit)

        // Resposta
        return NextResponse.json(
            {
                success: true,
                data: {
                    kits: paginatedKits,
                    pagination: {
                        total,
                        limit,
                        offset,
                        hasMore: offset + limit < total,
                    },
                    filters: {
                        distributor,
                        minPower,
                        maxPower,
                        type,
                        roofType,
                        search,
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
        console.error('Error in kits API:', error)
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
