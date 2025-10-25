/**
 * Catalog Panels API Route
 * Serves unified panels from catalog
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
            'panels_unified.json'
        )

        const fileContent = await fs.readFile(catalogPath, 'utf-8')
        const panels = JSON.parse(fileContent)

        const panelsWithAvailability = panels.map((panel: any) => ({
            ...panel,
            availability: true,
        }))

        return NextResponse.json(panelsWithAvailability, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        })

    } catch (error) {
        console.error('[API] Error loading panels:', error)
        return NextResponse.json(
            { error: 'Failed to load panels catalog' },
            { status: 500 }
        )
    }
}
