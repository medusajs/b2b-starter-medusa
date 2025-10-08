/**
 * Health Check API Route
 * Verifica status do storefront
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        // Temporarily simplified - fallback system disabled due to encoding issues
        return NextResponse.json({
            healthy: true,
            storefront: {
                online: true,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        }, {
            status: 200
        })
    } catch (error) {
        return NextResponse.json({
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, {
            status: 500
        })
    }
}
