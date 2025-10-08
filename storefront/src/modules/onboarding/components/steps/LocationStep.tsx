'use client'

/**
 * LocationStep Component
 * 
 * Coleta informações de localização do usuário
 * Hélio em modo 'thinking' enquanto o usuário preenche
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, ArrowRight } from 'lucide-react'
import HelioVideo from '../HelioVideo'
import type { OnboardingData } from '../../types'

interface LocationStepProps {
    data: OnboardingData
    onComplete: (data: Partial<OnboardingData>) => void
    onSkip?: () => void
}

const BRAZILIAN_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function LocationStep({ data, onComplete, onSkip }: LocationStepProps) {
    const [formData, setFormData] = useState({
        address: data.location?.address || '',
        city: data.location?.city || '',
        state: data.location?.state || '',
        zipCode: data.location?.zipCode || ''
    })

    const [isValidating, setIsValidating] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsValidating(true)

        // Simular validação do endereço (substituir por API real)
        await new Promise(resolve => setTimeout(resolve, 1000))

        onComplete({
            location: {
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                // Coordenadas viriam de geocoding API
                latitude: -23.550520,
                longitude: -46.633308
            }
        })
    }

    const isFormValid = formData.address && formData.city && formData.state && formData.zipCode

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
                    <MapPin className="w-5 h-5 inline-block mr-2 text-orange-500" />
                    Onde será instalado o sistema?
                </h3>
                <p className="text-sm text-gray-600">
                    A localização é importante para calcular a irradiação solar disponível
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                        id="address"
                        placeholder="Rua, Avenida, número..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                            id="city"
                            placeholder="São Paulo"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <select
                            id="state"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            required
                        >
                            <option value="">Selecione...</option>
                            {BRAZILIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                        id="zipCode"
                        placeholder="00000-000"
                        value={formData.zipCode}
                        onChange={(e) => {
                            // Auto-format CEP
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length > 5) {
                                value = value.slice(0, 5) + '-' + value.slice(5, 8)
                            }
                            setFormData({ ...formData, zipCode: value })
                        }}
                        maxLength={9}
                        required
                    />
                </div>

                {/* Mapa placeholder */}
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                        Mapa interativo será exibido aqui
                    </p>
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
                        disabled={!isFormValid || isValidating}
                        className="min-w-[140px]"
                    >
                        {isValidating ? (
                            'Validando...'
                        ) : (
                            <>
                                Continuar
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
