import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Cache em memória (1 hora)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hora

/**
 * GET /api/catalog/kit/[id]
 * 
 * Retorna detalhes completos de um kit específico
 * 
 * Path Params:
 * - id: string - ID do kit
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     kit: {...},
 *     components: {
 *       panels: [...],
 *       inverters: [...],
 *       batteries: [...],
 *       structures: [...]
 *     },
 *     related: [...] // kits relacionados
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

        const cacheKey = `kit_${id}`

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

        // Load kits
        const kitsPath = path.join(catalogPath, 'kits_unified.json')
        const kitsData = await fs.readFile(kitsPath, 'utf-8')
        const allKits = JSON.parse(kitsData)

        const kit = allKits.find((k: any) =>
            k.id === id ||
            k.id?.toLowerCase() === id.toLowerCase()
        )

        if (!kit) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Kit not found',
                    message: `Kit with ID ${id} not found in catalog`,
                },
                { status: 404 }
            )
        }

        // Load component details
        const components: any = {
            panels: [],
            inverters: [],
            batteries: [],
            structures: [],
        }

        // Try to find panel details
        if (kit.panels && kit.panels.length > 0) {
            try {
                const panelsPath = path.join(catalogPath, 'panels_unified.json')
                const panelsData = await fs.readFile(panelsPath, 'utf-8')
                const allPanels = JSON.parse(panelsData)

                for (const kitPanel of kit.panels) {
                    const panel = allPanels.find((p: any) =>
                        p.manufacturer?.toLowerCase().includes(kitPanel.brand?.toLowerCase()) &&
                        Math.abs((p.potencia_wp || p.kwp * 1000) - kitPanel.power_w) < 50
                    )
                    if (panel) {
                        components.panels.push({
                            ...panel,
                            quantity: kitPanel.quantity,
                        })
                    }
                }
            } catch (error) {
                console.error('Error loading panel details:', error)
            }
        }

        // Try to find inverter details
        if (kit.inverters && kit.inverters.length > 0) {
            try {
                const invertersPath = path.join(catalogPath, 'inverters_unified.json')
                const invertersData = await fs.readFile(invertersPath, 'utf-8')
                const allInverters = JSON.parse(invertersData)

                for (const kitInverter of kit.inverters) {
                    const inverter = allInverters.find((i: any) =>
                        i.manufacturer?.toLowerCase().includes(kitInverter.brand?.toLowerCase()) &&
                        Math.abs((i.potencia_kw || i.kwp) - kitInverter.power_kw) < 2
                    )
                    if (inverter) {
                        components.inverters.push({
                            ...inverter,
                            quantity: kitInverter.quantity,
                        })
                    }
                }
            } catch (error) {
                console.error('Error loading inverter details:', error)
            }
        }

        // Find related kits (similar power range)
        const related: any[] = []
        const kitPower = kit.potencia_kwp || 0

        const relatedKits = allKits
            .filter((k: any) => {
                if (k.id === kit.id) return false

                const power = k.potencia_kwp || 0
                const powerDiff = Math.abs(power - kitPower)

                // Similar power (±2kWp)
                return powerDiff <= 2
            })
            .slice(0, 4)

        related.push(...relatedKits)

        const result = {
            success: true,
            data: {
                kit: kit,
                components: components,
                related: related,
            },
            timestamp: new Date().toISOString(),
        }

        // Update cache
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
        })

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        })
    } catch (error) {
        console.error('Error in /api/catalog/kit/[id]:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to load kit',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
