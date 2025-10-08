/**
 * Financing Summary Component
 *
 * Summary of financing results with action buttons
 */

'use client'

import React from 'react'
import { Button } from '@medusajs/ui'
import { Download, ShoppingCart, RotateCcw, CheckCircle } from 'lucide-react'
import type { FinanceOutput } from '@/modules/finance/types'

interface FinancingSummaryProps {
    data: FinanceOutput
    onStartOver: () => void
}

export function FinancingSummary({ data, onStartOver }: FinancingSummaryProps) {
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

    const recommendedScenario = data.recommended_scenario

    const handleDownloadPDF = () => {
        // TODO: Implement PDF download
        console.log('Downloading PDF for calculation:', data.id)
        alert('Funcionalidade de download em breve!')
    }

    const handleAddToCart = () => {
        // TODO: Implement cart integration
        console.log('Adding to cart:', data.id)
        alert('Funcionalidade de carrinho em breve!')
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Simulação Concluída
                    </h3>
                    <p className="text-sm text-gray-600">
                        Aqui está o resumo da sua simulação de financiamento
                    </p>
                </div>
            </div>

            {/* Key Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Cenário Recomendado</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {recommendedScenario.scenario}%
                    </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Payback</p>
                    <p className="text-2xl font-bold text-green-700">
                        {recommendedScenario.roi.payback_years.toFixed(1)} anos
                    </p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600 mb-1">TIR</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {formatPercent(recommendedScenario.roi.irr)}
                    </p>
                </div>
            </div>

            {/* Investment Breakdown */}
            <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                    Investimento Detalhado
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Sistema Solar</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(data.input.capex.kit)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Mão de Obra</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(data.input.capex.labor)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Documentação</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(data.input.capex.technical_docs)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatCurrency(recommendedScenario.capex)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Savings */}
            <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                    Economia Projetada
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-green-600">Economia Mensal</p>
                            <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(recommendedScenario.monthly_savings)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-green-600">Economia em 25 anos</p>
                            <p className="text-xl font-bold text-green-700">
                                {formatCurrency(recommendedScenario.roi.savings_25y)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financing Options */}
            <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                    Opções de Financiamento
                </h4>
                <div className="space-y-2">
                    {recommendedScenario.installments.months_24 && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">24 meses</span>
                            <span className="text-lg font-bold">
                                {formatCurrency(recommendedScenario.installments.months_24.monthly_payment)}/mês
                            </span>
                        </div>
                    )}
                    {recommendedScenario.installments.months_36 && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">36 meses</span>
                            <span className="text-lg font-bold">
                                {formatCurrency(recommendedScenario.installments.months_36.monthly_payment)}/mês
                            </span>
                        </div>
                    )}
                    {recommendedScenario.installments.months_48 && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">48 meses</span>
                            <span className="text-lg font-bold">
                                {formatCurrency(recommendedScenario.installments.months_48.monthly_payment)}/mês
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={handleDownloadPDF}
                    variant="secondary"
                    className="flex-1 flex items-center justify-center space-x-2"
                >
                    <Download className="h-4 w-4" />
                    <span>Baixar Proposta</span>
                </Button>

                <Button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Adicionar ao Carrinho</span>
                </Button>

                <Button
                    onClick={onStartOver}
                    variant="secondary"
                    className="flex-1 flex items-center justify-center space-x-2 border border-gray-300"
                >
                    <RotateCcw className="h-4 w-4" />
                    <span>Nova Simulação</span>
                </Button>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                    <strong>Importante:</strong> Esta simulação é baseada em estimativas e condições de mercado atuais.
                    As taxas e condições finais podem variar conforme análise de crédito e política da instituição financeira.
                </p>
            </div>
        </div>
    )
}