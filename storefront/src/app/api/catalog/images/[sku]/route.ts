/**
 * API Route: /api/catalog/images/[sku]
 * Get product images by SKU
 * 
 * Path Params:
 * - sku: string - Product SKU
 * 
 * Query Params:
 * - format: 'json' | 'redirect' (default: 'json')
 * - size: 'thumbnail' | 'medium' | 'large' | 'original' (default: 'original')
 * 
 * Response (json format):
 * {
 *   success: true,
 *   data: {
 *     sku: string,
 *     images: string[],
 *     primary: string
 *   }
 * }
 * 
 * Response (redirect format):
 * Redirects to image URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const REQUEST_TIMEOUT_MS = 5000

async function tryBackendFetch(sku: string, params: URLSearchParams): Promise<any | null> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const url = `${BACKEND_URL}/store/internal-catalog/images/${sku}?${params.toString()}`
        const response = await fetch(url, {
            headers,
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.warn(`Backend fetch failed for images/${sku}:`, error)
        return null
    }
}

async function getLocalImageMap(): Promise<Record<string, string>> {
    try {
        const imageMapPath = path.join(
            process.cwd(),
            '..',
            '..',
            'ysh-erp',
            'data',
            'catalog',
            'images',
            'IMAGE_MAP.json'
        )

        const data = await fs.readFile(imageMapPath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error loading local image map:', error)
        return {}
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sku: string }> }
) {
    try {
        const { sku } = await params
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'
        const size = searchParams.get('size') || 'original'

        // Try backend first
        const backendParams = new URLSearchParams()
        backendParams.set('format', format)
        backendParams.set('size', size)

        const backendData = await tryBackendFetch(sku, backendParams)

        if (backendData && backendData.success) {
            if (format === 'redirect' && backendData.data?.primary) {
                return NextResponse.redirect(backendData.data.primary)
            }

            return NextResponse.json({
                success: true,
                data: backendData.data,
                fromBackend: true,
                timestamp: new Date().toISOString(),
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
                },
            })
        }

        // Fallback to local image map
        const imageMap = await getLocalImageMap()
        const imageUrl = imageMap[sku] || imageMap[sku.toUpperCase()] || null

        if (!imageUrl) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Image not found',
                    message: `No image found for SKU: ${sku}`,
                },
                { status: 404 }
            )
        }

        if (format === 'redirect') {
            return NextResponse.redirect(imageUrl)
        }

        return NextResponse.json({
            success: true,
            data: {
                sku,
                images: [imageUrl],
                primary: imageUrl,
            },
            fromBackend: false,
            timestamp: new Date().toISOString(),
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
            },
        })
    } catch (error: any) {
        console.error('Error in images API:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to load image',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
