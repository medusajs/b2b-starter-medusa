/**
 * 🔗 Tariffs Module - Integrations
 * Componentes de integração com módulos core do Medusa
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { TariffInput, TariffClassification, MMGDPacket, TariffRates } from './types'

// ============================================================================
// Viability Integration
// ============================================================================

/**
 * Dados de tarifa para alimentar cálculo de viabilidade
 */
export interface TariffToViabilityData {
    tariff_kwh: number
    tariff_class: string
    tariff_subgroup: string
    distributor: string
    mmgd_eligible: boolean
}

export function tariffToViabilityInput(
    classification: TariffClassification,
    rates: TariffRates,
    mmgd: MMGDPacket | null
): TariffToViabilityData {
    return {
        tariff_kwh: rates.total,
        tariff_class: classification.IdcClasse,
        tariff_subgroup: classification.IdcSubgrupo,
        distributor: '', // Deve vir do input
        mmgd_eligible: mmgd?.eligibility.is_eligible || false,
    }
}

/**
 * Link para viabilidade após classificação tarifária
 */
export function TariffToViabilityButton({
    input,
    classification,
    rates,
    countryCode = 'br',
}: {
    input: TariffInput
    classification: TariffClassification
    rates: TariffRates
    countryCode?: string
}) {
    const viabilityData = tariffToViabilityInput(classification, rates, null)

    return (
        <Link
            href={`/${countryCode}/viabilidade?tariff=${rates.total}&class=${classification.IdcClasse}&subgroup=${classification.IdcSubgrupo}`}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Calcular Viabilidade Fotovoltaica
        </Link>
    )
}

// ============================================================================
// Finance Integration
// ============================================================================

/**
 * Dados de tarifa para simulação financeira
 */
export interface TariffFinanceData {
    monthly_bill: number
    tariff_kwh: number
    tariff_increase_yearly: number
    distribuidora: string
    grupo: string
    subgrupo: string
}

export function tariffToFinanceInput(
    input: TariffInput,
    rates: TariffRates
): TariffFinanceData {
    const monthlyBill = input.consumo_kwh_mes * rates.total

    return {
        monthly_bill: monthlyBill,
        tariff_kwh: rates.total,
        tariff_increase_yearly: 0.08, // 8% ao ano (média histórica)
        distribuidora: input.distribuidora,
        grupo: '', // Classificação
        subgrupo: '',
    }
}

/**
 * Link para simulação financeira após classificação
 */
export function TariffToFinanceButton({
    input,
    rates,
    countryCode = 'br',
}: {
    input: TariffInput
    rates: TariffRates
    countryCode?: string
}) {
    return (
        <Link
            href={`/${countryCode}/financiamento?tariff=${rates.total}&consumption=${input.consumo_kwh_mes}`}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simular Economia e Financiamento
        </Link>
    )
}

// ============================================================================
// Account Integration
// ============================================================================

/**
 * Widget no dashboard mostrando classificação tarifária salva
 */
export function MyTariffClassificationWidget({
    classification,
    rates,
    countryCode = 'br',
}: {
    classification?: TariffClassification
    rates?: TariffRates
    countryCode?: string
}) {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-2xl">
                        📊
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900">Minha Classificação Tarifária</h3>
                        {classification && (
                            <p className="text-sm text-neutral-600">
                                Grupo {classification.IdcClasse} - Subgrupo {classification.IdcSubgrupo}
                            </p>
                        )}
                    </div>
                </div>
                <Link
                    href={`/${countryCode}/tarifas`}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                    Atualizar
                </Link>
            </div>

            {classification && rates ? (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-neutral-600 mb-0.5">Tarifa Total</div>
                            <div className="font-bold text-neutral-900">
                                R$ {rates.total.toFixed(4)}/kWh
                            </div>
                        </div>
                        <div>
                            <div className="text-neutral-600 mb-0.5">Bandeira</div>
                            <div className="font-bold text-blue-600 capitalize">{rates.bandeira}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
                    <p className="text-sm text-neutral-600 mb-2">Ainda não classificado</p>
                    <Link
                        href={`/${countryCode}/tarifas`}
                        className="text-sm text-blue-700 hover:text-blue-800 font-semibold"
                    >
                        Classificar agora →
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
 * Badge em produtos mostrando economia baseada na tarifa
 */
export function ProductTariffSavingsBadge({
    productKwp,
    tariffKwh,
}: {
    productKwp: number
    tariffKwh: number
}) {
    // Estimativa simplificada de economia mensal
    const monthlyGeneration = productKwp * 5.0 * 30 // HSP médio 5.0, 30 dias
    const monthlySavings = monthlyGeneration * tariffKwh

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-300 rounded-lg">
            <span className="text-lg">💰</span>
            <div className="text-sm">
                <div className="font-semibold text-green-900">
                    Economia estimada: R$ {monthlySavings.toFixed(2)}/mês
                </div>
                <div className="text-xs text-green-700">
                    Baseado na tarifa de R$ {tariffKwh.toFixed(4)}/kWh
                </div>
            </div>
        </div>
    )
}

/**
 * Sugestão de classificação tarifária em produtos
 */
export function ProductTariffSuggestion({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📋</span>
                <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 mb-1">Descubra sua tarifa exata</h4>
                    <p className="text-sm text-neutral-600 mb-3">
                        Classifique sua unidade consumidora e calcule a economia precisa com energia solar
                    </p>
                    <Link
                        href={`/${countryCode}/tarifas`}
                        className="inline-flex items-center gap-1 text-yellow-700 hover:text-yellow-800 font-semibold text-sm"
                    >
                        <span>Classificar tarifa</span>
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
// Cart Integration
// ============================================================================

/**
 * Calculadora de economia no carrinho baseada na tarifa
 */
export function CartTariffSavings({
    totalKwp,
    tariffKwh,
}: {
    totalKwp: number
    tariffKwh?: number
}) {
    if (!tariffKwh) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-neutral-700">
                    <Link href="/tarifas" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Classifique sua tarifa
                    </Link>{' '}
                    para ver a economia estimada do seu sistema
                </p>
            </div>
        )
    }

    const monthlyGeneration = totalKwp * 5.0 * 30
    const monthlySavings = monthlyGeneration * tariffKwh
    const yearlySavings = monthlySavings * 12

    return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-neutral-900 mb-3">💰 Economia Estimada</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div className="text-neutral-600 mb-0.5">Mensal</div>
                    <div className="font-bold text-green-600">R$ {monthlySavings.toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-neutral-600 mb-0.5">Anual</div>
                    <div className="font-bold text-green-600">R$ {yearlySavings.toFixed(2)}</div>
                </div>
            </div>
            <p className="text-xs text-neutral-600 mt-2">
                Baseado na tarifa de R$ {tariffKwh.toFixed(4)}/kWh
            </p>
        </div>
    )
}

// ============================================================================
// Quote Integration
// ============================================================================

export interface TariffQuoteData {
    tariff_classification: {
        grupo: string
        subgrupo: string
        tariff_total: number
    }
    consumption_profile: {
        monthly_kwh: number
        monthly_bill: number
    }
    source: 'tariff_classifier'
}

export function tariffToQuote(
    input: TariffInput,
    classification: TariffClassification,
    rates: TariffRates
): TariffQuoteData {
    return {
        tariff_classification: {
            grupo: classification.IdcClasse,
            subgrupo: classification.IdcSubgrupo,
            tariff_total: rates.total,
        },
        consumption_profile: {
            monthly_kwh: input.consumo_kwh_mes,
            monthly_bill: input.consumo_kwh_mes * rates.total,
        },
        source: 'tariff_classifier',
    }
}

// ============================================================================
// Compliance Integration (preparação para compliance module)
// ============================================================================

/**
 * Dados MMGD para módulo de compliance
 */
export interface MMGDComplianceData {
    IdcClasse: string
    IdcSubgrupo: string
    IdcModalidade: string
    MdaPotenciaInstalada: number
    is_eligible: boolean
    restrictions: string[]
}

export function mmgdToComplianceInput(mmgd: MMGDPacket): MMGDComplianceData {
    return {
        IdcClasse: mmgd.IdcClasse,
        IdcSubgrupo: mmgd.IdcSubgrupo,
        IdcModalidade: mmgd.IdcModalidade,
        MdaPotenciaInstalada: mmgd.MdaPotenciaInstalada,
        is_eligible: mmgd.eligibility.is_eligible,
        restrictions: mmgd.eligibility.restrictions || [],
    }
}

/**
 * Link para compliance após validação MMGD
 */
export function MMGDToComplianceButton({
    mmgd,
    countryCode = 'br',
}: {
    mmgd: MMGDPacket
    countryCode?: string
}) {
    if (!mmgd.eligibility.is_eligible) return null

    return (
        <Link
            href={`/${countryCode}/compliance?mmgd=true&class=${mmgd.IdcClasse}&subgroup=${mmgd.IdcSubgrupo}&modality=${mmgd.IdcModalidade}`}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Gerar Documentação de Compliance
        </Link>
    )
}

// ============================================================================
// URL Helpers
// ============================================================================

export function getTariffUrl(countryCode: string = 'br'): string {
    return `/${countryCode}/tarifas`
}

export function getTariffResultUrl(
    classificationId: string,
    countryCode: string = 'br'
): string {
    return `/${countryCode}/tarifas/${classificationId}`
}
