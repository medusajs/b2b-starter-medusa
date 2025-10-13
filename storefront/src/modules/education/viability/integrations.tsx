/**
 * 🔗 Viability Module - Integrations
 * Componentes de integração com módulos core do Medusa
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { ViabilityInput, ViabilityOutput } from './types'

// ============================================================================
// Cart Integration
// ============================================================================

/**
 * Adiciona sistema dimensionado ao carrinho
 */
export interface ViabilityCartItem {
    productId: string
    variantId?: string
    quantity: number
    metadata: {
        source: 'viability_calculator'
        kwp: number
        expected_generation: number
        calculation_id?: string
    }
}

export function viabilityToCartItems(output: ViabilityOutput): ViabilityCartItem[] {
    const items: ViabilityCartItem[] = []

    // Inversores
    output.inverters.forEach((inv) => {
        items.push({
            productId: inv.model, // ID do produto no catálogo
            quantity: inv.quantity,
            metadata: {
                source: 'viability_calculator',
                kwp: output.proposal_kwp,
                expected_generation: output.expected_gen_mwh_y,
            },
        })
    })

    // Módulos (strings)
    output.strings.forEach((str) => {
        items.push({
            productId: str.model, // ID do produto no catálogo
            quantity: str.modules,
            metadata: {
                source: 'viability_calculator',
                kwp: output.proposal_kwp,
                expected_generation: output.expected_gen_mwh_y,
            },
        })
    })

    return items
}

/**
 * Widget "Adicionar ao Carrinho" nos resultados de viabilidade
 */
export function AddViabilityToCartButton({
    output,
    onAddToCart,
}: {
    output: ViabilityOutput
    onAddToCart?: (items: ViabilityCartItem[]) => void
}) {
    const handleAddToCart = () => {
        const items = viabilityToCartItems(output)
        onAddToCart?.(items)
    }

    return (
        <button
            onClick={handleAddToCart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Adicionar Sistema ao Carrinho
        </button>
    )
}

/**
 * Banner de sugestão de viabilidade em carrinho vazio
 */
export function EmptyCartViabilitySuggestion({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Dimensione Seu Sistema Fotovoltaico
            </h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                Use nossa calculadora de viabilidade para descobrir o sistema ideal para o seu consumo
            </p>
            <Link
                href={`/${countryCode}/viabilidade`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calcular Viabilidade
            </Link>
        </div>
    )
}

// ============================================================================
// Quote Integration
// ============================================================================

export interface ViabilityQuoteData {
    system_kwp: number
    expected_generation_mwh: number
    performance_ratio: number
    inverters: ViabilityOutput['inverters']
    strings: ViabilityOutput['strings']
    total_investment: number
    source: 'viability_calculator'
}

export function viabilityToQuote(
    input: ViabilityInput,
    output: ViabilityOutput
): ViabilityQuoteData {
    return {
        system_kwp: output.proposal_kwp,
        expected_generation_mwh: output.expected_gen_mwh_y,
        performance_ratio: output.pr,
        inverters: output.inverters,
        strings: output.strings,
        total_investment: input.fatura_media * 12 * 6, // Estimativa simplificada
        source: 'viability_calculator',
    }
}

/**
 * Botão "Solicitar Cotação" nos resultados de viabilidade
 */
export function RequestQuoteFromViability({
    input,
    output,
    countryCode = 'br',
}: {
    input: ViabilityInput
    output: ViabilityOutput
    countryCode?: string
}) {
    const quoteData = viabilityToQuote(input, output)

    return (
        <Link
            href={`/${countryCode}/account/quotes/new?source=viability&data=${encodeURIComponent(JSON.stringify(quoteData))}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Solicitar Cotação Formal
        </Link>
    )
}

// ============================================================================
// Account Integration
// ============================================================================

/**
 * Widget no dashboard mostrando cálculos de viabilidade salvos
 */
export function MyViabilityCalculationsWidget({
    calculationsCount,
    latestCalculation,
    countryCode = 'br',
}: {
    calculationsCount: number
    latestCalculation?: {
        id: string
        kwp: number
        generation_mwh: number
        createdAt: Date
    }
    countryCode?: string
}) {
    return (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-2xl">
                        ⚡
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900">Estudos de Viabilidade</h3>
                        <p className="text-sm text-neutral-600">{calculationsCount} estudos salvos</p>
                    </div>
                </div>
                <Link
                    href={`/${countryCode}/viabilidade`}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                    Novo Estudo
                </Link>
            </div>

            {latestCalculation ? (
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-600">Último estudo</span>
                        <span className="text-xs text-neutral-500">
                            {new Date(latestCalculation.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-neutral-600 mb-0.5">Sistema</div>
                            <div className="font-bold text-neutral-900">
                                {latestCalculation.kwp.toFixed(2)} kWp
                            </div>
                        </div>
                        <div>
                            <div className="text-neutral-600 mb-0.5">Geração</div>
                            <div className="font-bold text-green-600">
                                {latestCalculation.generation_mwh.toFixed(1)} MWh/ano
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/${countryCode}/account/viability/${latestCalculation.id}`}
                        className="mt-3 block text-center text-sm text-amber-700 hover:text-amber-800 font-semibold"
                    >
                        Ver detalhes →
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg p-4 border border-amber-200 text-center">
                    <p className="text-sm text-neutral-600 mb-2">Nenhum estudo salvo ainda</p>
                    <Link
                        href={`/${countryCode}/viabilidade`}
                        className="text-sm text-amber-700 hover:text-amber-800 font-semibold"
                    >
                        Fazer primeiro estudo →
                    </Link>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// Product Integration
// ============================================================================

/**
 * Badge em produtos sugerindo viabilidade
 */
export function ProductViabilitySuggestion({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 mb-1">
                        Não sabe se este produto atende?
                    </h4>
                    <p className="text-sm text-neutral-600 mb-3">
                        Faça um estudo de viabilidade gratuito para dimensionar o sistema ideal
                    </p>
                    <Link
                        href={`/${countryCode}/viabilidade`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                        <span>Calcular viabilidade</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// Finance Integration (preparação para finance module)
// ============================================================================

export interface ViabilityFinanceData {
    system_kwp: number
    total_investment: number
    monthly_generation_kwh: number
    monthly_savings: number
    tariff_kwh: number
}

export function viabilityToFinanceInput(
    input: ViabilityInput,
    output: ViabilityOutput,
    energyEstimate: any
): ViabilityFinanceData {
    return {
        system_kwp: output.proposal_kwp,
        total_investment: input.fatura_media * 12 * 6, // Estimativa
        monthly_generation_kwh: energyEstimate?.geracao_mensal_kwh || 0,
        monthly_savings: energyEstimate?.economia_mensal_brl || 0,
        tariff_kwh: input.fatura_media / input.consumo_kwh_mes || 0.8,
    }
}

/**
 * Link para simulação financeira a partir da viabilidade
 */
export function ViabilityToFinanceLink({
    input,
    output,
    countryCode = 'br',
}: {
    input: ViabilityInput
    output: ViabilityOutput
    countryCode?: string
}) {
    return (
        <Link
            href={`/${countryCode}/financiamento?source=viability&kwp=${output.proposal_kwp}`}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simular Financiamento
        </Link>
    )
}

// ============================================================================
// URL Helpers
// ============================================================================

export function getViabilityUrl(countryCode: string = 'br'): string {
    return `/${countryCode}/viabilidade`
}

export function getViabilityResultUrl(
    calculationId: string,
    countryCode: string = 'br'
): string {
    return `/${countryCode}/viabilidade/${calculationId}`
}
