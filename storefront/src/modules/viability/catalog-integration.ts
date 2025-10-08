/**
 * Viability to Catalog Integration
 * 
 * Converts viability analysis output to catalog queries
 * Enables seamless flow: Viability → Kit Selection → Finance
 */

import type { ViabilityOutput } from '@modules/viability/types'
import type { CatalogKit } from '@lib/catalog/integration'
import type { FinanceInput } from '@modules/finance/types'
import { calculateKitCAPEX } from '@lib/catalog/integration'

// ============================================================================
// Viability → Catalog Query
// ============================================================================

export interface KitSearchCriteria {
    minKwp: number
    maxKwp: number
    type: 'grid-tie' | 'hybrid' | 'off-grid' | 'all'
    budgetMin?: number
    budgetMax?: number
    oversizingScenario: 114 | 130 | 145 | 160
}

/**
 * Convert viability output to kit search criteria
 * 
 * Takes the recommended system size and converts to catalog search parameters
 * Applies oversizing tolerance (default: ±15%)
 */
export function viabilityToKitSearch(
    viability: ViabilityOutput,
    oversizingScenario: 114 | 130 | 145 | 160 = 114,
    tolerance: number = 0.15
): KitSearchCriteria {
    // Apply oversizing multiplier
    const oversizingMultiplier = oversizingScenario / 100
    const targetKwp = viability.recommended_system_kwp * oversizingMultiplier

    // Calculate power range with tolerance
    const minKwp = targetKwp * (1 - tolerance)
    const maxKwp = targetKwp * (1 + tolerance)

    // Determine kit type based on viability output
    let kitType: 'grid-tie' | 'hybrid' | 'off-grid' | 'all' = 'all'

    if (viability.savings_analysis.savings_category === 'ALTA_ECONOMIA') {
        kitType = 'grid-tie' // High savings = grid-tied
    } else if (viability.savings_analysis.savings_category === 'MEDIA_ECONOMIA') {
        kitType = 'hybrid' // Medium savings = consider hybrid
    }

    return {
        minKwp,
        maxKwp,
        type: kitType,
        oversizingScenario,
    }
}

// ============================================================================
// Catalog → Finance Input
// ============================================================================

/**
 * Convert catalog kit to finance input
 * 
 * Takes a selected kit and prepares complete finance calculation input
 */
export function kitToFinanceInput(
    kit: CatalogKit,
    viability: ViabilityOutput,
    oversizingScenario: 114 | 130 | 145 | 160 = 114
): FinanceInput {
    // Calculate CAPEX from kit
    const capexCalc = calculateKitCAPEX(kit)

    // Apply oversizing to generation
    const oversizingMultiplier = oversizingScenario / 100
    const adjustedGeneration = viability.annual_generation_kwh * oversizingMultiplier

    return {
        // System data
        system_kwp: kit.potencia_kwp,
        annual_generation_kwh: adjustedGeneration,
        oversizing_scenario: oversizingScenario,

        // CAPEX from kit
        capex: capexCalc.breakdown,

        // Savings from viability
        current_monthly_bill_brl: viability.monthly_bill_brl,
        monthly_savings_brl: viability.savings_analysis.monthly_savings_brl,

        // Metadata
        viability_id: viability.id,
        kit_id: kit.id,
        kit_name: kit.name,
        distributor: kit.distributor,
    }
}

// ============================================================================
// Kit Selection Helpers
// ============================================================================

export interface KitRecommendation {
    kit: CatalogKit
    score: number
    match_reason: string
    capex_preview: {
        kit: number
        labor: number
        total: number
    }
    monthly_payment_preview: number // Estimated at 48 months
}

/**
 * Rank kits by suitability for viability scenario
 */
export function rankKitsByViability(
    kits: CatalogKit[],
    viability: ViabilityOutput,
    oversizingScenario: 114 | 130 | 145 | 160 = 114
): KitRecommendation[] {
    const targetKwp = viability.recommended_system_kwp * (oversizingScenario / 100)

    return kits
        .map((kit) => {
            const capex = calculateKitCAPEX(kit)

            // Calculate match score (0-100)
            let score = 100

            // Power match (±10% is ideal)
            const powerDiff = Math.abs(kit.potencia_kwp - targetKwp) / targetKwp
            if (powerDiff < 0.1) {
                score += 20 // Perfect match bonus
            } else if (powerDiff > 0.3) {
                score -= 30 // Far from ideal
            }

            // Price competitiveness
            const avgKitPrice = kits.reduce((sum, k) => sum + k.price_brl, 0) / kits.length
            if (capex.breakdown.total < avgKitPrice) {
                score += 15 // Below average price bonus
            }

            // Generation match
            const expectedGeneration = kit.potencia_kwp * 1300 // ~1300 kWh/kWp/year average
            const generationDiff = Math.abs(expectedGeneration - viability.annual_generation_kwh) / viability.annual_generation_kwh
            if (generationDiff < 0.1) {
                score += 10
            }

            // Determine match reason
            let matchReason = ''
            if (powerDiff < 0.05) {
                matchReason = 'Potência ideal para seu consumo'
            } else if (capex.breakdown.total < avgKitPrice * 0.9) {
                matchReason = 'Melhor custo-benefício'
            } else if (kit.distributor === 'FOTUS') {
                matchReason = 'Distribuidor confiável'
            } else {
                matchReason = 'Boa opção para seu perfil'
            }

            // Estimate monthly payment (48 months at 24.5% annual rate)
            const monthlyRate = 0.0184 // 1.84% monthly (from BACEN)
            const months = 48
            const monthlyPayment = (capex.breakdown.total * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1)

            return {
                kit,
                score: Math.max(0, Math.min(100, score)),
                match_reason: matchReason,
                capex_preview: {
                    kit: capex.breakdown.kit,
                    labor: capex.breakdown.labor,
                    total: capex.breakdown.total,
                },
                monthly_payment_preview: Math.round(monthlyPayment * 100) / 100,
            }
        })
        .sort((a, b) => b.score - a.score) // Best match first
}

// ============================================================================
// URL Parameter Helpers
// ============================================================================

/**
 * Encode viability data for URL
 */
export function encodeViabilityForURL(viability: ViabilityOutput): string {
    const data = {
        id: viability.id,
        kwp: viability.recommended_system_kwp,
        gen: viability.annual_generation_kwh,
        bill: viability.monthly_bill_brl,
        savings: viability.savings_analysis.monthly_savings_brl,
    }

    return btoa(JSON.stringify(data))
}

/**
 * Decode viability data from URL
 */
export function decodeViabilityFromURL(encoded: string): Partial<ViabilityOutput> | null {
    try {
        const data = JSON.parse(atob(encoded))
        return {
            id: data.id,
            recommended_system_kwp: data.kwp,
            annual_generation_kwh: data.gen,
            monthly_bill_brl: data.bill,
            savings_analysis: {
                monthly_savings_brl: data.savings,
            } as any,
        }
    } catch (error) {
        console.error('[Viability] Error decoding URL data:', error)
        return null
    }
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Generate catalog URL from viability output
 */
export function getKitSearchURL(
    viability: ViabilityOutput,
    oversizingScenario: 114 | 130 | 145 | 160 = 114
): string {
    const search = viabilityToKitSearch(viability, oversizingScenario)
    const viabilityData = encodeViabilityForURL(viability)

    const params = new URLSearchParams({
        minPower: search.minKwp.toFixed(2),
        maxPower: search.maxKwp.toFixed(2),
        type: search.type,
        oversizing: oversizingScenario.toString(),
        viability: viabilityData,
    })

    return `/catalogo?${params.toString()}`
}

/**
 * Generate finance URL from kit selection
 */
export function getFinanceURL(
    kit: CatalogKit,
    viability: ViabilityOutput,
    oversizingScenario: 114 | 130 | 145 | 160 = 114
): string {
    const financeInput = kitToFinanceInput(kit, viability, oversizingScenario)
    const encoded = btoa(JSON.stringify(financeInput))

    return `/financiamento?data=${encoded}`
}
