/**
 * Finance Module - Context Provider
 * 
 * Manages state for credit simulation, ROI calculations, and scenario comparisons
 * Integrates with BACEN API for real-time interest rates
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import type {
    FinanceInput,
    FinanceOutput,
    FinancingScenario,
    OversizingScenario,
    FinancingModality,
    InterestRateData,
    FinanceUIState,
    ValidationResult,
} from '../types'
import { fetchBACENRates, getRecommendedSolarRate, getRateScenarios } from '@/lib/bacen/api'
import {
    saveCalculation as persistCalculation,
    getAllCalculations,
    getCalculation as loadCalculationFromStorage,
    deleteCalculation,
    saveScenario as persistScenario,
} from '@/lib/storage/finance-scenarios'

// ============================================================================
// Context Types
// ============================================================================

interface FinanceContextValue {
    // State
    state: FinanceUIState
    currentCalculation: FinanceOutput | null
    savedCalculations: FinanceOutput[]

    // Actions
    calculateFinancing: (input: FinanceInput) => Promise<FinanceOutput>
    selectScenario: (scenario: OversizingScenario) => void
    selectTerm: (months: number) => void
    selectModality: (modality: FinancingModality) => void
    saveCalculation: (calculation: FinanceOutput) => void
    loadCalculation: (id: string) => FinanceOutput | null
    clearCalculation: () => void
    validateInput: (input: Partial<FinanceInput>) => ValidationResult

    // Helpers
    getRecommendedScenario: () => FinancingScenario | null
    compareScenarios: (scenarios: OversizingScenario[]) => FinancingScenario[]
    exportToPDF: (calculationId: string) => Promise<string>
}

// ============================================================================
// Context Creation
// ============================================================================

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)

// ============================================================================
// Provider Component
// ============================================================================

interface FinanceProviderProps {
    children: ReactNode
    /** Initial calculations (from server/storage) */
    initialCalculations?: FinanceOutput[]
    /** Default interest rate */
    defaultInterestRate?: InterestRateData
}

export function FinanceProvider({
    children,
    initialCalculations = [],
    defaultInterestRate,
}: FinanceProviderProps) {
    // State
    const [state, setState] = useState<FinanceUIState>({
        step: 'input',
        loading: false,
        error: undefined,
        selected_scenario: undefined,
        selected_term: undefined,
        selected_modality: 'CDC',
    })

    const [currentCalculation, setCurrentCalculation] = useState<FinanceOutput | null>(null)
    const [savedCalculations, setSavedCalculations] = useState<FinanceOutput[]>(initialCalculations)
    const [bacenRates, setBacenRates] = useState<InterestRateData | null>(null)

    // ============================================================================
    // Fetch BACEN rates on mount
    // ============================================================================

    useEffect(() => {
        async function loadBACENRates() {
            try {
                const rates = await fetchBACENRates()
                const solarRate = getRecommendedSolarRate(rates)

                setBacenRates({
                    annual_rate: solarRate.annual_rate,
                    monthly_rate: solarRate.monthly_rate,
                    source: 'BACEN_API',
                    valid_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
                })

                console.log('BACEN rates loaded:', solarRate)
            } catch (error) {
                console.error('Error loading BACEN rates:', error)
            }
        }

        loadBACENRates()

        // Load saved calculations from storage
        const stored = getAllCalculations()
        if (stored.length > 0) {
            setSavedCalculations(stored)
        }
    }, [])

    // ============================================================================
    // Main calculation function
    // ============================================================================

    const calculateFinancing = useCallback(async (input: FinanceInput): Promise<FinanceOutput> => {
        setState(prev => ({ ...prev, loading: true, error: undefined, step: 'calculating' }))

        try {
            // Validate input
            const validation = validateInput(input)
            if (!validation.is_valid) {
                throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
            }

            // Get current interest rate (BACEN, default, or prop)
            const interestRate = bacenRates || defaultInterestRate || {
                annual_rate: 0.175, // 17.5% default
                monthly_rate: 0.0144, // ~1.44% monthly
                source: 'Default',
            }

            // Calculate scenarios
            const scenarios = await calculateAllScenarios(input, interestRate)

            // Find recommended scenario
            const recommended = findRecommendedScenario(scenarios)

            // Build output
            const output: FinanceOutput = {
                id: input.id,
                input,
                interest_rate: interestRate,
                scenarios,
                recommended_scenario: recommended,
                calculated_at: new Date().toISOString(),
                is_valid: true,
            }

            setCurrentCalculation(output)
            setState(prev => ({
                ...prev,
                loading: false,
                step: 'results',
                selected_scenario: recommended.scenario,
            }))

            return output

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                step: 'input',
            }))
            throw error
        }
    }, [defaultInterestRate])

    // ============================================================================
    // Selection actions
    // ============================================================================

    const selectScenario = useCallback((scenario: OversizingScenario) => {
        setState(prev => ({ ...prev, selected_scenario: scenario }))
    }, [])

    const selectTerm = useCallback((months: number) => {
        setState(prev => ({ ...prev, selected_term: months }))
    }, [])

    const selectModality = useCallback((modality: FinancingModality) => {
        setState(prev => ({ ...prev, selected_modality: modality }))
    }, [])

    // ============================================================================
    // Storage actions
    // ============================================================================

    const saveCalculation = useCallback((calculation: FinanceOutput) => {
        setSavedCalculations(prev => {
            const existing = prev.findIndex(c => c.id === calculation.id)
            if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = calculation
                return updated
            }
            return [calculation, ...prev]
        })

        // Persist to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                `finance_calculation_${calculation.id}`,
                JSON.stringify(calculation)
            )
        }
    }, [])

    const loadCalculation = useCallback((id: string): FinanceOutput | null => {
        // Try memory first
        const fromMemory = savedCalculations.find(c => c.id === id)
        if (fromMemory) {
            setCurrentCalculation(fromMemory)
            return fromMemory
        }

        // Try localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`finance_calculation_${id}`)
            if (stored) {
                const calculation = JSON.parse(stored) as FinanceOutput
                setCurrentCalculation(calculation)
                setSavedCalculations(prev => [calculation, ...prev])
                return calculation
            }
        }

        return null
    }, [savedCalculations])

    const clearCalculation = useCallback(() => {
        setCurrentCalculation(null)
        setState({
            step: 'input',
            loading: false,
            error: undefined,
            selected_scenario: undefined,
            selected_term: undefined,
            selected_modality: 'CDC',
        })
    }, [])

    // ============================================================================
    // Helper functions
    // ============================================================================

    const getRecommendedScenario = useCallback((): FinancingScenario | null => {
        return currentCalculation?.recommended_scenario || null
    }, [currentCalculation])

    const compareScenarios = useCallback((scenarios: OversizingScenario[]): FinancingScenario[] => {
        if (!currentCalculation) return []
        return currentCalculation.scenarios.filter(s => scenarios.includes(s.scenario))
    }, [currentCalculation])

    const exportToPDF = useCallback(async (calculationId: string): Promise<string> => {
        // TODO: Implement PDF export
        // This would call a backend API to generate PDF
        console.log('Exporting to PDF:', calculationId)
        return `/api/finance/pdf/${calculationId}`
    }, [])

    // ============================================================================
    // Validation
    // ============================================================================

    const validateInput = useCallback((input: Partial<FinanceInput>): ValidationResult => {
        const errors: ValidationResult['errors'] = []
        const warnings: ValidationResult['warnings'] = []

        // Required fields
        if (!input.capex?.total || input.capex.total <= 0) {
            errors.push({
                field: 'capex',
                message: 'CAPEX total is required and must be greater than 0',
                code: 'CAPEX_INVALID',
            })
        }

        if (!input.system_kwp || input.system_kwp <= 0) {
            errors.push({
                field: 'system_kwp',
                message: 'System capacity (kWp) is required and must be greater than 0',
                code: 'KWP_INVALID',
            })
        }

        if (!input.annual_generation_kwh || input.annual_generation_kwh <= 0) {
            errors.push({
                field: 'annual_generation_kwh',
                message: 'Annual generation is required and must be greater than 0',
                code: 'GENERATION_INVALID',
            })
        }

        if (!input.monthly_savings_brl || input.monthly_savings_brl <= 0) {
            errors.push({
                field: 'monthly_savings_brl',
                message: 'Monthly savings is required and must be greater than 0',
                code: 'SAVINGS_INVALID',
            })
        }

        // Warnings
        if (input.capex && input.capex.total > 500000) {
            warnings.push({
                field: 'capex',
                message: 'High CAPEX value - consider breaking into multiple systems',
                severity: 'medium',
            })
        }

        if (input.monthly_savings_brl && input.current_monthly_bill_brl) {
            if (input.monthly_savings_brl > input.current_monthly_bill_brl * 1.6) {
                warnings.push({
                    field: 'monthly_savings',
                    message: 'Savings exceed 160% of current bill - check oversizing compliance',
                    severity: 'high',
                })
            }
        }

        return {
            is_valid: errors.length === 0,
            errors,
            warnings,
        }
    }, [])

    // ============================================================================
    // Context value
    // ============================================================================

    const value: FinanceContextValue = {
        state,
        currentCalculation,
        savedCalculations,
        calculateFinancing,
        selectScenario,
        selectTerm,
        selectModality,
        saveCalculation,
        loadCalculation,
        clearCalculation,
        validateInput,
        getRecommendedScenario,
        compareScenarios,
        exportToPDF,
    }

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

// ============================================================================
// Hook
// ============================================================================

export function useFinance() {
    const context = useContext(FinanceContext)
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider')
    }
    return context
}

// ============================================================================
// Calculation helpers (internal)
// ============================================================================

async function calculateAllScenarios(
    input: FinanceInput,
    interestRate: InterestRateData
): Promise<FinancingScenario[]> {
    const scenarios: OversizingScenario[] = [114, 130, 145, 160]

    return scenarios.map(scenario => {
        // Adjust values based on scenario
        const factor = scenario / input.oversizing_scenario
        const kwp = input.system_kwp * factor
        const generation = input.annual_generation_kwh * factor
        const capex = input.capex.total * factor
        const savings = input.monthly_savings_brl * factor

        // Calculate installments for different terms
        const installments = {
            months_12: calculateInstallment(capex, interestRate.monthly_rate, 12),
            months_24: calculateInstallment(capex, interestRate.monthly_rate, 24),
            months_36: calculateInstallment(capex, interestRate.monthly_rate, 36),
            months_48: calculateInstallment(capex, interestRate.monthly_rate, 48),
            months_60: calculateInstallment(capex, interestRate.monthly_rate, 60),
        }

        // Calculate ROI
        const roi = calculateROI(capex, savings, interestRate.annual_rate)

        return {
            scenario,
            kwp,
            generation_kwh: generation,
            capex,
            monthly_savings: savings,
            installments,
            roi,
            is_recommended: scenario === 130, // Default recommendation
            recommendation_reason: scenario === 130 ? 'Best balance between ROI and payback' : undefined,
        }
    })
}

function calculateInstallment(
    principal: number,
    monthlyRate: number,
    months: number
) {
    // PMT formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    const totalPaid = payment * months
    const totalInterest = totalPaid - principal

    return {
        term_months: months,
        monthly_payment: Math.round(payment * 100) / 100,
        total_paid: Math.round(totalPaid * 100) / 100,
        total_interest: Math.round(totalInterest * 100) / 100,
    }
}

function calculateROI(capex: number, monthlySavings: number, annualRate: number) {
    // Simplified ROI calculation
    const annualSavings = monthlySavings * 12

    // Payback
    const paybackYears = capex / annualSavings
    const paybackMonths = Math.round(paybackYears * 12)

    // 25-year savings (with 0.7% annual degradation)
    let savings25y = 0
    for (let year = 1; year <= 25; year++) {
        const degradation = Math.pow(0.993, year - 1) // 0.7% annual
        savings25y += annualSavings * degradation
    }

    // NPV (simplified)
    const discountRate = annualRate
    let npv = -capex
    for (let year = 1; year <= 25; year++) {
        const degradation = Math.pow(0.993, year - 1)
        const yearSavings = annualSavings * degradation
        npv += yearSavings / Math.pow(1 + discountRate, year)
    }

    // IRR (approximation)
    const irr = annualSavings / capex

    return {
        irr: Math.round(irr * 10000) / 100, // percentage with 2 decimals
        npv: Math.round(npv * 100) / 100,
        payback_years: Math.round(paybackYears * 100) / 100,
        payback_months: paybackMonths,
        savings_25y: Math.round(savings25y * 100) / 100,
        breakeven_month: paybackMonths,
    }
}

function findRecommendedScenario(scenarios: FinancingScenario[]): FinancingScenario {
    // Recommend 130% as default (best balance)
    const scenario130 = scenarios.find(s => s.scenario === 130)
    if (scenario130) return scenario130

    // Fallback to best payback
    return scenarios.reduce((best, current) =>
        current.roi.payback_years < best.roi.payback_years ? current : best
    )
}
