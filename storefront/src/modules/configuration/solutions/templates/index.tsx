"use client"

import { useState } from "react"
import { Heading, Text } from "@medusajs/ui"
import { Buildings, Bolt, Sun, Users } from "@medusajs/icons"

const CLASSES = [
    { id: "residencial-b1", label: "Residencial B1", icon: Sun },
    { id: "rural-b2", label: "Rural B2", icon: Bolt },
    { id: "comercial-b3", label: "Comercial/PME B3", icon: Buildings },
    { id: "condominios", label: "Condomínios", icon: Users },
    { id: "industria", label: "Indústria/Grandes", icon: Buildings },
]

const MODALIDADES = [
    { id: "on-grid", label: "On-Grid" },
    { id: "hibrido", label: "Híbrido" },
    { id: "off-grid", label: "Off-Grid" },
    { id: "geracao-compartilhada", label: "Geração Compartilhada" },
    { id: "eaas", label: "EaaS" },
    { id: "ppa", label: "PPA" },
]

interface SolucoesTemplateProps {
    countryCode: string
    filters: { classe?: string; modalidade?: string }
}

export default function SolucoesTemplate({ countryCode, filters }: SolucoesTemplateProps) {
    const [selectedClasse, setSelectedClasse] = useState(filters.classe || "")
    const [selectedModalidade, setSelectedModalidade] = useState(filters.modalidade || "")

    return (
        <div className="content-container py-12">
            <div className="mb-8">
                <Heading level="h1" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Soluções por Classe Consumidora
                </Heading>
                <Text className="text-lg text-gray-600">
                    Filtre por classe e modalidade energética para encontrar a solução ideal
                </Text>
            </div>

            {/* Filtros */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Filtro Classe */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Classe Consumidora
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {CLASSES.map((classe) => {
                                const Icon = classe.icon
                                return (
                                    <button
                                        key={classe.id}
                                        onClick={() => setSelectedClasse(classe.id === selectedClasse ? "" : classe.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${selectedClasse === classe.id
                                                ? "border-blue-600 bg-blue-50 text-blue-900"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{classe.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Filtro Modalidade */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Modalidade Energética
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {MODALIDADES.map((modalidade) => (
                                <button
                                    key={modalidade.id}
                                    onClick={() =>
                                        setSelectedModalidade(modalidade.id === selectedModalidade ? "" : modalidade.id)
                                    }
                                    className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${selectedModalidade === modalidade.id
                                            ? "border-blue-600 bg-blue-50 text-blue-900"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <span className="text-sm font-medium">{modalidade.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filtros Ativos */}
                {(selectedClasse || selectedModalidade) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Text className="text-sm font-semibold text-gray-700">Filtros ativos:</Text>
                            {selectedClasse && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm flex items-center gap-2">
                                    {CLASSES.find((c) => c.id === selectedClasse)?.label}
                                    <button
                                        onClick={() => setSelectedClasse("")}
                                        className="hover:text-blue-600"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                            {selectedModalidade && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm flex items-center gap-2">
                                    {MODALIDADES.find((m) => m.id === selectedModalidade)?.label}
                                    <button
                                        onClick={() => setSelectedModalidade("")}
                                        className="hover:text-blue-600"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedClasse("")
                                    setSelectedModalidade("")
                                }}
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                Limpar todos
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Resultados */}
            <div>
                <Heading level="h2" className="text-2xl font-bold text-gray-900 mb-6">
                    Kits e Produtos Recomendados
                </Heading>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Text className="text-gray-600">
                        {selectedClasse || selectedModalidade
                            ? `Mostrando resultados para ${selectedClasse ? CLASSES.find((c) => c.id === selectedClasse)?.label : ""} ${selectedModalidade ? MODALIDADES.find((m) => m.id === selectedModalidade)?.label : ""}`
                            : "Selecione filtros para ver produtos recomendados"}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-2">
                        (Integração com catálogo Medusa será implementada)
                    </Text>
                </div>
            </div>
        </div>
    )
}
