/**
 * Roof Analysis Component
 * Análise de telhado com detecção de painéis existentes
 */

'use client'

import React from 'react'
import { useViability } from '../context/ViabilityContext'

export default function RoofAnalysis() {
    const { roofData } = useViability()

    if (!roofData) return null

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Análise do Telhado
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Área Disponível</p>
                    <p className="text-2xl font-bold text-blue-900">{roofData.area_disponivel_m2} m²</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Orientação</p>
                    <p className="text-lg font-semibold text-green-900">{roofData.orientacao_predominante}</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Inclinação</p>
                    <p className="text-2xl font-bold text-purple-900">{roofData.inclinacao_graus}°</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 mb-1">Obstruções</p>
                    <p className="text-2xl font-bold text-amber-900">{roofData.obstrucoes.length}</p>
                </div>
            </div>

            {roofData.paineis_existentes && roofData.paineis_existentes.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Painéis Existentes Detectados</h4>
                    {roofData.paineis_existentes.map((painel, idx) => (
                        <p key={idx} className="text-sm text-yellow-800">
                            {painel.quantidade}x {painel.potencia_wp}Wp instalados em {painel.ano_instalacao}
                        </p>
                    ))}
                </div>
            )}
        </div>
    )
}
