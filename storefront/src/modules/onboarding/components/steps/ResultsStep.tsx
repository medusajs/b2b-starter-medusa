'use client'

/**
 * ResultsStep Component
 * 
 * Exibe os resultados do dimensionamento
 * Hélio em modo 'celebration' comemorando os resultados!
 */

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share2, CheckCircle, TrendingUp } from 'lucide-react'
import HelioVideo from '../HelioVideo'
import type { OnboardingData } from '../../types'

interface ResultsStepProps {
    data: OnboardingData
    onComplete: (data: Partial<OnboardingData>) => void
    onSkip?: () => void
}

interface CalculationResults {
    recommendedCapacity: number // kWp
    estimatedGeneration: number // kWh/ano
    panelCount: number
    inverterCount: number
    estimatedInvestment: number // R$
    monthlySavings: number // R$
    annualSavings: number // R$
    paybackYears: number
    co2Reduction: number // kg/ano
}

export default function ResultsStep({ data, onComplete }: ResultsStepProps) {
    const [results, setResults] = useState<CalculationResults | null>(null)
    const [isCalculating, setIsCalculating] = useState(true)

    useEffect(() => {
        // Simular cálculo (substituir por API real)
        const calculateSystem = async () => {
            setIsCalculating(true)
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Cálculo simplificado
            const monthlyConsumption = data.consumption?.avgMonthlyKwh || data.consumption?.avgMonthlyConsumption || 350
            const annualConsumption = monthlyConsumption * 12

            // Fator de capacidade médio no Brasil: ~17%
            const capacityFactor = 0.17
            const hoursPerYear = 8760

            // Capacidade necessária (kWp)
            const requiredCapacity = annualConsumption / (hoursPerYear * capacityFactor)

            // Painéis de 550W (0.55 kWp)
            const panelPower = 0.55
            const panelCount = Math.ceil(requiredCapacity / panelPower)
            const actualCapacity = panelCount * panelPower

            // Inversores (considerar 1 inversor a cada 5kWp)
            const inverterCount = Math.ceil(actualCapacity / 5)

            // Geração estimada
            const estimatedGeneration = actualCapacity * hoursPerYear * capacityFactor

            // Valores financeiros (estimativa)
            const pricePerWatt = 4.5 // R$/Wp
            const estimatedInvestment = actualCapacity * 1000 * pricePerWatt

            const monthlyBill = data.consumption?.monthlyBill || data.consumption?.avgMonthlyBill || 280
            const coveragePercentage = Math.min(estimatedGeneration / annualConsumption, 0.95)
            const monthlySavings = monthlyBill * coveragePercentage
            const annualSavings = monthlySavings * 12

            const paybackYears = estimatedInvestment / annualSavings

            // Redução de CO2 (fator de emissão médio: 0.075 kg CO2/kWh)
            const co2Reduction = estimatedGeneration * 0.075

            setResults({
                recommendedCapacity: actualCapacity,
                estimatedGeneration,
                panelCount,
                inverterCount,
                estimatedInvestment,
                monthlySavings,
                annualSavings,
                paybackYears,
                co2Reduction
            })

            setIsCalculating(false)

            // Salvar resultados
            onComplete({
                results: {
                    systemCapacity: actualCapacity,
                    annualGeneration: estimatedGeneration,
                    panelCount,
                    inverterCount,
                    estimatedInvestment,
                    monthlySavings,
                    paybackPeriod: paybackYears
                }
            })
        }

        calculateSystem()
    }, [data, onComplete])

    if (isCalculating) {
        return (
            <div className="text-center py-12">
                <HelioVideo
                    variant="compact"
                    autoPlay
                    loop
                />
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                    Calculando seu sistema ideal...
                </h3>
                <p className="text-gray-600">
                    Hélio está analisando todos os dados coletados
                </p>
                <div className="mt-6 flex justify-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        )
    }

    if (!results) return null

    return (
        <div className="space-y-6">
            {/* Hélio em modo celebration */}
            <div className="flex justify-center mb-6">
                <HelioVideo
                    variant="celebration"
                    autoPlay
                    loop={false}
                />
            </div>

            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    🎉 Seu Sistema Foi Dimensionado!
                </h3>
                <p className="text-gray-600">
                    Hélio calculou o sistema ideal para suas necessidades
                </p>
            </div>

            {/* Main Results Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* System Capacity */}
                <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium opacity-90">Potência Recomendada</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">
                        {results.recommendedCapacity.toFixed(2)} kWp
                    </div>
                    <div className="text-sm opacity-90">
                        {results.panelCount} painéis • {results.inverterCount} inversor(es)
                    </div>
                </div>

                {/* Annual Generation */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium opacity-90">Geração Anual</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">
                        {results.estimatedGeneration.toFixed(0)} kWh
                    </div>
                    <div className="text-sm opacity-90">
                        {(results.estimatedGeneration / 12).toFixed(0)} kWh/mês
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-4 text-lg">💰 Resumo Financeiro</h4>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <div className="text-sm text-blue-700 mb-1">Investimento Estimado</div>
                        <div className="text-2xl font-bold text-blue-900">
                            R$ {results.estimatedInvestment.toLocaleString('pt-BR')}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-blue-700 mb-1">Economia Mensal</div>
                        <div className="text-2xl font-bold text-green-600">
                            R$ {results.monthlySavings.toFixed(2)}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-blue-700 mb-1">Economia Anual</div>
                        <div className="text-2xl font-bold text-green-600">
                            R$ {results.annualSavings.toFixed(2)}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-blue-700 mb-1">Payback</div>
                        <div className="text-2xl font-bold text-blue-900">
                            {results.paybackYears.toFixed(1)} anos
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-sm text-blue-700">Economia em 25 anos (vida útil dos painéis)</div>
                    <div className="text-3xl font-bold text-green-600 mt-1">
                        R$ {(results.annualSavings * 25).toLocaleString('pt-BR')}
                    </div>
                </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-3 text-lg">🌱 Impacto Ambiental</h4>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-green-700 mb-1">Redução de CO₂ por ano</div>
                        <div className="text-3xl font-bold text-green-900">
                            {results.co2Reduction.toFixed(0)} kg
                        </div>
                    </div>
                    <div className="text-6xl">🌍</div>
                </div>

                <div className="mt-4 text-sm text-green-700">
                    Equivalente a plantar <span className="font-bold">{Math.ceil(results.co2Reduction / 22)}</span> árvores por ano
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">📋 Próximos Passos</h4>

                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">Solicitar orçamento detalhado</span> com empresas instaladoras parceiras
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">Visita técnica</span> para validar as condições do telhado
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">Documentação</span> e aprovação junto à distribuidora
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">Instalação</span> do sistema fotovoltaico
                        </span>
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    variant="outline"
                    className="flex-1"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório (PDF)
                </Button>
                <Button
                    variant="outline"
                    className="flex-1"
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar Resultados
                </Button>
                <Button
                    className="flex-1 sm:flex-[2]"
                    onClick={() => onComplete({})}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Solicitar Orçamento
                </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-center text-gray-500 italic">
                * Valores estimados. O dimensionamento final e investimento podem variar após visita técnica.
            </p>
        </div>
    )
}
