"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Check, Calculator, MapPin, CreditCard, Star, ArrowRight } from "lucide-react"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Button, Card } from "@/lib/design-system"
import { sendEvent } from "@/modules/common/analytics/events"

type PLGStep = 'discovery' | 'interest' | 'consideration' | 'decision'

interface PLGOnboardingProps {
    countryCode?: string
    initialStep?: PLGStep
}

const steps: Array<{
    id: PLGStep
    title: string
    description: string
    icon: React.ReactNode
    cta: string
    benefits: string[]
    conversionRate: string
}> = [
        {
            id: 'discovery',
            title: 'Descoberta',
            description: 'Primeiro contato com energia solar',
            icon: <Star className="w-6 h-6" />,
            cta: 'Saiba Mais',
            benefits: ['100% Gratuito', 'Sem compromisso', 'Resultado em 30s'],
            conversionRate: '85%'
        },
        {
            id: 'interest',
            title: 'Interesse',
            description: 'Avaliação inicial da viabilidade',
            icon: <Calculator className="w-6 h-6" />,
            cta: 'Calcular Sistema',
            benefits: ['Dimensionamento preciso', 'Dados NASA/PVGIS', 'Análise técnica'],
            conversionRate: '65%'
        },
        {
            id: 'consideration',
            title: 'Consideração',
            description: 'Análise detalhada e comparação',
            icon: <MapPin className="w-6 h-6" />,
            cta: 'Ver Proposta',
            benefits: ['ROI detalhado', 'Kits recomendados', ' payback calculado'],
            conversionRate: '45%'
        },
        {
            id: 'decision',
            title: 'Decisão',
            description: 'Pronto para implementação',
            icon: <CreditCard className="w-6 h-6" />,
            cta: 'Solicitar Orçamento',
            benefits: ['Instalação profissional', 'Garantia completa', 'Financiamento disponível'],
            conversionRate: '25%'
        }
    ]

export default function PLGOnboarding({ countryCode = 'br', initialStep = 'discovery' }: PLGOnboardingProps) {
    const [currentStep, setCurrentStep] = useState<PLGStep>(initialStep)
    const [completedSteps, setCompletedSteps] = useState<Set<PLGStep>>(new Set())
    const [isAnimating, setIsAnimating] = useState(false)

    const currentStepData = steps.find(step => step.id === currentStep)!

    useEffect(() => {
        // Track PLG progression
        sendEvent?.('plg_step_viewed', {
            step: currentStep,
            country_code: countryCode
        })
    }, [currentStep, countryCode])

    const handleStepAdvance = (nextStep: PLGStep) => {
        setIsAnimating(true)
        setCompletedSteps(prev => new Set([...prev, currentStep]))

        setTimeout(() => {
            setCurrentStep(nextStep)
            setIsAnimating(false)

            sendEvent?.('plg_step_completed', {
                from_step: currentStep,
                to_step: nextStep,
                country_code: countryCode
            })
        }, 300)
    }

    const getStepLink = (stepId: PLGStep) => {
        const links = {
            discovery: `/${countryCode}`,
            interest: `/${countryCode}/dimensionamento`,
            consideration: `/${countryCode}/viabilidade`,
            decision: `/${countryCode}/proposta`
        }
        return links[stepId]
    }

    const getStepAction = (stepId: PLGStep) => {
        const actions = {
            discovery: () => handleStepAdvance('interest'),
            interest: () => window.location.href = getStepLink('interest'),
            consideration: () => window.location.href = getStepLink('consideration'),
            decision: () => window.location.href = getStepLink('decision')
        }
        return actions[stepId]
    }

    return (
        <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="content-container">
                {/* Progress Indicator */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center space-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-100">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentStep === step.id
                                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                                            : completedSteps.has(step.id)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {completedSteps.has(step.id) ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.icon
                                    )}
                                </motion.button>
                                {index < steps.length - 1 && (
                                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Content Side */}
                            <div className="space-y-6">
                                <div>
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4"
                                    >
                                        <span>{currentStepData.title}</span>
                                        <span className="text-xs bg-white px-2 py-0.5 rounded-full">
                                            {currentStepData.conversionRate} conversão
                                        </span>
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-4xl font-bold text-gray-900 mb-4"
                                    >
                                        {currentStep === 'discovery' && 'Descubra o Poder da Energia Solar'}
                                        {currentStep === 'interest' && 'Calcule Seu Sistema Ideal'}
                                        {currentStep === 'consideration' && 'Análise Técnica Completa'}
                                        {currentStep === 'decision' && 'Pronto para Implementar?'}
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-xl text-gray-600 mb-6"
                                    >
                                        {currentStep === 'discovery' && 'Transforme sua conta de luz com soluções solares completas e dimensionamento personalizado.'}
                                        {currentStep === 'interest' && 'Use nossa calculadora avançada com dados NASA/PVGIS para dimensionar seu sistema fotovoltaico.'}
                                        {currentStep === 'consideration' && 'Receba análise técnica detalhada, ROI projetado e recomendações de kits certificados.'}
                                        {currentStep === 'decision' && 'Solicite orçamento completo com instalação profissional e opções de financiamento.'}
                                    </motion.p>
                                </div>

                                {/* Benefits */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                                >
                                    {currentStepData.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span>{benefit}</span>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* CTA Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col sm:flex-row gap-4"
                                >
                                    <Button
                                        size="lg"
                                        onClick={getStepAction(currentStep)}
                                        className="group"
                                    >
                                        {currentStepData.cta}
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    {currentStep !== 'decision' && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => handleStepAdvance(steps[steps.findIndex(s => s.id === currentStep) + 1]?.id || 'decision')}
                                        >
                                            Pular para próxima etapa
                                        </Button>
                                    )}
                                </motion.div>
                            </div>

                            {/* Visual Side */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="relative"
                            >
                                <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
                                    {/* Dynamic Content Based on Step */}
                                    {currentStep === 'discovery' && (
                                        <div className="text-center space-y-6">
                                            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                                                <Star className="w-12 h-12 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Primeiro Passo Gratuito</h3>
                                                <p className="text-gray-600">Descubra quanto você pode economizar com energia solar em apenas 30 segundos.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="bg-yellow-50 p-4 rounded-lg">
                                                    <div className="text-2xl font-bold text-yellow-600">95%</div>
                                                    <div className="text-sm text-gray-600">Redução na conta</div>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <div className="text-2xl font-bold text-green-600">4-7 anos</div>
                                                    <div className="text-sm text-gray-600">Payback médio</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 'interest' && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Calculator className="w-12 h-12 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Calculadora Avançada</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-bold text-sm">1</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">Dados Climáticos</div>
                                                        <div className="text-sm text-gray-600">NASA POWER + PVGIS</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                        <span className="text-green-600 font-bold text-sm">2</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">Simulação Técnica</div>
                                                        <div className="text-sm text-gray-600">PVWatts v8 + pvlib</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <span className="text-purple-600 font-bold text-sm">3</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">Resultado Instantâneo</div>
                                                        <div className="text-sm text-gray-600">kWp + economia mensal</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 'consideration' && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <MapPin className="w-12 h-12 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Análise Completa</h3>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm text-gray-600">Viabilidade Técnica</span>
                                                    <Check className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm text-gray-600">Análise Financeira</span>
                                                    <Check className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm text-gray-600">Recomendação de Kits</span>
                                                    <Check className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm text-gray-600">Curva de Geração</span>
                                                    <Check className="w-5 h-5 text-green-500" />
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-700">
                                                    <strong>Resultado:</strong> Proposta técnica completa com payback calculado e kits recomendados.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 'decision' && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CreditCard className="w-12 h-12 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Implementação Completa</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Check className="w-5 h-5 text-green-600" />
                                                        <span className="font-medium text-green-800">Instalação Profissional</span>
                                                    </div>
                                                    <p className="text-sm text-green-700">Equipe certificada INmetro com garantia de 10 anos.</p>
                                                </div>

                                                <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Check className="w-5 h-5 text-blue-600" />
                                                        <span className="font-medium text-blue-800">Financiamento Disponível</span>
                                                    </div>
                                                    <p className="text-sm text-blue-700">Até 60 meses com taxas especiais para energia solar.</p>
                                                </div>

                                                <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Check className="w-5 h-5 text-purple-600" />
                                                        <span className="font-medium text-purple-800">Monitoramento 24/7</span>
                                                    </div>
                                                    <p className="text-sm text-purple-700">App e dashboard para acompanhar geração em tempo real.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Trust Signals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Certificado ANEEL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>INMETRO Aprovado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>25+ Anos de Garantia</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Suporte Técnico 24/7</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}