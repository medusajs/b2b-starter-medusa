/**
 * Financing Form Component
 *
 * Form for credit simulation input
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@medusajs/ui'
import { Calculator, TrendingUp } from 'lucide-react'
import type { FinanceInput, CAPEXBreakdown, OversizingScenario } from '@/modules/finance/types'

interface FinancingFormProps {
    initialData?: FinanceInput | null
    onCalculate: (input: FinanceInput) => Promise<void>
    isLoading: boolean
}

export function FinancingForm({ initialData, onCalculate, isLoading }: FinancingFormProps) {
    const [formData, setFormData] = useState<Partial<FinanceInput>>({
        system_kwp: 0,
        annual_generation_kwh: 0,
        monthly_savings_brl: 0,
        current_monthly_bill_brl: 0,
        oversizing_scenario: 130,
        capex: {
            kit: 0,
            labor: 0,
            technical_docs: 0,
            homologation: 0,
            shipping: 0,
            project_docs: 0,
            total: 0,
        },
    })

    // Load initial data
    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

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
    }, [formData.capex])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        if (!formData.capex?.total || formData.capex.total <= 0) {
            alert('Por favor, informe o investimento total.')
            return
        }

        if (!formData.monthly_savings_brl || formData.monthly_savings_brl <= 0) {
            alert('Por favor, informe a economia mensal.')
            return
        }

        // Build complete input
        const input: FinanceInput = {
            id: `finance_${Date.now()}`,
            capex: formData.capex as CAPEXBreakdown,
            system_kwp: formData.system_kwp || 0,
            annual_generation_kwh: formData.annual_generation_kwh || 0,
            monthly_savings_brl: formData.monthly_savings_brl,
            current_monthly_bill_brl: formData.current_monthly_bill_brl || 0,
            oversizing_scenario: formData.oversizing_scenario || 130,
            created_at: new Date().toISOString(),
        }

        await onCalculate(input)
    }

    const updateCapex = (field: keyof CAPEXBreakdown, value: number) => {
        setFormData(prev => ({
            ...prev,
            capex: { ...prev.capex!, [field]: value },
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Calculator className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Dados do Financiamento
                    </h3>
                    <p className="text-sm text-gray-600">
                        Preencha os dados para simular as condições de crédito
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Investment Amount */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Investimento</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kit Solar (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.kit || 0}
                                onChange={e => updateCapex('kit', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mão de Obra (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.labor || 0}
                                onChange={e => updateCapex('labor', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Documentação Técnica (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.technical_docs || 0}
                                onChange={e => updateCapex('technical_docs', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Homologação (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.homologation || 0}
                                onChange={e => updateCapex('homologation', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Frete (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.shipping || 0}
                                onChange={e => updateCapex('shipping', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Projeto (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.capex?.project_docs || 0}
                                onChange={e => updateCapex('project_docs', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    {/* Total Display */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-900">
                                Investimento Total:
                            </span>
                            <span className="text-lg font-bold text-blue-700">
                                R$ {(formData.capex?.total || 0).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Savings Information */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Economia Esperada</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Conta Atual (R$/mês)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.current_monthly_bill_brl || 0}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    current_monthly_bill_brl: parseFloat(e.target.value) || 0
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Economia Mensal (R$/mês) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.monthly_savings_brl || 0}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    monthly_savings_brl: parseFloat(e.target.value) || 0
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* System Information */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Dados do Sistema</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Potência (kWp)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.system_kwp || 0}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    system_kwp: parseFloat(e.target.value) || 0
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Geração Anual (kWh)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.annual_generation_kwh || 0}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    annual_generation_kwh: parseFloat(e.target.value) || 0
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Oversizing
                            </label>
                            <select
                                value={formData.oversizing_scenario || 130}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    oversizing_scenario: parseInt(e.target.value) as OversizingScenario
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Cenário de Oversizing"
                            >
                                <option value={114}>114% (Mínimo)</option>
                                <option value={130}>130% (Recomendado)</option>
                                <option value={145}>145%</option>
                                <option value={160}>160% (Máximo)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Calculando...</span>
                            </>
                        ) : (
                            <>
                                <TrendingUp className="h-4 w-4" />
                                <span>Calcular Financiamento</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}