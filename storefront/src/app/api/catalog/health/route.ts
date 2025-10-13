/**
 * API Route: /api/catalog/health
 * Health check endpoint for catalog system
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     status: 'healthy',
 *     backend: 'online' | 'offline',
 *     localCatalog: 'available' | 'unavailable',
 *     timestamp: string
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const REQUEST_TIMEOUT_MS = 5000

async function checkBackendHealth(): Promise<boolean> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const response = await fetch(`${BACKEND_URL}/store/internal-catalog/health`, {
            headers,
            signal: controller.signal,
            cache: 'no-store'
        })

        clearTimeout(timeoutId)
        return response.ok
    } catch (error) {
        return false
    }
}

async function checkLocalCatalog(): Promise<boolean> {
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

        await fs.stat(catalogPath)
        return true
    } catch (error) {
        return false
    }
}

export async function GET(request: NextRequest) {
    try {
        const [backendOnline, localAvailable] = await Promise.all([
            checkBackendHealth(),
            checkLocalCatalog()
        ])

        const status = backendOnline || localAvailable ? 'healthy' : 'degraded'

        return NextResponse.json(
            {
                success: true,
                data: {
                    status,
                    backend: backendOnline ? 'online' : 'offline',
                    localCatalog: localAvailable ? 'available' : 'unavailable',
                    backendUrl: BACKEND_URL,
                    timestamp: new Date().toISOString(),
                },
            },
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            }
        )
    } catch (error: any) {
        console.error('Error in health check:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Health check failed',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
