/**
 * Catalog Inverters API Route
 * Serves unified inverters from catalog
 */

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
    try {
        const catalogPath = path.join(
            process.cwd(),
            '..',
            '..',
            'ysh-erp',
            'data',
            'catalog',
            'unified_schemas',
            'inverters_unified.json'
        )

        const fileContent = await fs.readFile(catalogPath, 'utf-8')
        const inverters = JSON.parse(fileContent)

        const invertersWithAvailability = inverters.map((inv: any) => ({
            ...inv,
            availability: true,
        }))

        return NextResponse.json(invertersWithAvailability, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        })

    } catch (error) {
        console.error('[API] Error loading inverters:', error)
        return NextResponse.json(
            { error: 'Failed to load inverters catalog' },
            { status: 500 }
        )
    }
}
