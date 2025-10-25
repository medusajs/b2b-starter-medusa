'use client'

/**
 * Financing Page Client Component
 *
 * Handles credit simulation with BACEN rates
 * Accepts URL-encoded FinanceInput from catalog selection
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@medusajs/ui'
import { ArrowLeft, Calculator, CreditCard, TrendingUp } from 'lucide-react'
import { useFinancingIntegration } from '@/hooks/useFinancingIntegration'
import { FinancingForm } from '@/modules/financing/components/FinancingForm'
import { FinancingResults } from '@/modules/financing/components/FinancingResults'
import { FinancingSummary } from '@/modules/financing/components/FinancingSummary'
import { decodeFinanceInput } from '@/modules/financing/utils/url-encoding'
import type { FinanceInput } from '@/modules/financing/types'

interface FinancingPageClientProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function FinancingPageClient({ searchParams }: FinancingPageClientProps) {
    const router = useRouter()
    const [financeInput, setFinanceInput] = useState<FinanceInput | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const {
        financingData,
        isLoading: isFinancingLoading,
        error: financingError,
        calculateFinancing,
        clearFinancingData,
    } = useFinancingIntegration()

    // Decode finance input from URL parameters
    useEffect(() => {
        try {
            const encoded = searchParams?.data as string
            if (encoded) {
                const decoded = decodeFinanceInput(encoded)
                setFinanceInput(decoded)
            }
        } catch (error) {
            console.error('Error decoding finance input:', error)
        } finally {
            setIsLoading(false)
        }
    }, [searchParams])

    const handleBackToCatalog = () => {
        router.back()
    }

    const handleCalculateFinancing = async (input: FinanceInput) => {
        await calculateFinancing(input)
    }

    const handleStartOver = () => {
        clearFinancingData()
        setFinanceInput(null)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={handleBackToCatalog}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Voltar ao Catálogo</span>
                            </Button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calculator className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Simulação de Financiamento
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        Calcule as melhores condições para seu sistema solar
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CreditCard className="h-4 w-4" />
                            <span>Taxas BACEN atualizadas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <FinancingForm
                                initialData={financeInput}
                                onCalculate={handleCalculateFinancing}
                                isLoading={isFinancingLoading}
                            />
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div className="lg:col-span-2">
                        {financingError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <div className="text-red-600">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">
                                            Erro na Simulação
                                        </h3>
                                        <p className="text-sm text-red-700 mt-1">
                                            {financingError}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {financingData ? (
                            <div className="space-y-6">
                                <FinancingResults data={financingData} />
                                <FinancingSummary
                                    data={financingData}
                                    onStartOver={handleStartOver}
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="p-4 bg-blue-100 rounded-full">
                                        <Calculator className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Pronto para Simular
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Preencha os dados ao lado para ver as opções de financiamento
                                            com taxas atualizadas do BACEN.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}