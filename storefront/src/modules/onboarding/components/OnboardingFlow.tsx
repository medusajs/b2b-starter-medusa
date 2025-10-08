'use client'

/**
 * OnboardingFlow Component
 * 
 * Fluxo de onboarding com vídeos do Helio em destaque
 * Guia o usuário através do dimensionamento do sistema solar
 */

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import VideoStep from './steps/VideoStep'
import LocationStep from './steps/LocationStep'
import ConsumptionStep from './steps/ConsumptionStep'
import RoofStep from './steps/RoofStep'
import ResultsStep from './steps/ResultsStep'

export interface OnboardingData {
  // Location
  address?: string
  latitude?: number
  longitude?: number
  city?: string
  state?: string

  // Consumption
  avgMonthlyKwh?: number
  annualKwh?: number
  tariff?: number
  energyBill?: number

  // Roof
  roofType?: 'ceramic' | 'metallic' | 'fibrociment' | 'concrete' | 'other'
  roofArea?: number
  roofOrientation?: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
  roofInclination?: number
  hasShading?: boolean
  roofCondition?: 'excellent' | 'good' | 'fair' | 'poor'

  // Results (calculated)
  recommendedCapacity?: number
  estimatedGeneration?: number
  estimatedSavings?: number
  paybackYears?: number
  panelCount?: number
  inverterCount?: number
}

interface OnboardingFlowProps {
  onComplete?: (data: OnboardingData) => void
  onCancel?: () => void
}

const steps = [
  {
    id: 'welcome',
    title: 'Bem-vindo',
    description: 'Conheça o processo de dimensionamento',
    component: VideoStep
  },
  {
    id: 'location',
    title: 'Localização',
    description: 'Onde será instalado o sistema',
    component: LocationStep
  },
  {
    id: 'consumption',
    title: 'Consumo',
    description: 'Seu consumo de energia',
    component: ConsumptionStep
  },
  {
    id: 'roof',
    title: 'Telhado',
    description: 'Características do telhado',
    component: RoofStep
  },
  {
    id: 'results',
    title: 'Resultados',
    description: 'Seu sistema dimensionado',
    component: ResultsStep
  }
]

export default function OnboardingFlow({ onComplete, onCancel }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const progress = ((currentStep + 1) / steps.length) * 100
  const CurrentStepComponent = steps[currentStep].component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(new Set([...completedSteps, currentStep]))
      setCurrentStep(currentStep + 1)
    } else {
      setCompletedSteps(new Set([...completedSteps, currentStep]))
      onComplete?.(data)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    setData({ ...data, ...stepData })
    handleNext()
  }

  const handleSkip = () => {
    handleNext()
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header com Logo e Progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">☀️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dimensionamento Solar
                </h1>
                <p className="text-sm text-gray-600">
                  com Helio, seu assistente solar
                </p>
              </div>
            </div>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Sair
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="mb-6 hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(index)}
                disabled={index > currentStep && !completedSteps.has(index - 1)}
                className={`flex flex-col items-center gap-2 transition-opacity ${
                  index > currentStep && !completedSteps.has(index - 1)
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer hover:opacity-80'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    index === currentStep
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-110 shadow-lg'
                      : completedSteps.has(index)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {completedSteps.has(index) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    index === currentStep ? 'text-orange-500' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                    style={{
                      width: completedSteps.has(index) ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-2 border-orange-100">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>

            <CurrentStepComponent
              data={data}
              onComplete={handleStepComplete}
              onSkip={handleSkip}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="min-w-[120px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500"
              >
                Pular
              </Button>
            )}
            {/* Navigation handled by step components */}
          </div>
        </div>

        {/* Help Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>💡</span>
          <span>
            Precisa de ajuda? O Helio está aqui para te guiar em cada passo
          </span>
        </div>
      </div>
    </div>
  )
}
