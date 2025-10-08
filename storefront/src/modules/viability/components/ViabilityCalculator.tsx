/**
 * Viability Calculator Component
 * Formulário principal de entrada para dimensionamento
 */

'use client'

import React, { useState } from 'react'
import { useViability } from '../context/ViabilityContext'
import { ViabilityInput } from '../types'

export default function ViabilityCalculator() {
    const { setInput, calculate, isCalculating } = useViability()

    const [formData, setFormData] = useState<ViabilityInput>({
        consumo_kwh_mes: 0,
        fatura_media: 0,
        cep: '',
        tipo_telhado: 'laje',
        orientacao: 'auto',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setInput(formData)
        await calculate()
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-200">
            <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Calculadora de Viabilidade</h2>
                    <p className="text-sm text-neutral-600">Dimensione seu sistema fotovoltaico em minutos</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Consumo Mensal (kWh)
                        </label>
                        <input
                            type="number"
                            value={formData.consumo_kwh_mes}
                            onChange={(e) => setFormData({ ...formData, consumo_kwh_mes: Number(e.target.value) })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="450"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Fatura Média (R$)
                        </label>
                        <input
                            type="number"
                            value={formData.fatura_media}
                            onChange={(e) => setFormData({ ...formData, fatura_media: Number(e.target.value) })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="350.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            CEP
                        </label>
                        <input
                            type="text"
                            value={formData.cep}
                            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="01001-000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Tipo de Telhado
                        </label>
                        <select
                            value={formData.tipo_telhado}
                            onChange={(e) => setFormData({ ...formData, tipo_telhado: e.target.value as any })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="laje">Laje</option>
                            <option value="ceramica">Cerâmica</option>
                            <option value="metalico">Metálico</option>
                            <option value="solo">Solo</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isCalculating ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Calculando...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Calcular Viabilidade
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
