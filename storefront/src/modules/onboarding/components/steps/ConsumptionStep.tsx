'use client'

/**
 * ConsumptionStep Component
 * 
 * Coleta informações de consumo energético
 * Hélio em modo 'thinking' analisando os dados
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight, Upload } from 'lucide-react'
import HelioVideo from '../HelioVideo'
import type { OnboardingData } from '../../types'

interface ConsumptionStepProps {
    data: OnboardingData
    onComplete: (data: Partial<OnboardingData>) => void
    onSkip?: () => void
}

export default function ConsumptionStep({ data, onComplete, onSkip }: ConsumptionStepProps) {
    const [formData, setFormData] = useState({
        avgMonthlyConsumption: data.consumption?.avgMonthlyConsumption || '',
        avgMonthlyBill: data.consumption?.avgMonthlyBill || ''
    })

    const [inputMethod, setInputMethod] = useState<'manual' | 'bill'>('manual')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const monthlyConsumption = parseFloat(formData.avgMonthlyConsumption)
        const monthlyBill = parseFloat(formData.avgMonthlyBill)

        // Cálculo aproximado da tarifa (R$/kWh)
        const tariff = monthlyBill / monthlyConsumption

        onComplete({
            consumption: {
                avgMonthlyConsumption: monthlyConsumption,
                avgMonthlyBill: monthlyBill,
                annualConsumption: monthlyConsumption * 12,
                tariff
            }
        })
    }

    const isFormValid = formData.avgMonthlyConsumption && formData.avgMonthlyBill

    return (
        <div className="space-y-6">
            {/* Hélio em modo thinking */}
            <div className="flex justify-center mb-6">
                <HelioVideo
                    variant="compact"
                    autoPlay
                    loop
                />
            </div>

            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Zap className="w-5 h-5 inline-block mr-2 text-orange-500" />
                    Qual é o seu consumo de energia?
                </h3>
                <p className="text-sm text-gray-600">
                    Essas informações ajudam a dimensionar o sistema ideal para você
                </p>
            </div>

            {/* Method Selector */}
            <div className="flex gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => setInputMethod('manual')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${inputMethod === 'manual'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <div className="font-medium text-sm">Informar Manualmente</div>
                </button>

                <button
                    type="button"
                    onClick={() => setInputMethod('bill')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${inputMethod === 'bill'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <Upload className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <div className="font-medium text-sm">Upload de Conta</div>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {inputMethod === 'manual' ? (
                    <>
                        <div className="space-y-2">
                            <label htmlFor="consumption" className="text-sm font-medium text-gray-700">
                                Consumo Médio Mensal (kWh)
                            </label>
                            <input
                                id="consumption"
                                type="number"
                                step="0.01"
                                placeholder="350"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.avgMonthlyConsumption}
                                onChange={(e) => setFormData({ ...formData, avgMonthlyConsumption: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Você encontra essa informação na sua conta de luz
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="bill" className="text-sm font-medium text-gray-700">
                                Valor Médio da Conta (R$)
                            </label>
                            <input
                                id="bill"
                                type="number"
                                step="0.01"
                                placeholder="280.00"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.avgMonthlyBill}
                                onChange={(e) => setFormData({ ...formData, avgMonthlyBill: e.target.value })}
                                required
                            />
                        </div>
                    </>
                ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-300 transition-colors cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="font-medium text-gray-700 mb-1">
                            Arraste sua conta de luz aqui
                        </p>
                        <p className="text-sm text-gray-500">
                            ou clique para selecionar (PDF, JPG, PNG)
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                        >
                            Selecionar Arquivo
                        </Button>
                    </div>
                )}

                {/* Consumption Preview */}
                {formData.avgMonthlyConsumption && formData.avgMonthlyBill && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">📊 Resumo do Consumo</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Consumo Mensal</div>
                                <div className="font-bold text-orange-600">
                                    {formData.avgMonthlyConsumption} kWh
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600">Gasto Mensal</div>
                                <div className="font-bold text-orange-600">
                                    R$ {parseFloat(formData.avgMonthlyBill).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600">Consumo Anual</div>
                                <div className="font-bold text-orange-600">
                                    {(parseFloat(formData.avgMonthlyConsumption) * 12).toFixed(0)} kWh
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600">Gasto Anual</div>
                                <div className="font-bold text-orange-600">
                                    R$ {(parseFloat(formData.avgMonthlyBill) * 12).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    {onSkip && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onSkip}
                        >
                            Pular
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={!isFormValid}
                        className="min-w-[140px]"
                    >
                        Continuar
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </form>
        </div>
    )
}
