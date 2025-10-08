/**
 * Tariff Classifier Component
 * Classificação automática de grupo e subgrupo tarifário
 */

'use client'

import React, { useState } from 'react'
import { useTariff } from '../context/TariffContext'
import { TariffInput } from '../types'

export default function TariffClassifier() {
    const { setInput, classify, isClassifying } = useTariff()

    const [formData, setFormData] = useState<TariffInput>({
        tensao_fornecimento_kv: 0.22,
        tipo_conexao: 'bifasico',
        distribuidora: '',
        cep: '',
        consumo_kwh_mes: 0,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setInput(formData)
        await classify()
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Classificação Tarifária ANEEL</h2>
                    <p className="text-sm text-neutral-600">Identifique seu grupo e subgrupo tarifário</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="distribuidora" className="block text-sm font-medium text-neutral-700 mb-1">
                            Distribuidora
                        </label>
                        <select
                            id="distribuidora"
                            value={formData.distribuidora}
                            onChange={(e) => setFormData({ ...formData, distribuidora: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Selecione...</option>
                            <option value="CPFL">CPFL Paulista</option>
                            <option value="ENEL_SP">Enel São Paulo</option>
                            <option value="ENEL_RJ">Enel Rio de Janeiro</option>
                            <option value="CEMIG">Cemig</option>
                            <option value="LIGHT">Light</option>
                            <option value="COPEL">Copel</option>
                            <option value="CELESC">Celesc</option>
                            <option value="COELBA">Coelba</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="cep" className="block text-sm font-medium text-neutral-700 mb-1">
                            CEP
                        </label>
                        <input
                            id="cep"
                            type="text"
                            value={formData.cep}
                            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="01001-000"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="consumo" className="block text-sm font-medium text-neutral-700 mb-1">
                            Consumo Mensal (kWh)
                        </label>
                        <input
                            id="consumo"
                            type="number"
                            value={formData.consumo_kwh_mes}
                            onChange={(e) => setFormData({ ...formData, consumo_kwh_mes: Number(e.target.value) })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="450"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="tensao" className="block text-sm font-medium text-neutral-700 mb-1">
                            Tensão de Fornecimento (kV)
                        </label>
                        <select
                            id="tensao"
                            value={formData.tensao_fornecimento_kv}
                            onChange={(e) => setFormData({ ...formData, tensao_fornecimento_kv: Number(e.target.value) })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={0.22}>220V (Baixa Tensão)</option>
                            <option value={0.38}>380V (Baixa Tensão)</option>
                            <option value={13.8}>13,8 kV (Média Tensão)</option>
                            <option value={34.5}>34,5 kV (Média Tensão)</option>
                            <option value={69}>69 kV (Alta Tensão)</option>
                            <option value={138}>138 kV (Alta Tensão)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tipo-conexao" className="block text-sm font-medium text-neutral-700 mb-1">
                            Tipo de Conexão
                        </label>
                        <select
                            id="tipo-conexao"
                            value={formData.tipo_conexao}
                            onChange={(e) => setFormData({ ...formData, tipo_conexao: e.target.value as any })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="monofasico">Monofásico</option>
                            <option value="bifasico">Bifásico</option>
                            <option value="trifasico">Trifásico</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="demanda" className="block text-sm font-medium text-neutral-700 mb-1">
                            Demanda Contratada (kW) - Opcional
                        </label>
                        <input
                            id="demanda"
                            type="number"
                            value={formData.demanda_contratada_kw || ''}
                            onChange={(e) => setFormData({ ...formData, demanda_contratada_kw: Number(e.target.value) || undefined })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Somente Grupo A"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isClassifying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isClassifying ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Classificando...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Classificar Tarifa
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
