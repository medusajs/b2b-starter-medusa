/**
 * Health Check API Route
 * Verifica status do backend Medusa e fornece informações de fallback
 */

import { NextResponse } from 'next/server'
import { checkBackendHealth, getBackendStatus } from '@/lib/api/fallback'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        const isHealthy = await checkBackendHealth()
        const status = getBackendStatus()

        return NextResponse.json({
            healthy: isHealthy,
            backend: {
                online: status.online,
                lastCheck: status.lastCheck,
                errorCount: status.errorCount,
                lastError: status.lastError
            },
            fallback: {
                available: true,
                active: !status.online || status.errorCount >= 3
            },
            timestamp: new Date().toISOString()
        }, {
            status: isHealthy ? 200 : 503
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
