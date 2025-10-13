'use client'

/**
 * Compliance Wizard
 * 
 * Wizard multi-step para validação de conformidade PRODIST
 * Coleta dados do sistema fotovoltaico e executa validações
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ysh/ui'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import type { ComplianceInput, ProdistValidation } from '../types'
import { validarCompleto } from '../validators/prodist-validator'
import distribuidoras from '../data/distribuidoras.json'

interface WizardStep {
    id: string
    title: string
    description: string
}

const steps: WizardStep[] = [
    {
        id: 'system',
        title: 'Dados do Sistema',
        description: 'Informações básicas sobre o sistema fotovoltaico'
    },
    {
        id: 'electrical',
        title: 'Dados Elétricos',
        description: 'Parâmetros elétricos de operação'
    },
    {
        id: 'protections',
        title: 'Proteções',
        description: 'Dispositivos de proteção instalados'
    },
    {
        id: 'grounding',
        title: 'Aterramento',
        description: 'Sistema de aterramento'
    },
    {
        id: 'validation',
        title: 'Validação',
        description: 'Resultado da análise de conformidade'
    }
]

interface ComplianceWizardProps {
    onComplete?: (validation: ProdistValidation) => void
    onCancel?: () => void
}

export default function ComplianceWizard({ onComplete, onCancel }: ComplianceWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isValidating, setIsValidating] = useState(false)
    const [validation, setValidation] = useState<ProdistValidation | null>(null)

    // Form data
    const [formData, setFormData] = useState<Partial<ComplianceInput>>({
        distribuidora: '',
        uf: 'SP',
        classe_tarifaria: 'B1',
        modalidade_mmgd: 'microgeracao_junto_a_carga',
        tipo_conexao: 'trifasico',
        dadosEletricos: {
            tensaoNominal: 220,
            tensaoOperacao: 220,
            frequenciaOperacao: 60,
            thdTensao: 5,
            fatorPotencia: 0.95,
            potenciaInstalada: 10,
            desequilibrioTensao: 1,
            desequilibrioCorrente: 5
        },
        protecoes: [],
        aterramento: {
            sistema: 'TN-S',
            resistencia: 8,
            tensaoNominal: 220
        }
    })

    const progress = ((currentStep + 1) / steps.length) * 100

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            if (currentStep === steps.length - 2) {
                // Execute validation before moving to last step
                runValidation()
            }
            setCurrentStep(currentStep + 1)
        } else if (validation) {
            onComplete?.(validation)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleCancel = () => {
        onCancel?.()
    }

    const runValidation = async () => {
        setIsValidating(true)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            const result = validarCompleto(formData as ComplianceInput)
            setValidation(result)
        } catch (error) {
            console.error('Validation error:', error)
        } finally {
            setIsValidating(false)
        }
    }

    const updateFormData = (updates: Partial<ComplianceInput>) => {
        setFormData(prev => ({ ...prev, ...updates }))
    }

    const renderStepContent = () => {
        const step = steps[currentStep]

        switch (step.id) {
            case 'system':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Potência Instalada (kWp)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.potencia_instalada_kwp || ''}
                                    onChange={(e) => updateFormData({ potencia_instalada_kwp: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="10.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tensão de Conexão (kV)
                                </label>
                                <select
                                    value={formData.tensao_conexao_kv || 0.22}
                                    onChange={(e) => updateFormData({ tensao_conexao_kv: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value={0.127}>127V (0.127 kV)</option>
                                    <option value={0.22}>220V (0.22 kV)</option>
                                    <option value={0.38}>380V (0.38 kV)</option>
                                    <option value={13.8}>13.8 kV</option>
                                    <option value={34.5}>34.5 kV</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Distribuidora
                            </label>
                            <select
                                value={formData.distribuidora || ''}
                                onChange={(e) => updateFormData({ distribuidora: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Selecione...</option>
                                {distribuidoras.distribuidoras.map((dist) => (
                                    <option key={dist.id} value={dist.id}>
                                        {dist.nome} - {dist.regiao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tipo de Conexão
                            </label>
                            <select
                                value={formData.tipo_conexao || 'trifasico'}
                                onChange={(e) => updateFormData({ tipo_conexao: e.target.value as any })}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="monofasico">Monofásico</option>
                                <option value="bifasico">Bifásico</option>
                                <option value="trifasico">Trifásico</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Consumo Anual (kWh)
                            </label>
                            <input
                                type="number"
                                value={formData.consumo_anual_kwh || ''}
                                onChange={(e) => updateFormData({ consumo_anual_kwh: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="12000"
                            />
                        </div>
                    </div>
                )

            case 'electrical':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tensão Nominal (V)
                                </label>
                                <input
                                    type="number"
                                    value={formData.dadosEletricos?.tensaoNominal || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            tensaoNominal: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tensão de Operação (V)
                                </label>
                                <input
                                    type="number"
                                    value={formData.dadosEletricos?.tensaoOperacao || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            tensaoOperacao: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Frequência (Hz)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dadosEletricos?.frequenciaOperacao || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            frequenciaOperacao: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Fator de Potência
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.dadosEletricos?.fatorPotencia || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            fatorPotencia: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    THD Tensão (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dadosEletricos?.thdTensao || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            thdTensao: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Potência Instalada (kW)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dadosEletricos?.potenciaInstalada || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            potenciaInstalada: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Desequilíbrio Tensão (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dadosEletricos?.desequilibrioTensao || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            desequilibrioTensao: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Desequilíbrio Corrente (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dadosEletricos?.desequilibrioCorrente || ''}
                                    onChange={(e) => updateFormData({
                                        dadosEletricos: {
                                            ...formData.dadosEletricos!,
                                            desequilibrioCorrente: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                )

            case 'protections':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Selecione as proteções instaladas no sistema
                        </p>

                        {['ANSI 27', 'ANSI 59', 'ANSI 81O', 'ANSI 81U', 'ANSI 25', 'ANSI 32', 'ANSI 67', 'ANSI 78'].map((codigo) => (
                            <label key={codigo} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.protecoes?.some(p => p.codigo === codigo)}
                                    onChange={(e) => {
                                        const protecoes = formData.protecoes || []
                                        if (e.target.checked) {
                                            updateFormData({
                                                protecoes: [...protecoes, {
                                                    codigo,
                                                    nome: codigo,
                                                    ajuste: '',
                                                    instalada: true
                                                }]
                                            })
                                        } else {
                                            updateFormData({
                                                protecoes: protecoes.filter(p => p.codigo !== codigo)
                                            })
                                        }
                                    }}
                                    className="rounded"
                                />
                                <span>{codigo}</span>
                            </label>
                        ))}
                    </div>
                )

            case 'grounding':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Sistema de Aterramento
                            </label>
                            <select
                                value={formData.aterramento?.sistema || 'TN-S'}
                                onChange={(e) => updateFormData({
                                    aterramento: {
                                        ...formData.aterramento!,
                                        sistema: e.target.value as any
                                    }
                                })}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="TN-S">TN-S (Recomendado)</option>
                                <option value="TN-C">TN-C</option>
                                <option value="TT">TT</option>
                                <option value="IT">IT</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Resistência de Aterramento (Ω)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.aterramento?.resistencia || ''}
                                onChange={(e) => updateFormData({
                                    aterramento: {
                                        ...formData.aterramento!,
                                        resistencia: parseFloat(e.target.value)
                                    }
                                })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="8.5"
                            />
                        </div>

                        <div className="p-4 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-900">
                                <strong>Nota:</strong> A resistência de aterramento deve ser ≤ 10Ω para BT/MT e ≤ 1Ω para AT.
                                O sistema TN-S é recomendado para geração distribuída.
                            </p>
                        </div>
                    </div>
                )

            case 'validation':
                if (isValidating) {
                    return (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                            <p className="text-sm text-muted-foreground">Validando conformidade...</p>
                        </div>
                    )
                }

                if (!validation) {
                    return <div>Erro ao validar dados</div>
                }

                return (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-md ${validation.conforme ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {validation.conforme ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                )}
                                <h3 className={`font-semibold ${validation.conforme ? 'text-green-900' : 'text-red-900'}`}>
                                    {validation.conforme ? 'Sistema Conforme' : 'Não Conformidades Detectadas'}
                                </h3>
                            </div>
                            <p className={`text-sm ${validation.conforme ? 'text-green-700' : 'text-red-700'}`}>
                                Score Geral: {validation.scoreGeral}/100
                            </p>
                        </div>

                        {validation.naoConformidades.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Não Conformidades:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                                    {validation.naoConformidades.map((nc, i) => (
                                        <li key={i}>{nc}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {validation.recomendacoes.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Recomendações:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
                                    {validation.recomendacoes.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {Object.entries(validation.validacoes).map(([key, val]: [string, any]) => (
                                <div key={key} className="p-3 border rounded-md">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium capitalize">{key}</span>
                                        {val.conforme ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Score: {val.score}/100</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Validação de Conformidade PRODIST</CardTitle>
                <CardDescription>
                    {steps[currentStep].description}
                </CardDescription>
                <Progress value={progress} className="mt-4" />
            </CardHeader>

            <CardContent>
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`flex-1 text-center ${index < currentStep ? 'text-primary' : index === currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                            >
                                <div className="text-xs">{step.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="min-h-[400px] mb-6">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between">
                    <div>
                        {currentStep > 0 && (
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button onClick={handleNext}>
                            {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                            {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
