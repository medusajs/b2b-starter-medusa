"use client"

import { useState, useRef } from "react"
import { Bolt, Photo } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import { Text, toast } from "@medusajs/ui"
import { useSolarCVAPI, SolarCVValidators, SolarCVError } from "@/lib/api/solar-cv-client"

interface ThermalResult {
    anomalies: Array<{
        id: string
        type: 'hotspot' | 'cold_cell' | 'shading' | 'soiling' | 'cracking' | 'delamination'
        severity: 'low' | 'medium' | 'high' | 'critical'
        confidence: number
        location: [number, number]
        temperature: number
        description: string
    }>
    overallHealth: 'good' | 'fair' | 'poor' | 'critical'
    recommendations: string[]
    processingTime: number
    irradiance?: number
}

export default function ThermalAnalysis() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ThermalResult | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { analyzeThermal } = useSolarCVAPI()

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            if (!SolarCVValidators.isValidImage(selectedFile)) {
                toast.error("Por favor, selecione uma imagem térmica válida")
                return
            }
            if (!SolarCVValidators.isValidSize(selectedFile)) {
                toast.error("Arquivo muito grande (máx. 10MB)")
                return
            }
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onload = (e) => setPreview(e.target?.result as string)
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleAnalysis = async () => {
        if (!file) return

        setLoading(true)
        try {
            const data = await analyzeThermal(file)
            setResult(data)
            toast.success("Análise térmica concluída!")
        } catch (error) {
            console.error('Thermal analysis error:', error)
            const message = error instanceof SolarCVError
                ? error.message
                : "Erro ao analisar imagem térmica. Tente novamente."
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFile(null)
        setResult(null)
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
            case 'high': return 'text-red-600 bg-red-50 border-red-200'
            case 'critical': return 'text-red-800 bg-red-50 border-red-300'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'good': return 'text-green-600 bg-green-50 border-green-200'
            case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200'
            case 'critical': return 'text-red-600 bg-red-50 border-red-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    return (
        <div className="space-y-8">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8 text-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="thermal-upload"
                />

                {!file ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                            <Bolt className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <label htmlFor="thermal-upload" className="cursor-pointer">
                                <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-2">
                                    Selecione uma imagem térmica
                                </Text>
                                <Text className="text-gray-600 dark:text-zinc-300">
                                    Arraste e solte ou clique para escolher uma imagem térmica (FLIR, etc.)
                                </Text>
                            </label>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4"
                        >
                            Escolher Arquivo
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {preview && (
                            <div className="relative inline-block">
                                <img
                                    src={preview}
                                    alt="Thermal Preview"
                                    className="max-w-full max-h-64 rounded-lg shadow-lg"
                                />
                                <div className="absolute top-2 right-2">
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={resetForm}
                                        className="bg-white/90 hover:bg-white"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                Arquivo: {file.name}
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                            >
                                {loading ? "Analisando..." : "Analisar Térmica"}
                            </Button>
                            <Button variant="secondary" onClick={resetForm}>
                                Alterar Imagem
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {result && (
                <div className="space-y-6">
                    {/* Overall Health */}
                    <div className={`rounded-lg p-6 border ${getHealthColor(result.overallHealth)}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                                <Photo className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                                    Saúde Geral do Sistema
                                </Text>
                                <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                    Análise concluída em {result.processingTime.toFixed(2)}s
                                </Text>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getHealthColor(result.overallHealth)}`}>
                                {result.overallHealth.toUpperCase()}
                            </span>
                            <Text className="text-gray-600 dark:text-zinc-300">
                                {result.anomalies.length} anomalia(s) detectada(s)
                            </Text>
                        </div>
                    </div>

                    {/* Anomalies */}
                    {result.anomalies.length > 0 && (
                        <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-6">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-4">
                                Anomalias Detectadas
                            </Text>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {result.anomalies.map((anomaly) => (
                                    <div key={anomaly.id} className={`rounded-lg p-4 border ${getSeverityColor(anomaly.severity)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <Text className="font-medium text-gray-900 dark:text-zinc-50">
                                                {anomaly.type.replace('_', ' ').toUpperCase()}
                                            </Text>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                                                {anomaly.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <Text className="text-sm text-gray-600 dark:text-zinc-300 mb-2">
                                            {anomaly.description}
                                        </Text>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
                                            <span>Posição: [{anomaly.location.join(', ')}]</span>
                                            <span>Temperatura: {anomaly.temperature}°C</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-4">
                                Recomendações
                            </Text>
                            <ul className="space-y-2">
                                {result.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <Text className="text-gray-700 dark:text-zinc-300">{rec}</Text>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
