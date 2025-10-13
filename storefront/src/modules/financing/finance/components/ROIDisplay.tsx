/**
 * ROIDisplay Component
 * 
 * Displays ROI metrics: TIR, VPL, Payback, 25-year savings
 */

'use client'

import React from 'react'
import type { ROICalculation } from '../types'

interface ROIDisplayProps {
    roi: ROICalculation
    /** Show detailed breakdown */
    detailed?: boolean
    /** Show comparison with other investments */
    showComparison?: boolean
}

export default function ROIDisplay({
    roi,
    detailed = false,
    showComparison = false,
}: ROIDisplayProps) {
    // Comparison data (typical investment returns in Brazil)
    const comparisons = [
        { name: 'Poupança', irr: 6.5, icon: '🏦' },
        { name: 'CDB', irr: 9.5, icon: '📊' },
        { name: 'Tesouro Direto', irr: 11.0, icon: '🏛️' },
        { name: 'Energia Solar', irr: roi.irr, icon: '☀️' },
    ]

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(value)
    }

    const formatPercent = (value: number) => {
        return `${value.toFixed(2)}%`
    }

    return (
        <div className="space-y-6">
            {/* Main metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* TIR */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">TIR</span>
                        <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                        {formatPercent(roi.irr)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                        Taxa Interna de Retorno
                    </p>
                </div>

                {/* VPL */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">VPL</span>
                        <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                        {formatCurrency(roi.npv)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        Valor Presente Líquido
                    </p>
                </div>

                {/* Payback */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-900">Payback</span>
                        <span className="text-2xl">⏱️</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">
                        {roi.payback_years.toFixed(1)} anos
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                        {roi.payback_months} meses
                    </p>
                </div>

                {/* 25-year savings */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">25 Anos</span>
                        <span className="text-2xl">🎯</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                        {formatCurrency(roi.savings_25y)}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                        Economia Total
                    </p>
                </div>
            </div>

            {/* Detailed breakdown */}
            {detailed && (
                <div className="bg-gray-50 border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Análise Detalhada</h3>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Mês de Break-even:</span>
                            <span className="font-semibold">{roi.breakeven_month}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Retorno Anual Médio:</span>
                            <span className="font-semibold">{formatPercent(roi.irr)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Valor Presente Líquido:</span>
                            <span className="font-semibold">{formatCurrency(roi.npv)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Economia em 10 anos:</span>
                            <span className="font-semibold">
                                {formatCurrency(roi.savings_25y * 0.4)} {/* Aproximação */}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Economia em 20 anos:</span>
                            <span className="font-semibold">
                                {formatCurrency(roi.savings_25y * 0.8)} {/* Aproximação */}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison with other investments */}
            {showComparison && (
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Comparação de Investimentos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Taxa Interna de Retorno (TIR) comparada com outros investimentos típicos:
                    </p>

                    <div className="space-y-3">
                        {comparisons
                            .sort((a, b) => a.irr - b.irr)
                            .map((investment) => (
                                <div key={investment.name} className="relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium flex items-center gap-2">
                                            <span>{investment.icon}</span>
                                            {investment.name}
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {formatPercent(investment.irr)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${investment.name === 'Energia Solar'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-gray-400'
                                                }`}
                                            style={{
                                                width: `${(investment.irr / Math.max(...comparisons.map(c => c.irr))) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-800">
                            💡 <strong>Energia solar</strong> oferece retorno superior a investimentos tradicionais,
                            com a vantagem de proteger contra aumentos tarifários.
                        </p>
                    </div>
                </div>
            )}

            {/* Break-even timeline */}
            {detailed && (
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Linha do Tempo de Retorno</h3>

                    <div className="relative">
                        {/* Timeline bar */}
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all"
                                style={{
                                    width: `${(roi.payback_years / 25) * 100}%`,
                                }}
                            />
                        </div>

                        {/* Markers */}
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                            <span>Ano 0</span>
                            <span className="font-semibold text-green-600">
                                Payback: {roi.payback_years.toFixed(1)}a
                            </span>
                            <span>25 anos</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4">
                        Após o payback de <strong>{roi.payback_years.toFixed(1)} anos</strong>,
                        você terá mais <strong>{(25 - roi.payback_years).toFixed(1)} anos</strong> de
                        energia praticamente gratuita!
                    </p>
                </div>
            )}
        </div>
    )
}
