import { Metadata } from 'next'
import { TariffProvider } from '@/modules/operations/tariffs/context/TariffContext'
import TariffClassifier from '@/modules/operations/tariffs/components/TariffClassifier'
import TariffDisplay from '@/modules/operations/tariffs/components/TariffDisplay'
import MMGDValidator from '@/modules/operations/tariffs/components/MMGDValidator'
import DistributorSelector from '@/modules/operations/tariffs/components/DistributorSelector'

export const metadata: Metadata = {
    title: 'Classificação Tarifária ANEEL | Yello Solar Hub',
    description: 'Identifique seu grupo e subgrupo tarifário ANEEL, valide elegibilidade para MMGD e consulte tarifas vigentes da sua distribuidora.',
}

export default function TarifasPage() {
    return (
        <TariffProvider>
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
                <div className="content-container">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                            📊 Classificação Tarifária ANEEL
                        </h1>
                        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
                            Identifique automaticamente seu grupo e subgrupo tarifário segundo PRODIST,
                            valide elegibilidade para micro/minigeração distribuída (MMGD) e consulte
                            tarifas vigentes homologadas pela ANEEL.
                        </p>
                    </div>

                    {/* Classifier */}
                    <div className="mb-8">
                        <TariffClassifier />
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <TariffDisplay />
                        <MMGDValidator />
                    </div>

                    {/* Distributor Info */}
                    <div className="mb-8">
                        <DistributorSelector />
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
                                <h3 className="font-semibold text-neutral-900">Conforme PRODIST</h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                                Classificação automática segundo PRODIST Módulos 3.A-3.C e Resoluções Normativas ANEEL
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow-md border border-neutral-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900">Validação MMGD</h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                                Verifica elegibilidade para micro/minigeração distribuída e identifica a modalidade adequada
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow-md border border-neutral-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900">Tarifas Atualizadas</h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                                Consulta tarifas vigentes homologadas pela ANEEL incluindo TUSD, TE e bandeiras tarifárias
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </TariffProvider>
    )
}
