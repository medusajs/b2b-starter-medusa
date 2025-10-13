/**
 * Energy Estimator Component
 * Estimativa de geração e economia
 */

'use client'

import React from 'react'
import { useViability } from '../context/ViabilityContext'

export default function EnergyEstimator() {
    const { energyEstimate } = useViability()

    if (!energyEstimate) return null

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value)
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Estimativa de Geração e Economia
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-neutral-600 mb-1">Geração Anual</p>
                    <p className="text-3xl font-bold text-green-600">
                        {energyEstimate.geracao_anual_kwh.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-neutral-500">kWh/ano</p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-neutral-600 mb-1">Economia Anual</p>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(energyEstimate.economia_anual_brl)}
                    </p>
                    <p className="text-xs text-neutral-500">por ano</p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-neutral-600 mb-1">Compensação</p>
                    <p className="text-3xl font-bold text-green-600">
                        {energyEstimate.compensacao_percentual}%
                    </p>
                    <p className="text-xs text-neutral-500">do consumo</p>
                </div>
            </div>

            {energyEstimate.excedente_kwh > 0 && (
                <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-sm font-semibold text-green-900">
                        💚 Excedente: {energyEstimate.excedente_kwh.toLocaleString('pt-BR')} kWh/ano
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                        Créditos disponíveis para compensação futura
                    </p>
                </div>
            )}
        </div>
    )
}
