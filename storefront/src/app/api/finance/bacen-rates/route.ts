/**
 * BACEN Rates API Route
 * 
 * GET /api/finance/bacen-rates
 * 
 * Returns current interest rates from Banco Central do Brasil
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchBACENRates, getRecommendedSolarRate, getRateScenarios } from '@/lib/bacen/api'

export async function GET(request: NextRequest) {
    try {
        console.log('[BACEN API] Fetching rates...')

        // Fetch rates from BACEN
        const rates = await fetchBACENRates()

        // Get solar-specific rate
        const solarRate = getRecommendedSolarRate(rates)

        // Get rate scenarios
        const scenarios = getRateScenarios(rates)

        // Build response
        const response = {
            success: true,
            data: {
                // Raw BACEN data
                bacen: rates,

                // Recommended rate for solar financing
                solar_rate: solarRate,

                // Rate scenarios (conservative, moderate, aggressive)
                scenarios,

                // Metadata
                fetched_at: new Date().toISOString(),
                cache_duration_seconds: 3600,
            },
        }

        console.log('[BACEN API] Rates fetched successfully')

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        })

    } catch (error) {
        console.error('[BACEN API] Error:', error)

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    code: 'BACEN_FETCH_ERROR',
                },
                // Return fallback rates
                data: {
                    solar_rate: {
                        annual_rate: 0.245, // 24.5% fallback
                        monthly_rate: 0.0184, // ~1.84% monthly
                        rate_type: 'fallback',
                        source: 'FALLBACK',
                    },
                    scenarios: {
                        conservative: { annual_rate: 0.525, monthly_rate: 0.035 },
                        moderate: { annual_rate: 0.245, monthly_rate: 0.0184 },
                        aggressive: { annual_rate: 0.185, monthly_rate: 0.0142 },
                    },
                },
            },
            { status: 500 }
        )
    }
}

// Allow CORS for client-side fetching
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
