"use client"

import { useState, useRef } from "react"
import { MapPin, Photo, Buildings } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import { Text, toast } from "@medusajs/ui"
import { useSolarCVAPI, SolarCVValidators, SolarCVError } from "@/lib/api/solar-cv-client"

interface PhotogrammetryResult {
    roofModel: {
        area: number
        perimeter: number
        orientation: number
        tilt: number
        geometry: {
            type: 'Polygon'
            coordinates: number[][][]
        }
    }
    processingTime: number
    quality: 'good' | 'fair' | 'poor'
    recommendations: string[]
}

export default function Photogrammetry() {
    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<PhotogrammetryResult | null>(null)
    const [previews, setPreviews] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { processPhotogrammetry } = useSolarCVAPI()

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])
        if (selectedFiles.length === 0) return

        // Validate files
        const validation = SolarCVValidators.validatePhotogrammetryFiles(selectedFiles)
        if (!validation.valid) {
            toast.error(validation.errors[0])
            return
        }

        setFiles(selectedFiles)

        // Create previews
        const newPreviews: string[] = []
        selectedFiles.forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => {
                newPreviews.push(e.target?.result as string)
                if (newPreviews.length === selectedFiles.length) {
                    setPreviews(newPreviews)
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const handleProcess = async () => {
        if (files.length === 0) return

        setLoading(true)
        try {
            const data = await processPhotogrammetry(files)
            setResult(data)
            toast.success("Processamento fotogramétrico concluído!")
        } catch (error) {
            console.error('Photogrammetry error:', error)
            const message = error instanceof SolarCVError
                ? error.message
                : "Erro ao processar imagens. Tente novamente."
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFiles([])
        setResult(null)
        setPreviews([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'good': return 'text-green-600 bg-green-50 border-green-200'
            case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'poor': return 'text-red-600 bg-red-50 border-red-200'
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
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photogrammetry-upload"
                />

                {files.length === 0 ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Buildings className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <label htmlFor="photogrammetry-upload" className="cursor-pointer">
                                <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-2">
                                    Selecione imagens para fotogrametria
                                </Text>
                                <Text className="text-gray-600 dark:text-zinc-300">
                                    Arraste e solte ou clique para escolher múltiplas imagens (máx. 10)
                                </Text>
                            </label>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4"
                        >
                            Escolher Arquivos
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Image Previews */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-48 overflow-y-auto">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg shadow"
                                    />
                                    <div className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">{index + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                {files.length} arquivo(s) selecionado(s)
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                Tamanho total: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                            </Text>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={handleProcess}
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                            >
                                {loading ? "Processando..." : "Gerar Modelo 3D"}
                            </Button>
                            <Button variant="secondary" onClick={resetForm}>
                                Alterar Imagens
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {result && (
                <div className="space-y-6">
                    {/* Model Overview */}
                    <div className={`rounded-lg p-6 border ${getQualityColor(result.quality)}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                                    Modelo 3D do Telhado
                                </Text>
                                <Text className="text-sm text-gray-600 dark:text-zinc-300">
                                    Processamento concluído em {result.processingTime.toFixed(2)}s
                                </Text>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-3">
                                <Text className="text-lg font-bold text-purple-600 mb-1">
                                    {result.roofModel.area.toFixed(1)} m²
                                </Text>
                                <Text className="text-xs text-gray-600 dark:text-zinc-300">
                                    Área Total
                                </Text>
                            </div>
                            <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-3">
                                <Text className="text-lg font-bold text-blue-600 mb-1">
                                    {result.roofModel.perimeter.toFixed(1)} m
                                </Text>
                                <Text className="text-xs text-gray-600 dark:text-zinc-300">
                                    Perímetro
                                </Text>
                            </div>
                            <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-3">
                                <Text className="text-lg font-bold text-green-600 mb-1">
                                    {result.roofModel.orientation}°
                                </Text>
                                <Text className="text-xs text-gray-600 dark:text-zinc-300">
                                    Orientação
                                </Text>
                            </div>
                            <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-3">
                                <Text className="text-lg font-bold text-orange-600 mb-1">
                                    {result.roofModel.tilt}°
                                </Text>
                                <Text className="text-xs text-gray-600 dark:text-zinc-300">
                                    Inclinação
                                </Text>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getQualityColor(result.quality)}`}>
                                Qualidade: {result.quality.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Geometry Visualization Placeholder */}
                    <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-6">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-4">
                            Visualização da Geometria
                        </Text>
                        <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg h-64 flex items-center justify-center">
                            <div className="text-center">
                                <Buildings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <Text className="text-gray-500 dark:text-zinc-400">
                                    Visualização 3D seria renderizada aqui
                                </Text>
                                <Text className="text-sm text-gray-400 dark:text-zinc-500 mt-2">
                                    Coordenadas: {result.roofModel.geometry.coordinates[0].length} pontos
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-4">
                                Recomendações para Instalação
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
