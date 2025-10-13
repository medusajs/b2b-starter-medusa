"use client"

import { useState, useRef } from "react"
import { Camera, Photo, MapPin } from "@medusajs/icons"
import { Button, Text, toast } from "@medusajs/ui"
import { useSolarCVAPI, SolarCVValidators } from "@/lib/api/solar-cv-client"
import { useSolarCVOperation } from "@/lib/hooks/use-async-operation"

interface DetectionResult {
    panels: Array<{
        id: string
        bbox: [number, number, number, number]
        confidence: number
        area: number
    }>
    totalPanels: number
    totalArea: number
    processingTime: number
}

export default function PanelDetection() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<DetectionResult | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { detectPanels } = useSolarCVAPI()

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            if (!SolarCVValidators.isValidImage(selectedFile)) {
                toast.error("Por favor, selecione uma imagem válida")
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

    const handleDetection = async () => {
        if (!file) return

        setLoading(true)
        try {
            const data = await detectPanels(file)
            setResult(data)
            toast.success("Detecção concluída com sucesso!")
        } catch (error) {
            console.error('Detection error:', error)
            const message = error instanceof Error
                ? error.message
                : "Erro ao processar a imagem. Tente novamente."
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
                    id="image-upload"
                />

                {!file ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-2">
                                    Selecione uma imagem de satélite
                                </Text>
                                <Text className="text-gray-600 dark:text-zinc-300">
                                    Arraste e solte ou clique para escolher um arquivo
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
                                    alt="Preview"
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
                                onClick={handleDetection}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            >
                                {loading ? "Processando..." : "Detectar Painéis"}
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
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                            <Photo className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                                Resultados da Detecção
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                Processamento concluído em {result.processingTime.toFixed(2)}s
                            </Text>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-4">
                            <Text className="text-2xl font-bold text-blue-600 mb-1">
                                {result.totalPanels}
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                Painéis Detectados
                            </Text>
                        </div>
                        <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-4">
                            <Text className="text-2xl font-bold text-green-600 mb-1">
                                {result.totalArea.toFixed(1)} m²
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                Área Total Estimada
                            </Text>
                        </div>
                        <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-4">
                            <Text className="text-2xl font-bold text-purple-600 mb-1">
                                {(result.totalArea / result.totalPanels).toFixed(1)} m²
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                Área Média por Painel
                            </Text>
                        </div>
                    </div>

                    {result.panels.length > 0 && (
                        <div className="mt-6">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-4">
                                Detalhes dos Painéis
                            </Text>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {result.panels.slice(0, 10).map((panel, index) => (
                                    <div key={panel.id} className="bg-white/30 dark:bg-zinc-900/30 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <Text className="font-medium text-gray-900 dark:text-zinc-50">
                                                Painel {index + 1}
                                            </Text>
                                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                                {panel.confidence.toFixed(1)}% confiança
                                            </Text>
                                        </div>
                                        <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                            Área: {panel.area.toFixed(1)} m² | Posição: [{panel.bbox.map(coord => coord.toFixed(0)).join(', ')}]
                                        </Text>
                                    </div>
                                ))}
                                {result.panels.length > 10 && (
                                    <Text className="text-sm text-gray-500 dark:text-zinc-400 text-center">
                                        ... e mais {result.panels.length - 10} painéis
                                    </Text>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
