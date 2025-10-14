"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Calculator, Zap, TrendingUp, Download, Share2, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Container, Heading, Text } from "@medusajs/ui"
import { Button, Card, Input } from "@/lib/design-system"
import { sendEvent } from "@/modules/common/analytics/events"
import dynamic from "next/dynamic"
import Link from "next/link"

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false })

type DimensionamentoStep = 'location' | 'consumption' | 'simulation' | 'results'

interface PVSimulationResult {
    kWp: number
    kWh_year: number
    kWh_month: number[]
    economy_month_brl?: number
    area_m2: number
    sources?: any
    alerts?: string[]
    payback_years?: number
    roi_percentage?: number
    co2_saved_kg?: number
}

interface AgentResponse {
    success: boolean
    data?: PVSimulationResult
    error?: string
    suggestions?: string[]
}

export default function InteractiveDimensionamentoClient() {
    const [currentStep, setCurrentStep] = useState<DimensionamentoStep>('location')
    const [cep, setCep] = useState<string>("")
    const [lat, setLat] = useState<string>("")
    const [lon, setLon] = useState<string>("")
    const [monthlyConsumption, setMonthlyConsumption] = useState<string>("")
    const [roofType, setRoofType] = useState<string>("ceramic")
    const [tilt, setTilt] = useState<string>("")
    const [azimuth, setAzimuth] = useState<string>("0")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<PVSimulationResult | null>(null)
    const [agentSuggestions, setAgentSuggestions] = useState<string[]>([])

    const steps = [
        { id: 'location', title: 'Localização', icon: MapPin, description: 'Defina sua localização' },
        { id: 'consumption', title: 'Consumo', icon: Zap, description: 'Informe seu consumo' },
        { id: 'simulation', title: 'Simulação', icon: Calculator, description: 'Calcule seu sistema' },
        { id: 'results', title: 'Resultados', icon: TrendingUp, description: 'Veja os resultados' }
    ] as const

    const currentStepIndex = steps.findIndex(step => step.id === currentStep)
    const currentStepData = steps[currentStepIndex]

    useEffect(() => {
        sendEvent?.('dimensionamento_step_viewed', {
            step: currentStep,
            has_location: !!(lat && lon),
            has_consumption: !!monthlyConsumption
        })
    }, [currentStep, lat, lon, monthlyConsumption])

    const geocode = useCallback(async () => {
        setError(null)
        try {
            if (!cep) {
                setError("CEP é obrigatório")
                return
            }

            const r = await fetch("/api/onboarding/geocode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cep }),
            })

            const j = await r.json()
            if (!r.ok) throw new Error(j?.error || "Falha ao geocodificar")

            setLat(String(j.lat))
            setLon(String(j.lon))

            sendEvent?.('location_geocoded', {
                cep: cep.substring(0, 5),
                success: true
            })
        } catch (e: any) {
            setError(e?.message || "Erro ao buscar localização")
            sendEvent?.('location_geocoded', {
                cep: cep.substring(0, 5),
                success: false,
                error: e.message
            })
        }
    }, [cep])

    const simulateWithAgent = useCallback(async () => {
        setLoading(true)
        setError(null)
        setResult(null)
        setAgentSuggestions([])

        try {
            const body = {
                lat: Number(lat),
                lon: Number(lon),
                monthly_kwh: monthlyConsumption ? Number(monthlyConsumption) : undefined,
                roof_type: roofType,
                tilt_deg: tilt ? Number(tilt) : undefined,
                azimuth_deg: azimuth ? Number(azimuth) : 0,
            }

            if (!isFinite(body.lat) || !isFinite(body.lon)) {
                setError("Localização inválida")
                setLoading(false)
                return
            }

            // Call agent API
            const agentResponse = await fetch("/api/store/helio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    intent: "viability_pv",
                    data: body
                }),
            })

            const agentResult: AgentResponse = await agentResponse.json()

            if (!agentResponse.ok || !agentResult.success) {
                throw new Error(agentResult.error || "Falha na simulação com IA")
            }

            if (agentResult.data) {
                setResult(agentResult.data)
                setAgentSuggestions(agentResult.suggestions || [])

                sendEvent?.('viability_calculated', {
                    proposal_kwp: agentResult.data.kWp,
                    expected_gen_mwh_y: Math.round((agentResult.data.kWh_year || 0) / 1000 * 10) / 10,
                    monthly_savings_brl: agentResult.data.economy_month_brl,
                    payback_years: agentResult.data.payback_years,
                    agent_used: true
                })
            }
        } catch (e: any) {
            setError(e?.message || "Erro na simulação")
            sendEvent?.('viability_calculation_failed', {
                error: e.message,
                agent_used: true
            })
        } finally {
            setLoading(false)
        }
    }, [lat, lon, monthlyConsumption, roofType, tilt, azimuth])

    const nextStep = () => {
        const nextIndex = currentStepIndex + 1
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].id)
        }
    }

    const prevStep = () => {
        const prevIndex = currentStepIndex - 1
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].id)
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 'location':
                return lat && lon
            case 'consumption':
                return monthlyConsumption
            case 'simulation':
                return !loading
            case 'results':
                return result !== null
            default:
                return false
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 'location':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <Heading level="h2" className="text-2xl font-bold mb-2">Onde está localizada sua instalação?</Heading>
                            <Text className="text-gray-600">Precisamos da localização exata para calcular a irradiação solar</Text>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CEP
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="01311-000"
                                                value={cep}
                                                onChange={(e) => setCep(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button onClick={geocode} variant="outline">
                                                Buscar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Latitude
                                            </label>
                                            <Input
                                                placeholder="-23.55"
                                                value={lat}
                                                onChange={(e) => setLat(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Longitude
                                            </label>
                                            <Input
                                                placeholder="-46.63"
                                                value={lon}
                                                onChange={(e) => setLon(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="h-full">
                                    <MapPicker
                                        lat={Number(lat) || -23.55}
                                        lon={Number(lon) || -46.63}
                                        onChange={(p) => {
                                            setLat(String(p.lat))
                                            setLon(String(p.lon))
                                        }}
                                    />
                                </div>
                            </Card>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                            >
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </motion.div>
                        )}
                    </motion.div>
                )

            case 'consumption':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <Heading level="h2" className="text-2xl font-bold mb-2">Qual seu consumo mensal de energia?</Heading>
                            <Text className="text-gray-600">Isso nos ajuda a dimensionar o sistema ideal para suas necessidades</Text>
                        </div>

                        <div className="max-w-md mx-auto space-y-6">
                            <Card className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Consumo mensal (kWh)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="350"
                                            value={monthlyConsumption}
                                            onChange={(e) => setMonthlyConsumption(e.target.value)}
                                            className="text-lg"
                                        />
                                        <Text className="text-xs text-gray-500 mt-1">
                                            Valor médio encontrado na conta de luz
                                        </Text>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de telhado
                                        </label>
                                        <select
                                            value={roofType}
                                            onChange={(e) => setRoofType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            aria-label="Tipo de telhado"
                                        >
                                            <option value="ceramic">Telhado cerâmico</option>
                                            <option value="concrete">Laje</option>
                                            <option value="metal">Estrutura metálica</option>
                                            <option value="ground">Solo</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-blue-900 mb-1">Dica Importante</div>
                                        <div className="text-sm text-blue-700">
                                            O consumo pode variar por estação. Recomendamos usar a média dos últimos 12 meses.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )

            case 'simulation':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <Calculator className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <Heading level="h2" className="text-2xl font-bold mb-2">Configurações da Simulação</Heading>
                            <Text className="text-gray-600">Ajuste os parâmetros para uma simulação mais precisa</Text>
                        </div>

                        <Card className="p-6 max-w-2xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Inclinação do telhado (°)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder={`Sugerido: ${Math.max(0, Math.min(90, Math.abs(Number(lat) || 0))).toFixed(0)}`}
                                        value={tilt}
                                        onChange={(e) => setTilt(e.target.value)}
                                    />
                                    <Text className="text-xs text-gray-500 mt-1">
                                        0° = plano, 90° = vertical
                                    </Text>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Azimute (°)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0 = Norte"
                                        value={azimuth}
                                        onChange={(e) => setAzimuth(e.target.value)}
                                    />
                                    <Text className="text-xs text-gray-500 mt-1">
                                        0° = Norte, 90° = Leste, -90° = Oeste
                                    </Text>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">AI</span>
                                    </div>
                                    <div className="font-medium text-gray-900">Simulação com Inteligência Artificial</div>
                                </div>
                                <div className="text-sm text-gray-700">
                                    Nossa IA analisa dados climáticos do NASA POWER, calcula viabilidade técnica e otimiza o dimensionamento para máxima economia.
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )

            case 'results':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <Heading level="h2" className="text-2xl font-bold mb-2">Resultados da Simulação</Heading>
                            <Text className="text-gray-600">Sistema dimensionado com IA para máxima performance</Text>
                        </div>

                        {result && (
                            <div className="space-y-6">
                                {/* Main Results */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">{result.kWp.toFixed(1)} kWp</div>
                                        <div className="text-sm text-gray-600">Potência do Sistema</div>
                                    </Card>

                                    <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100">
                                        <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(result.kWh_year / 1000 * 10) / 10} MWh</div>
                                        <div className="text-sm text-gray-600">Geração Anual</div>
                                    </Card>

                                    <Card className="p-6 text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
                                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                                            {result.economy_month_brl ? `R$ ${result.economy_month_brl.toFixed(0)}` : 'R$ 0'}
                                        </div>
                                        <div className="text-sm text-gray-600">Economia Mensal</div>
                                    </Card>

                                    <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round(result.area_m2)} m²</div>
                                        <div className="text-sm text-gray-600">Área Necessária</div>
                                    </Card>
                                </div>

                                {/* Additional Metrics */}
                                {(result.payback_years || result.roi_percentage) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.payback_years && (
                                            <Card className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-indigo-600">{result.payback_years.toFixed(1)} anos</div>
                                                        <div className="text-sm text-gray-600">Payback do Investimento</div>
                                                    </div>
                                                    <TrendingUp className="w-8 h-8 text-indigo-500" />
                                                </div>
                                            </Card>
                                        )}

                                        {result.roi_percentage && (
                                            <Card className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-emerald-600">{result.roi_percentage.toFixed(1)}%</div>
                                                        <div className="text-sm text-gray-600">ROI Projetado</div>
                                                    </div>
                                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                                </div>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {/* Agent Suggestions */}
                                {agentSuggestions.length > 0 && (
                                    <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm font-bold">AI</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 mb-2">Sugestões da IA</div>
                                                <ul className="space-y-1">
                                                    {agentSuggestions.map((suggestion, index) => (
                                                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                                            <span className="text-indigo-500 mt-1">•</span>
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => {
                                            const payload = {
                                                summary: {
                                                    kwp: result.kWp,
                                                    kwh_year: result.kWh_year,
                                                    economy_month_brl: result.economy_month_brl,
                                                    area_m2: result.area_m2,
                                                    tilt_deg: tilt ? Number(tilt) : Math.max(0, Math.min(90, Math.abs(Number(lat) || 0))),
                                                    azimuth_deg: azimuth ? Number(azimuth) : 0,
                                                },
                                                sources: result.sources,
                                                ts: new Date().toISOString(),
                                            }
                                            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = 'proposta-yello-draft.json'
                                            a.click()
                                            URL.revokeObjectURL(url)
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Baixar Proposta Técnica
                                    </Button>

                                    <Link href="/proposta">
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Share2 className="w-4 h-4" />
                                            Ver Proposta Completa
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )

            default:
                return null
        }
    }

    return (
        <div className="content-container py-8">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex items-center justify-center mb-6">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon
                        const isCompleted = index < currentStepIndex
                        const isCurrent = index === currentStepIndex

                        return (
                            <div key={step.id} className="flex items-center">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'bg-gray-100 border-gray-300 text-gray-500'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <StepIcon className="w-6 h-6" />
                                    )}
                                </motion.div>

                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-1 mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="text-center">
                    <Heading level="h1" className="text-3xl font-bold mb-2">
                        {currentStepData.title}
                    </Heading>
                    <Text className="text-gray-600">{currentStepData.description}</Text>
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderStepContent()}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                >
                    Anterior
                </Button>

                <div className="text-sm text-gray-500">
                    Passo {currentStepIndex + 1} de {steps.length}
                </div>

                {currentStep === 'simulation' ? (
                    <Button
                        onClick={simulateWithAgent}
                        disabled={!canProceed() || loading}
                        className="min-w-[140px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Calculando...
                            </>
                        ) : (
                            'Calcular Sistema'
                        )}
                    </Button>
                ) : currentStep === 'results' ? (
                    <Link href="/proposta">
                        <Button>Ver Proposta Completa</Button>
                    </Link>
                ) : (
                    <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                    >
                        Próximo
                    </Button>
                )}
            </div>

            {error && currentStep !== 'location' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"
                >
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    {error}
                </motion.div>
            )}
        </div>
    )
}