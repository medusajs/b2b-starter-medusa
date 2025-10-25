/**
 * Financing Summary Component
 *
 * Summary of financing results with action buttons
 */

'use client'

import React from 'react'
import { Button, toast } from '@medusajs/ui'
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

    const handleDownloadPDF = async () => {
        try {
            const { generateFinancingPDF, downloadPDF } = await import('@/lib/util/pdf-generator')

            // Get installment data for the recommended scenario
            const installments = recommendedScenario.installments.months_36 ||
                recommendedScenario.installments.months_24 ||
                recommendedScenario.installments.months_12

            if (!installments) {
                throw new Error('No installment data available')
            }

            const pdfBlob = await generateFinancingPDF({
                productName: `Sistema Solar ${recommendedScenario.kwp}kWp`,
                productPrice: recommendedScenario.capex,
                downPayment: 0, // Adjust if down payment is required
                financedAmount: recommendedScenario.capex,
                installments: installments.term_months,
                installmentValue: installments.monthly_payment,
                totalAmount: installments.total_paid,
                interestRate: data.interest_rate.monthly_rate,
                effectiveRate: data.interest_rate.annual_rate,
                generatedAt: new Date(data.calculated_at),
            })

            const filename = `financiamento-${data.id}-${Date.now()}.pdf`
            downloadPDF(pdfBlob, filename)
            toast.success('PDF de financiamento gerado com sucesso', {
                duration: 2000,
            })
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Erro ao gerar PDF. Tente novamente.')
        }
    }

    const handleAddToCart = async () => {
        try {
            // Add financing scenario to cart as a product/quote
            const response = await fetch('/api/cart/line-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variant_id: `financing-${recommendedScenario.scenario}`,
                    quantity: 1,
                    metadata: {
                        financing_id: data.id,
                        scenario: recommendedScenario.scenario,
                        kwp: recommendedScenario.kwp,
                        capex: recommendedScenario.capex,
                        monthly_savings: recommendedScenario.monthly_savings,
                        financing_details: recommendedScenario.installments,
                        is_financing_quote: true,
                    }
                }),
            })

            if (response.ok) {
                toast.success('Kit de financiamento adicionado ao carrinho', {
                    duration: 3000,
                })
                setTimeout(() => {
                    window.location.href = '/br/cart'
                }, 500)
            } else {
                throw new Error('Failed to add to cart')
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            toast.error('Erro ao adicionar ao carrinho. Tente novamente.')
        }
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
