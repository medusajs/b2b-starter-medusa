"use client"

import React, { useState } from "react"
import { Camera, Buildings, MapPin, Eye, ExclamationCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, Input, toast } from "@medusajs/ui"
import PanelDetection from "./components/panel-detection"
import ThermalAnalysis from "./components/thermal-analysis"
import Photogrammetry from "./components/photogrammetry"

const TOOLS = [
    {
        id: "panel-detection",
        title: "Detecção de Painéis Solares",
        description: "Identifique painéis solares em imagens de satélite usando IA avançada",
        icon: Camera,
        component: PanelDetection,
    },
    {
        id: "thermal-analysis",
        title: "Análise Térmica",
        description: "Detecte anomalias térmicas em sistemas fotovoltaicos",
        icon: Buildings,
        component: ThermalAnalysis,
    },
    {
        id: "photogrammetry",
        title: "Fotogrametria 3D",
        description: "Gere modelos 3D de telhados para dimensionamento preciso",
        icon: MapPin,
        component: Photogrammetry,
    },
]

export default function SolarCVTools() {
    const [activeTool, setActiveTool] = useState<string | null>(null)

    const ActiveComponent = activeTool ? TOOLS.find(t => t.id === activeTool)?.component : null

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-950 dark:to-zinc-900">
            <div className="content-container py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full border border-blue-200/50 mb-6">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <Text className="text-blue-700 text-sm uppercase tracking-wider font-semibold">
                            Ferramentas de Visão Computacional Solar
                        </Text>
                    </div>
                    <Heading level="h1" className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-zinc-50 mb-6">
                        Hélio, seu
                        <span className="block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            Copiloto Solar
                        </span>
                    </Heading>
                    <Text className="text-xl text-gray-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
                        Utilize inteligência artificial avançada para análise de painéis solares, detecção de anomalias térmicas e modelagem 3D de telhados.
                    </Text>
                </div>

                {/* Tool Selection */}
                {!activeTool && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {TOOLS.map((tool) => {
                            const Icon = tool.icon
                            return (
                                <div
                                    key={tool.id}
                                    className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                                    onClick={() => setActiveTool(tool.id)}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <Heading level="h3" className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mb-3">
                                        {tool.title}
                                    </Heading>

                                    <Text className="text-gray-600 dark:text-zinc-300 mb-6 leading-relaxed">
                                        {tool.description}
                                    </Text>

                                    <Button
                                        variant="secondary"
                                        className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                                    >
                                        Usar Ferramenta
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Active Tool */}
                {activeTool && ActiveComponent && (
                    <div className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-zinc-800 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                {TOOLS.find(t => t.id === activeTool) && (
                                    <>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            {React.createElement(TOOLS.find(t => t.id === activeTool)!.icon, { className: "w-6 h-6 text-white" })}
                                        </div>
                                        <div>
                                            <Heading level="h2" className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
                                                {TOOLS.find(t => t.id === activeTool)!.title}
                                            </Heading>
                                            <Text className="text-gray-600 dark:text-zinc-300">
                                                {TOOLS.find(t => t.id === activeTool)!.description}
                                            </Text>
                                        </div>
                                    </>
                                )}
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setActiveTool(null)}
                                className="hover:bg-gray-100 dark:hover:bg-zinc-800"
                            >
                                ← Voltar
                            </Button>
                        </div>

                        <ActiveComponent />
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full border border-yellow-200/50">
                        <ExclamationCircleSolid className="w-4 h-4 text-yellow-600" />
                        <Text className="text-yellow-700 text-sm">
                            Resultados são estimativas baseadas em IA. Consulte especialistas para validação final.
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    )
}
