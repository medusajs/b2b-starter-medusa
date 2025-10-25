/**
 * useBACENRates Hook
 * 
 * Custom hook to fetch and manage BACEN interest rates
 */

'use client'

import { useState, useEffect } from 'react'
import type { BACENInterestRate } from '@/lib/bacen/api'

interface BACENRatesResponse {
    bacen: BACENInterestRate
    solar_rate: {
        annual_rate: number
        monthly_rate: number
        rate_type: string
        source: string
    }
    scenarios: {
        conservative: { annual_rate: number; monthly_rate: number }
        moderate: { annual_rate: number; monthly_rate: number }
        aggressive: { annual_rate: number; monthly_rate: number }
    }
    fetched_at: string
    cache_duration_seconds: number
}

interface UseBACENRatesReturn {
    rates: BACENRatesResponse | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useBACENRates(): UseBACENRatesReturn {
    const [rates, setRates] = useState<BACENRatesResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRates = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/finance/bacen-rates', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Cache for 1 hour
                next: { revalidate: 3600 },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error?.message || 'Failed to fetch rates')
            }

            setRates(data.data)
            console.log('[useBACENRates] Rates loaded:', data.data.solar_rate)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('[useBACENRates] Error:', errorMessage)

            // Set fallback rates
            setRates({
                bacen: {
                    selic: 10.75,
                    cdi: 10.65,
                    ipca: 4.5,
                    credit_rates: {
                        personal_non_consigned: 52.5,
                        personal_consigned_inss: 18.5,
                        other_goods_acquisition: 24.5,
                        vehicle_acquisition: 22.8,
                    },
                    updated_at: new Date().toISOString(),
                    source: 'BACEN_API',
                },
                solar_rate: {
                    annual_rate: 0.245,
                    monthly_rate: 0.0184,
                    rate_type: 'fallback',
                    source: 'FALLBACK',
                },
                scenarios: {
                    conservative: { annual_rate: 0.525, monthly_rate: 0.035 },
                    moderate: { annual_rate: 0.245, monthly_rate: 0.0184 },
                    aggressive: { annual_rate: 0.185, monthly_rate: 0.0142 },
                },
                fetched_at: new Date().toISOString(),
                cache_duration_seconds: 3600,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRates()
    }, [])

    return {
        rates,
        loading,
        error,
        refetch: fetchRates,
    }
}
