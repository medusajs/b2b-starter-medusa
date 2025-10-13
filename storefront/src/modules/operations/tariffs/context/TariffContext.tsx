/**
 * Tariff Context
 * Gerencia estado global da classificação tarifária
 */

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { TariffInput, TariffClassification, MMGDPacket, TariffRates } from '../types'

interface TariffContextType {
    input: TariffInput | null
    classification: TariffClassification | null
    mmgdPacket: MMGDPacket | null
    rates: TariffRates | null
    isClassifying: boolean
    error: string | null
    setInput: (input: TariffInput) => void
    classify: () => Promise<void>
    reset: () => void
}

const TariffContext = createContext<TariffContextType | undefined>(undefined)

export function TariffProvider({ children }: { children: ReactNode }) {
    const [input, setInput] = useState<TariffInput | null>(null)
    const [classification, setClassification] = useState<TariffClassification | null>(null)
    const [mmgdPacket, setMmgdPacket] = useState<MMGDPacket | null>(null)
    const [rates, setRates] = useState<TariffRates | null>(null)
    const [isClassifying, setIsClassifying] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const classify = async () => {
        if (!input) return

        setIsClassifying(true)
        setError(null)

        try {
            const response = await fetch('/api/tariffs/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            })

            if (!response.ok) {
                throw new Error('Erro ao classificar tarifa')
            }

            const data = await response.json()
            setClassification(data.classification)
            setMmgdPacket(data.mmgd)
            setRates(data.rates)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setIsClassifying(false)
        }
    }

    const reset = () => {
        setInput(null)
        setClassification(null)
        setMmgdPacket(null)
        setRates(null)
        setError(null)
    }

    return (
        <TariffContext.Provider
            value={{
                input,
                classification,
                mmgdPacket,
                rates,
                isClassifying,
                error,
                setInput,
                classify,
                reset,
            }}
        >
            {children}
        </TariffContext.Provider>
    )
}

export function useTariff() {
    const context = useContext(TariffContext)
    if (!context) {
        throw new Error('useTariff must be used within TariffProvider')
    }
    return context
}
