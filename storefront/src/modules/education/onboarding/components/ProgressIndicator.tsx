'use client'

/**
 * ProgressIndicator Component
 * 
 * Indicador visual de progresso do onboarding
 */

import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { OnboardingStep } from '../types'

interface ProgressIndicatorProps {
    steps: OnboardingStep[]
    currentStep: OnboardingStep
    completedSteps: OnboardingStep[]
}

const stepLabels: Record<OnboardingStep, string> = {
    welcome: 'Boas-vindas',
    location: 'Localização',
    consumption: 'Consumo',
    roof: 'Telhado',
    results: 'Resultados'
}

export default function ProgressIndicator({
    steps,
    currentStep,
    completedSteps
}: ProgressIndicatorProps) {
    const currentIndex = steps.indexOf(currentStep)
    const progress = ((currentIndex + 1) / steps.length) * 100

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="relative mb-8">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="absolute -top-1 transition-all duration-500" style={{ left: `${progress}%` }}>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg -ml-2 animate-pulse"></div>
                </div>
            </div>

            {/* Steps */}
            <div className="flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step)
                    const isCurrent = step === currentStep
                    const isPast = index < currentIndex

                    return (
                        <div
                            key={step}
                            className="flex flex-col items-center flex-1"
                        >
                            <div className="relative">
                                {isCompleted || isPast ? (
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                ) : isCurrent ? (
                                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                                        <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-gray-500 font-bold text-sm">{index + 1}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={`text-xs font-medium ${isCurrent ? 'text-yellow-600' :
                                        isCompleted || isPast ? 'text-green-600' :
                                            'text-gray-400'
                                    }`}>
                                    {stepLabels[step]}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
