/**
 * Tariff Display Component
 * Exibição da classificação e tarifas vigentes
 */

'use client'

import React from 'react'
import { useTariff } from '../context/TariffContext'

export default function TariffDisplay() {
    const { classification, rates } = useTariff()

    if (!classification || !rates) return null

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 4,
        }).format(value)
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Classificação Tarifária
            </h3>

            {/* Classificação */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Grupo</p>
                    <p className="text-3xl font-bold text-blue-900">{classification.IdcClasse}</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Subgrupo</p>
                    <p className="text-3xl font-bold text-purple-900">{classification.IdcSubgrupo}</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Tensão Ref.</p>
                    <p className="text-2xl font-bold text-green-900">{classification.tensao_referencia_kv} kV</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 mb-1">Bandeira</p>
                    <p className="text-lg font-bold text-amber-900 capitalize">{rates.bandeira}</p>
                </div>
            </div>

            {/* Descrição */}
            <div className="p-4 bg-neutral-50 rounded-lg mb-6">
                <p className="text-sm text-neutral-700">{classification.descricao}</p>
            </div>

            {/* Tarifas */}
            <div className="space-y-3">
                <h4 className="font-semibold text-neutral-900">Tarifas Vigentes</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 mb-1">TUSD</p>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(rates.tusd)}</p>
                        <p className="text-xs text-blue-700">{rates.unidade}</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 mb-1">TE</p>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(rates.te)}</p>
                        <p className="text-xs text-green-700">{rates.unidade}</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 mb-1">Total</p>
                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(rates.total)}</p>
                        <p className="text-xs text-purple-700">{rates.unidade}</p>
                    </div>
                </div>

                {rates.adicional_bandeira > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-900">
                            <span className="font-semibold">Adicional Bandeira:</span> {formatCurrency(rates.adicional_bandeira)}/kWh
                        </p>
                    </div>
                )}

                <div className="text-xs text-neutral-500">
                    Vigência: {new Date(rates.vigencia_inicio).toLocaleDateString('pt-BR')}
                    {rates.vigencia_fim && ` até ${new Date(rates.vigencia_fim).toLocaleDateString('pt-BR')}`}
                </div>
            </div>
        </div>
    )
}
