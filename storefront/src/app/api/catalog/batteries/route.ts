/**
 * Catalog Batteries API Route
 * Serves batteries with robust fallback system
 */

import { NextResponse } from 'next/server'
import { loadCatalogProducts } from '@/lib/catalog/fallback-loader'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
  try {
    const result = await loadCatalogProducts('batteries', {
      limit: 1000,
      offset: 0,
      useCache: true
    })

    const batteriesWithAvailability = result.products.map((battery: any) => ({
      ...battery,
      availability: battery.availability !== false,
      in_stock: battery.in_stock !== false,
    }))

    return NextResponse.json(
      {
        success: true,
        data: batteriesWithAvailability,
        total: result.total,
        meta: {
          source: result.source,
          fromCache: result.fromCache,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Data-Source': result.source,
        },
      }
    )
  } catch (error: any) {
    console.error('[Batteries API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load batteries',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
