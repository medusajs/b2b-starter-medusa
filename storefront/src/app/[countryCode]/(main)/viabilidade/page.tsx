import { Metadata } from 'next'
import { ViabilityProvider } from '@/modules/education/viability/context/ViabilityContext'
import ViabilityCalculator from '@/modules/education/viability/components/ViabilityCalculator'
import RoofAnalysis from '@/modules/education/viability/components/RoofAnalysis'
import EnergyEstimator from '@/modules/education/viability/components/EnergyEstimator'
import SystemSizing from '@/modules/education/viability/components/SystemSizing'
import ViabilityReport from '@/modules/education/viability/components/ViabilityReport'

export const metadata: Metadata = {
    title: 'Análise de Viabilidade | Yello Solar Hub',
    description: 'Dimensione seu sistema fotovoltaico com análise técnica completa: geração de energia, economia estimada e configuração ideal do sistema.',
}

export default function ViabilidadePage() {
    return (
        <ViabilityProvider>
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
                <div className="content-container">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                            ⚡ Análise de Viabilidade Fotovoltaica
                        </h1>
                        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
                            Dimensione seu sistema solar com precisão técnica usando algoritmos avançados
                            de geração (pvlib, PVGIS, NASA POWER) e análise de telhado por visão computacional.
                        </p>
                    </div>

                    {/* Calculator */}
                    <div className="mb-8">
                        <ViabilityCalculator />
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <RoofAnalysis />
                        <EnergyEstimator />
                    </div>

                    {/* System Sizing */}
                    <div className="mb-8">
                        <SystemSizing />
                    </div>

                    {/* Report */}
                    <div>
                        <ViabilityReport />
                    </div>

                    {/* Info Cards */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white rounded-lg shadow-md border border-neutral-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900">Precisão Técnica</h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                                Algoritmos validados internacionalmente (NREL, PVGIS) com MAPE {'<'} 8% na geração de energia
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow-md border border-neutral-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900">Rápido {'&'} Fácil</h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                                Cálculo completo em menos de 40 segundos com dados mínimos de entrada
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow-md border border-neutral-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900">Relatório Completo</h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                                PDF técnico com layout, perdas, performance ratio e estimativas de geração
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ViabilityProvider>
    )
}
