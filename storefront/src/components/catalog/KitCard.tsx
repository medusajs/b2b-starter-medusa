/**
 * KitCard Component
 * 
 * Displays a catalog kit with composition details and pricing
 * Shows match score and CAPEX breakdown from viability integration
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CatalogKit } from '@/lib/catalog/integration'
import type { KitRecommendation } from '@/modules/viability/catalog-integration'
import { formatPriceBRL } from '@/lib/catalog/integration'
import { Zap, Battery, Box, TrendingUp } from 'lucide-react'

export interface KitCardProps {
    kit: CatalogKit
    recommendation?: KitRecommendation
    onSelect?: (kit: CatalogKit) => void
    selected?: boolean
    showCapex?: boolean
    compact?: boolean
}

export function KitCard({
    kit,
    recommendation,
    onSelect,
    selected = false,
    showCapex = true,
    compact = false,
}: KitCardProps) {
    const price = kit.price_brl || kit.pricing?.price_brl || 0
    const capex = recommendation?.capex_preview
    const monthlyPayment = recommendation?.monthly_payment_preview

    // Extract first panel and inverter for display
    const firstPanel = kit.panels?.[0]
    const firstInverter = kit.inverters?.[0]
    const hasBatteries = kit.batteries && kit.batteries.length > 0

    return (
        <Card className={`relative ${selected ? 'ring-2 ring-primary' : ''} ${compact ? 'h-auto' : 'h-full'}`}>
            {/* Match Score Badge */}
            {recommendation && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant={recommendation.score >= 80 ? 'default' : 'secondary'}>
                        {Math.round(recommendation.score)}% match
                    </Badge>
                </div>
            )}

            <CardHeader className={compact ? 'pb-3' : ''}>
                {/* Distributor */}
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                        {kit.distributor}
                    </Badge>
                    {hasBatteries && (
                        <Badge variant="secondary" className="text-xs">
                            <Battery className="w-3 h-3 mr-1" />
                            Híbrido
                        </Badge>
                    )}
                </div>

                {/* Kit Name */}
                <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                    {kit.name}
                </CardTitle>

                {/* Match Reason */}
                {recommendation?.match_reason && (
                    <CardDescription className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4" />
                        {recommendation.match_reason}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Power */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-lg">{kit.potencia_kwp} kWp</span>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                            {formatPriceBRL(price)}
                        </div>
                        {monthlyPayment && (
                            <div className="text-sm text-muted-foreground">
                                ou {formatPriceBRL(monthlyPayment)}/mês
                            </div>
                        )}
                    </div>
                </div>

                {/* Composition */}
                {!compact && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        {/* Panels */}
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Painéis</div>
                            <div className="font-medium">{kit.total_panels}x {firstPanel?.power_w}W</div>
                            {firstPanel?.brand && (
                                <div className="text-xs text-muted-foreground">{firstPanel.brand}</div>
                            )}
                        </div>

                        {/* Inverters */}
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Inversores</div>
                            <div className="font-medium">{kit.total_inverters}x {firstInverter?.power_kw}kW</div>
                            {firstInverter?.brand && (
                                <div className="text-xs text-muted-foreground">{firstInverter.brand}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* CAPEX Preview */}
                {showCapex && capex && !compact && (
                    <div className="pt-3 border-t space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Investimento Total</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kit:</span>
                                <span>{formatPriceBRL(capex.kit)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mão de obra:</span>
                                <span>{formatPriceBRL(capex.labor)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>Total estimado:</span>
                            <span className="text-primary">{formatPriceBRL(capex.total)}</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className={compact ? 'pt-0' : ''}>
                <Button
                    className="w-full"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() => onSelect?.(kit)}
                >
                    {selected ? (
                        <>
                            <Box className="w-4 h-4 mr-2" />
                            Selecionado
                        </>
                    ) : (
                        'Selecionar Kit'
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}

/**
 * Kit List Component
 */
export interface KitListProps {
    kits: CatalogKit[]
    recommendations?: KitRecommendation[]
    onSelectKit?: (kit: CatalogKit) => void
    selectedKitId?: string
    loading?: boolean
    error?: string | null
    emptyMessage?: string
}

export function KitList({
    kits,
    recommendations,
    onSelectKit,
    selectedKitId,
    loading = false,
    error = null,
    emptyMessage = 'Nenhum kit encontrado',
}: KitListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="h-[400px] animate-pulse">
                        <CardHeader>
                            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                            <div className="h-6 bg-muted rounded w-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="h-8 bg-muted rounded" />
                                <div className="h-20 bg-muted rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card className="p-6 text-center">
                <div className="text-destructive mb-2">Erro ao carregar kits</div>
                <div className="text-sm text-muted-foreground">{error}</div>
            </Card>
        )
    }

    if (kits.length === 0) {
        return (
            <Card className="p-12 text-center">
                <Box className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="text-lg font-medium mb-2">{emptyMessage}</div>
                <div className="text-sm text-muted-foreground">
                    Tente ajustar os filtros de busca
                </div>
            </Card>
        )
    }

    // Map recommendations by kit ID for easy lookup
    const recommendationMap = new Map(
        recommendations?.map(rec => [rec.kit.id, rec]) || []
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kits.map((kit) => (
                <KitCard
                    key={kit.id}
                    kit={kit}
                    recommendation={recommendationMap.get(kit.id)}
                    onSelect={onSelectKit}
                    selected={kit.id === selectedKitId}
                    showCapex={!!recommendationMap.get(kit.id)}
                />
            ))}
        </div>
    )
}
