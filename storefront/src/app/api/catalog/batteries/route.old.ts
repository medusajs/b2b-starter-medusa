/**
 * Catalog Batteries API Route
 * Serves batteries from catalog (from kits with batteries)
 */

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
    try {
        // Extract batteries from kits catalog
        const kitsPath = path.join(
            process.cwd(),
            '..',
            '..',
            'ysh-erp',
            'data',
            'catalog',
            'unified_schemas',
            'kits_unified.json'
        )

        const fileContent = await fs.readFile(kitsPath, 'utf-8')
        const kits = JSON.parse(fileContent)

        // Extract unique batteries from kits
        const batteriesMap = new Map()

        kits.forEach((kit: any) => {
            if (kit.batteries && Array.isArray(kit.batteries)) {
                kit.batteries.forEach((battery: any, index: number) => {
                    const batteryId = `${kit.distributor}_battery_${kit.id}_${index}`

                    if (!batteriesMap.has(batteryId)) {
                        batteriesMap.set(batteryId, {
                            id: batteryId,
                            name: battery.description || battery.brand || 'Battery',
                            manufacturer: battery.brand || 'Unknown',
                            category: 'batteries',
                            technical_specs: {
                                capacity_ah: battery.capacity_ah,
                                voltage_v: battery.voltage_v,
                            },
                            availability: true,
                            source_kit: kit.id,
                        })
                    }
                })
            }
        })

        const batteries = Array.from(batteriesMap.values())

        return NextResponse.json(batteries, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        })

    } catch (error) {
        console.error('[API] Error loading batteries:', error)
        return NextResponse.json(
            { error: 'Failed to load batteries catalog' },
            { status: 500 }
        )
    }
}
