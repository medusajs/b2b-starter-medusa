// @ts-nocheck - Types need snake_case/camelCase alignment
/**
 * useCalculations Hook
 * 
 * Hook para gerenciamento de cálculos solares e simulações
 * Integra com APIs de dimensionamento solar (NASA POWER, NREL, PVGIS)
 */

import { useState, useCallback } from 'react'
import type { SolarCalculation } from '../types'

interface CalculationInput {
    location: {
        address: string
        city: string
        state: string
        lat?: number
        lng?: number
    }
    consumption: {
        avgMonthlyKwh: number
        avgMonthlyCost: number
        tariffKwh: number
        distributor: string
    }
    preferences?: {
        systemType?: 'grid-tied' | 'off-grid' | 'hybrid'
        roofType?: 'ceramic' | 'metal' | 'concrete' | 'ground'
        orientation?: 'north' | 'south' | 'east' | 'west'
        inclination?: number
    }
}

interface CalculationResult extends SolarCalculation {
    success: boolean
    error?: string
}

export function useCalculations() {
    const [calculations, setCalculations] = useState<SolarCalculation[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Create new calculation
    const createCalculation = useCallback(async (
        input: CalculationInput
    ): Promise<CalculationResult | null> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/solar/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(input)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create calculation')
            }

            const data = await response.json()
            const calculation = data.calculation

            // Add to local state
            setCalculations(prev => [calculation, ...prev])

            return {
                ...calculation,
                success: true
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return {
                id: '',
                customer_id: '',
                name: '',
                status: 'draft',
                location: input.location,
                consumption: input.consumption,
                system: {
                    recommended_capacity_kwp: 0,
                    panel_count: 0,
                    inverter_capacity_kw: 0,
                    estimated_generation_kwh_month: 0,
                    estimated_generation_kwh_year: 0
                },
                financial: {
                    estimated_cost: 0,
                    currency: 'BRL',
                    payback_years: 0,
                    roi_percent: 0,
                    savings_25_years: 0
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                success: false,
                error: errorMessage
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Load calculations from API
    const loadCalculations = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/solar/calculations', {
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to load calculations')
            }

            const data = await response.json()
            setCalculations(data.calculations || [])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Get calculation by ID
    const getCalculation = useCallback(async (id: string): Promise<SolarCalculation | null> => {
        try {
            const response = await fetch(`/api/solar/calculations/${id}`, {
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to load calculation')
            }

            const data = await response.json()
            return data.calculation
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        }
    }, [])

    // Update calculation
    const updateCalculation = useCallback(async (
        id: string,
        updates: Partial<SolarCalculation>
    ): Promise<boolean> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/solar/calculations/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updates)
            })

            if (!response.ok) {
                throw new Error('Failed to update calculation')
            }

            const data = await response.json()

            // Update local state
            setCalculations(prev =>
                prev.map(calc => calc.id === id ? data.calculation : calc)
            )

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Delete calculation
    const deleteCalculation = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/solar/calculations/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to delete calculation')
            }

            // Remove from local state
            setCalculations(prev => prev.filter(calc => calc.id !== id))

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Convert calculation to quote/project
    const convertToQuote = useCallback(async (id: string): Promise<string | null> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/solar/calculations/${id}/convert`, {
                method: 'POST',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to convert calculation')
            }

            const data = await response.json()

            // Update status in local state
            setCalculations(prev =>
                prev.map(calc =>
                    calc.id === id ? { ...calc, status: 'converted' as const } : calc
                )
            )

            return data.quote_id
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Quick estimate (without saving)
    const quickEstimate = useCallback(async (
        monthlyConsumptionKwh: number,
        tariffKwh: number,
        city: string,
        state: string
    ) => {
        try {
            const response = await fetch('/api/solar/quick-estimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    monthlyConsumptionKwh,
                    tariffKwh,
                    city,
                    state
                })
            })

            if (!response.ok) {
                throw new Error('Failed to calculate estimate')
            }

            return await response.json()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        }
    }, [])

    return {
        calculations,
        isLoading,
        error,
        createCalculation,
        loadCalculations,
        getCalculation,
        updateCalculation,
        deleteCalculation,
        convertToQuote,
        quickEstimate
    }
}
