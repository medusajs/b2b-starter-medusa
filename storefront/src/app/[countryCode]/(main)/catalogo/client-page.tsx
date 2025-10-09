/**
 * Catalog Page Client Component
 *
 * Displays solar kits with viability-based recommendations
 * Integrates with Finance Module for CAPEX calculation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCatalogIntegration } from '@/hooks/useCatalogIntegration'
import { decodeViabilityFromURL } from '@/modules/viability/catalog-integration'
import { KitList } from '@/components/catalog/KitCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calculator, ShoppingCart, Zap } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@medusajs/ui'

interface CatalogPageClientProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function CatalogPageClient({ searchParams }: CatalogPageClientProps) {
    const router = useRouter()
    const [selectedKitId, setSelectedKitId] = useState<string | null>(null)

    // Decode viability data from URL
    const viabilityData = searchParams.viability
        ? decodeViabilityFromURL(searchParams.viability as string)
        : null

    // Initialize catalog integration
    const {
        criteria,
        kits,
        recommendations,
        loading,
        error,
        selectKit,
        selectedKit,
        financeInput,
    } = useCatalogIntegration({
        viability: viabilityData as any || undefined,
        oversizingScenario: (parseInt(searchParams.oversizing as string) || 114) as 114 | 130 | 145 | 160,
        autoSearch: true,
    })

    // Handle kit selection
    const handleSelectKit = (kit: any) => {
        setSelectedKitId(kit.id)
        selectKit(kit)
    }

    // Handle proceed to finance
    const handleProceedToFinance = () => {
        if (!selectedKit || !financeInput) return

        // Encode finance input for URL
        const encodedData = btoa(JSON.stringify(financeInput))
        router.push(`/br/financiamento?data=${encodedData}`)
    }

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!selectedKit) return

        try {
            // Add kit to cart via Medusa API
            const response = await fetch('/api/cart/line-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variant_id: selectedKit.id,
                    quantity: 1,
                    metadata: {
                        kit_id: selectedKit.id,
                        kit_name: selectedKit.name,
                        viability_data: viabilityData,
                        oversizing: searchParams.oversizing,
                    }
                }),
            })

            if (response.ok) {
                toast.success(`Kit ${selectedKit.name} adicionado ao carrinho`, {
                    duration: 3000,
                })
                setTimeout(() => router.push('/br/cart'), 500)
            } else {
                const error = await response.json()
                console.error('Failed to add to cart:', error)
                toast.error('Erro ao adicionar ao carrinho. Tente novamente.')
            }
        } catch (error) {
            console.error('Add to cart error:', error)
            toast.error('Erro ao adicionar ao carrinho. Tente novamente.')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/br/viabilidade">
                        <Button variant="outline" size="small">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para Viabilidade
                        </Button>
                    </Link>
                    <Badge variant="secondary">
                        <Zap className="w-4 h-4 mr-1" />
                        Catálogo Solar
                    </Badge>
                </div>

                <h1 className="text-3xl font-bold mb-2">
                    Kits Solares Recomendados
                </h1>

                {viabilityData && (
                    <CardDescription className="text-lg">
                        Baseado na sua análise: <strong>{(viabilityData as any).recommended_system_kwp || (viabilityData as any).proposal_kwp || 'N/A'} kWp</strong> recomendados
                        {criteria && (
                            <span className="ml-2">
                                (buscando {criteria.minKwp.toFixed(1)} - {criteria.maxKwp.toFixed(1)} kWp)
                            </span>
                        )}
                    </CardDescription>
                )}
            </div>

            {/* Search Criteria */}
            {criteria && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Critérios de Busca</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Potência:</span>
                                <div className="font-medium">
                                    {criteria.minKwp.toFixed(1)} - {criteria.maxKwp.toFixed(1)} kWp
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Oversizing:</span>
                                <div className="font-medium">{criteria.oversizingScenario}%</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Tipo:</span>
                                <div className="font-medium capitalize">{criteria.type}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Kits encontrados:</span>
                                <div className="font-medium">{kits.length}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Kit List */}
            <KitList
                kits={kits}
                recommendations={recommendations}
                onSelectKit={handleSelectKit}
                selectedKitId={selectedKitId || undefined}
                loading={loading}
                error={error}
                emptyMessage="Nenhum kit encontrado para os critérios selecionados. Tente ajustar a viabilidade."
            />

            {/* Action Buttons */}
            {selectedKit && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
                    <div className="container mx-auto flex gap-4 justify-center">
                        <Button
                            onClick={handleAddToCart}
                            variant="outline"
                            size="large"
                            className="flex-1 max-w-xs"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Adicionar ao Carrinho
                        </Button>

                        <Button
                            onClick={handleProceedToFinance}
                            size="large"
                            className="flex-1 max-w-xs"
                        >
                            <Calculator className="w-5 h-5 mr-2" />
                            Simular Financiamento
                        </Button>
                    </div>
                </div>
            )}

            {/* Spacer for fixed buttons */}
            {selectedKit && <div className="h-24" />}
        </div>
    )
}