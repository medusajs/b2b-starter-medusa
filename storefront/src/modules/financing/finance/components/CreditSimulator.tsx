/**
 * CreditSimulator Component
 * 
 * Main financing calculator interface
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { FinanceInput, CAPEXBreakdown, OversizingScenario } from '../types'
import { toast } from '@medusajs/ui'

interface CreditSimulatorProps {
    /** Pre-filled data from Viability */
    initialData?: Partial<FinanceInput>
    /** Callback when calculation completes */
    onCalculated?: (calculationId: string) => void
    /** Show compact version */
    compact?: boolean
}

export default function CreditSimulator({
    initialData,
    onCalculated,
    compact = false,
}: CreditSimulatorProps) {
    const { calculateFinancing, state, validateInput } = useFinance()

    // Form state
    const [formData, setFormData] = useState<Partial<FinanceInput>>({
        system_kwp: initialData?.system_kwp || 0,
        annual_generation_kwh: initialData?.annual_generation_kwh || 0,
        monthly_savings_brl: initialData?.monthly_savings_brl || 0,
        current_monthly_bill_brl: initialData?.current_monthly_bill_brl || 0,
        oversizing_scenario: initialData?.oversizing_scenario || 130,
        capex: initialData?.capex || {
            kit: 0,
            labor: 0,
            technical_docs: 0,
            homologation: 0,
            shipping: 0,
            project_docs: 0,
            total: 0,
        },
    })

    // Update total CAPEX when breakdown changes
    useEffect(() => {
        if (formData.capex) {
            const total =
                (formData.capex.kit || 0) +
                (formData.capex.labor || 0) +
                (formData.capex.technical_docs || 0) +
                (formData.capex.homologation || 0) +
                (formData.capex.shipping || 0) +
                (formData.capex.project_docs || 0)

            setFormData(prev => ({
                ...prev,
                capex: { ...prev.capex!, total },
            }))
        }
    }, [
        formData.capex?.kit,
        formData.capex?.labor,
        formData.capex?.technical_docs,
        formData.capex?.homologation,
        formData.capex?.shipping,
        formData.capex?.project_docs,
    ])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate
        const validation = validateInput(formData)
        if (!validation.is_valid) {
            const errorMessage = validation.errors.map(e => e.message).join(', ')
            toast.error(`Erros de validação: ${errorMessage}`, {
                duration: 5000,
            })
            return
        }

        // Build complete input
        const input: FinanceInput = {
            id: `finance_${Date.now()}`,
            capex: formData.capex as CAPEXBreakdown,
            system_kwp: formData.system_kwp!,
            annual_generation_kwh: formData.annual_generation_kwh!,
            monthly_savings_brl: formData.monthly_savings_brl!,
            current_monthly_bill_brl: formData.current_monthly_bill_brl!,
            oversizing_scenario: formData.oversizing_scenario!,
            created_at: new Date().toISOString(),
        }

        try {
            const result = await calculateFinancing(input)
            if (onCalculated) {
                onCalculated(result.id)
            }
        } catch (error) {
            console.error('Calculation error:', error)
        }
    }

    const updateCapex = (field: keyof CAPEXBreakdown, value: number) => {
        setFormData(prev => ({
            ...prev,
            capex: { ...prev.capex!, [field]: value },
        }))
    }

    if (compact) {
        return (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Simular Financiamento</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Investimento Total (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.capex?.total || 0}
                            onChange={e => updateCapex('total', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Economia Mensal (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.monthly_savings_brl || 0}
                            onChange={e => setFormData(prev => ({ ...prev, monthly_savings_brl: parseFloat(e.target.value) }))}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={state.loading}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50"
                    >
                        {state.loading ? 'Calculando...' : 'Calcular ROI'}
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Simulador de Crédito Solar</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* System Info */}
                <section className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Dados do Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Potência do Sistema (kWp)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.system_kwp || 0}
                                onChange={e => setFormData(prev => ({ ...prev, system_kwp: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Geração Anual (kWh)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.annual_generation_kwh || 0}
                                onChange={e => setFormData(prev => ({ ...prev, annual_generation_kwh: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Cenário de Oversizing
                            </label>
                            <select
                                value={formData.oversizing_scenario || 130}
                                onChange={e => setFormData(prev => ({ ...prev, oversizing_scenario: parseInt(e.target.value) as OversizingScenario }))}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value={114}>114% (Mínimo)</option>
                                <option value={130}>130% (Recomendado)</option>
                                <option value={145}>145%</option>
                                <option value={160}>160% (Máximo)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* CAPEX Breakdown */}
                <section className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Investimento (CAPEX)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kit Solar (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.kit || 0}
                                onChange={e => updateCapex('kit', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Mão de Obra (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.labor || 0}
                                onChange={e => updateCapex('labor', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Documentação Técnica (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.technical_docs || 0}
                                onChange={e => updateCapex('technical_docs', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Homologação (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.homologation || 0}
                                onChange={e => updateCapex('homologation', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Frete (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.shipping || 0}
                                onChange={e => updateCapex('shipping', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Projeto (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.project_docs || 0}
                                onChange={e => updateCapex('project_docs', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <p className="text-lg font-semibold">
                            Total: R$ {(formData.capex?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </section>

                {/* Savings Info */}
                <section className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Economia Esperada</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Conta Atual (R$/mês)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.current_monthly_bill_brl || 0}
                                onChange={e => setFormData(prev => ({ ...prev, current_monthly_bill_brl: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Economia Mensal (R$/mês)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.monthly_savings_brl || 0}
                                onChange={e => setFormData(prev => ({ ...prev, monthly_savings_brl: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Error display */}
                {state.error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                        {state.error}
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={state.loading}
                    className="w-full bg-yellow-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {state.loading ? 'Calculando Financiamento...' : 'Calcular Financiamento'}
                </button>
            </form>
        </div>
    )
}
