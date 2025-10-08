'use client'

/**
 * RoofStep Component
 * 
 * Coleta informações sobre o telhado
 * Hélio em modo 'thinking' avaliando as condições
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Home, ArrowRight, Camera } from 'lucide-react'
import HelioVideo from '../HelioVideo'
import type { OnboardingData } from '../../types'

interface RoofStepProps {
    data: OnboardingData
    onComplete: (data: Partial<OnboardingData>) => void
    onSkip?: () => void
}

const ROOF_TYPES = [
    { id: 'ceramic', label: 'Cerâmico', icon: '🏠' },
    { id: 'metallic', label: 'Metálico', icon: '🏭' },
    { id: 'concrete', label: 'Laje/Concreto', icon: '🏢' },
    { id: 'fibrociment', label: 'Fibrocimento', icon: '🏘️' }
]

const ORIENTATIONS = [
    { id: 'north', label: 'Norte', angle: '↑' },
    { id: 'northeast', label: 'Nordeste', angle: '↗' },
    { id: 'east', label: 'Leste', angle: '→' },
    { id: 'southeast', label: 'Sudeste', angle: '↘' },
    { id: 'south', label: 'Sul', angle: '↓' },
    { id: 'southwest', label: 'Sudoeste', angle: '↙' },
    { id: 'west', label: 'Oeste', angle: '←' },
    { id: 'northwest', label: 'Noroeste', angle: '↖' }
]

export default function RoofStep({ data, onComplete, onSkip }: RoofStepProps) {
    const [formData, setFormData] = useState({
        roofType: data.roof?.type || '',
        roofArea: data.roof?.availableArea?.toString() || '',
        roofOrientation: data.roof?.orientation || '',
        roofInclination: data.roof?.inclination?.toString() || '15',
        hasShading: data.roof?.hasShading || false
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        onComplete({
            roof: {
                type: formData.roofType as any,
                availableArea: parseFloat(formData.roofArea),
                orientation: formData.roofOrientation as any,
                inclination: parseFloat(formData.roofInclination),
                hasShading: formData.hasShading,
                condition: 'good' // Valor padrão
            }
        })
    }

    const isFormValid = formData.roofType && formData.roofArea && formData.roofOrientation

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
                    <Home className="w-5 h-5 inline-block mr-2 text-orange-500" />
                    Características do Telhado
                </h3>
                <p className="text-sm text-gray-600">
                    O tipo e a orientação do telhado influenciam a eficiência do sistema
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Roof Type Selector */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Tipo de Telhado *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {ROOF_TYPES.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, roofType: type.id })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.roofType === type.id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-2xl mb-2 block">{type.icon}</span>
                                <div className="font-medium text-sm">{type.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Roof Area */}
                <div className="space-y-2">
                    <label htmlFor="roofArea" className="text-sm font-medium text-gray-700">
                        Área Disponível (m²) *
                    </label>
                    <input
                        id="roofArea"
                        type="number"
                        step="0.1"
                        placeholder="50"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.roofArea}
                        onChange={(e) => setFormData({ ...formData, roofArea: e.target.value })}
                        required
                    />
                    <p className="text-xs text-gray-500">
                        Área estimada onde os painéis podem ser instalados
                    </p>
                </div>

                {/* Orientation Selector */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Orientação do Telhado *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {ORIENTATIONS.map((orientation) => (
                            <button
                                key={orientation.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, roofOrientation: orientation.id })}
                                className={`p-3 rounded-lg border-2 transition-all ${formData.roofOrientation === orientation.id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{orientation.angle}</div>
                                <div className="text-xs font-medium">{orientation.label}</div>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">
                        💡 Norte e Nordeste são as orientações ideais no Brasil
                    </p>
                </div>

                {/* Inclination Slider */}
                <div className="space-y-2">
                    <label htmlFor="inclination" className="text-sm font-medium text-gray-700">
                        Inclinação: {formData.roofInclination}°
                    </label>
                    <input
                        id="inclination"
                        type="range"
                        min="0"
                        max="45"
                        step="1"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        value={formData.roofInclination}
                        onChange={(e) => setFormData({ ...formData, roofInclination: e.target.value })}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>0° (Plano)</span>
                        <span>45° (Inclinado)</span>
                    </div>
                </div>

                {/* Shading Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                        id="shading"
                        type="checkbox"
                        className="mt-1"
                        checked={formData.hasShading}
                        onChange={(e) => setFormData({ ...formData, hasShading: e.target.checked })}
                    />
                    <label htmlFor="shading" className="text-sm">
                        <div className="font-medium text-gray-900 mb-1">
                            Há sombreamento no telhado?
                        </div>
                        <div className="text-gray-600">
                            Árvores, prédios ou outros obstáculos que fazem sombra durante o dia
                        </div>
                    </label>
                </div>

                {/* Photo Upload Placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                        Upload de fotos do telhado (opcional)
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                    >
                        Adicionar Fotos
                    </Button>
                </div>

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
