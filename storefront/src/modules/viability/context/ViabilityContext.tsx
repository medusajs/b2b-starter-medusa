/**
 * Viability Context
 * Gerencia estado global do dimensionamento fotovoltaico
 */

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ViabilityInput, ViabilityOutput, RoofData, EnergyEstimate } from '../types'

interface ViabilityContextType {
    input: ViabilityInput | null
    output: ViabilityOutput | null
    roofData: RoofData | null
    energyEstimate: EnergyEstimate | null
    isCalculating: boolean
    error: string | null
    setInput: (input: ViabilityInput) => void
    calculate: () => Promise<void>
    reset: () => void
}

const ViabilityContext = createContext<ViabilityContextType | undefined>(undefined)

export function ViabilityProvider({ children }: { children: ReactNode }) {
    const [input, setInput] = useState<ViabilityInput | null>(null)
    const [output, setOutput] = useState<ViabilityOutput | null>(null)
    const [roofData, setRoofData] = useState<RoofData | null>(null)
    const [energyEstimate, setEnergyEstimate] = useState<EnergyEstimate | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const calculate = async () => {
        if (!input) return

        setIsCalculating(true)
        setError(null)

        try {
            // Chamada para API de viabilidade
            const response = await fetch('/api/viability/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            })

            if (!response.ok) {
                throw new Error('Erro ao calcular viabilidade')
            }

            const data = await response.json()
            setOutput(data.viability)
            setRoofData(data.roof)
            setEnergyEstimate(data.energy)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setIsCalculating(false)
        }
    }

    const reset = () => {
        setInput(null)
        setOutput(null)
        setRoofData(null)
        setEnergyEstimate(null)
        setError(null)
    }

    return (
        <ViabilityContext.Provider
            value={{
                input,
                output,
                roofData,
                energyEstimate,
                isCalculating,
                error,
                setInput,
                calculate,
                reset,
            }}
        >
            {children}
        </ViabilityContext.Provider>
    )
}

export function useViability() {
    const context = useContext(ViabilityContext)
    if (!context) {
        throw new Error('useViability must be used within ViabilityProvider')
    }
    return context
}
