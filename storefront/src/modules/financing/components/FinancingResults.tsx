/**
 * Financing Results Component
 *
 * Displays financing calculation results and scenarios
 */

'use client'

import React from 'react'
import { CheckCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import type { FinanceOutput, FinancingScenario } from '@/modules/finance/types'
import ROIDisplay from '@/modules/financing/finance/components/ROIDisplay'

interface FinancingResultsProps {
    data: FinanceOutput
}

export function FinancingResults({ data }: FinancingResultsProps) {
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

    const getScenarioColor = (scenario: FinancingScenario) => {
        if (scenario.is_recommended) {
            return 'border-green-500 bg-green-50'
        }
        return 'border-gray-200 bg-white'
    }

    const getScenarioBadge = (scenario: FinancingScenario) => {
        if (scenario.is_recommended) {
            return (
                <div className="flex items-center space-x-1 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Recomendado</span>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Resultados da Simulação
                    </h3>
                    <p className="text-sm text-gray-600">
                        Cenários de financiamento baseados nas suas informações
                    </p>
                </div>
            </div>

            {/* Interest Rate Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                            Taxa de Juros Utilizada
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-blue-700">
                            {formatPercent(data.interest_rate.annual_rate)}
                        </p>
                        <p className="text-xs text-blue-600">
                            {data.interest_rate.source}
                        </p>
                    </div>
                </div>
            </div>

            {/* ROI Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <ROIDisplay
                    roi={data.recommended_scenario.roi}
                    detailed={true}
                    showComparison={true}
                />
            </div>

            {/* Scenarios Grid */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">
                    Cenários de Financiamento
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.scenarios.map((scenario) => (
                        <div
                            key={scenario.scenario}
                            className={`border-2 rounded-lg p-4 transition-all ${getScenarioColor(scenario)}`}
                        >
                            {/* Scenario Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h5 className="text-lg font-semibold text-gray-900">
                                        Cenário {scenario.scenario}%
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                        {scenario.kwp.toFixed(2)} kWp • {scenario.generation_kwh.toLocaleString()} kWh/ano
                                    </p>
                                </div>
                                {getScenarioBadge(scenario)}
                            </div>

                            {/* Investment */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">Investimento</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatCurrency(scenario.capex)}
                                </p>
                            </div>

                            {/* Monthly Savings */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">Economia Mensal</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {formatCurrency(scenario.monthly_savings)}
                                </p>
                            </div>

                            {/* Installment Options */}
                            <div className="space-y-3">
                                <h6 className="text-sm font-medium text-gray-900">
                                    Opções de Parcelamento
                                </h6>

                                <div className="grid grid-cols-2 gap-2">
                                    {scenario.installments.months_12 && (
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-xs text-gray-600">12 meses</p>
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(scenario.installments.months_12.monthly_payment)}
                                            </p>
                                        </div>
                                    )}

                                    {scenario.installments.months_24 && (
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-xs text-gray-600">24 meses</p>
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(scenario.installments.months_24.monthly_payment)}
                                            </p>
                                        </div>
                                    )}

                                    {scenario.installments.months_36 && (
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-xs text-gray-600">36 meses</p>
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(scenario.installments.months_36.monthly_payment)}
                                            </p>
                                        </div>
                                    )}

                                    {scenario.installments.months_48 && (
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-xs text-gray-600">48 meses</p>
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(scenario.installments.months_48.monthly_payment)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ROI Summary */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Payback</p>
                                        <p className="font-semibold">
                                            {scenario.roi.payback_years.toFixed(1)} anos
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">TIR</p>
                                        <p className="font-semibold">
                                            {formatPercent(scenario.roi.irr)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation Reason */}
                            {scenario.recommendation_reason && (
                                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                    <p className="text-xs text-green-800">
                                        {scenario.recommendation_reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                        Resumo da Simulação
                    </span>
                </div>
                <p className="text-sm text-gray-600">
                    Com base nos dados informados, o cenário recomendado oferece o melhor equilíbrio
                    entre retorno sobre investimento e período de payback. As taxas utilizadas são
                    baseadas em dados atualizados do BACEN.
                </p>
            </div>
        </div>
    )
}
