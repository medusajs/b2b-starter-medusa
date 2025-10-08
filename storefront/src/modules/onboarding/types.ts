/**
 * Onboarding Module Types
 */

export type OnboardingStep =
    | 'welcome'
    | 'location'
    | 'consumption'
    | 'roof'
    | 'results'

export interface LocationData {
    address: string
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
}

export interface ConsumptionData {
    avgMonthlyKwh: number
    avgMonthlyConsumption?: number // Alias for avgMonthlyKwh
    annualKwh?: number
    annualConsumption?: number // Alias for annualKwh
    monthlyBill: number
    avgMonthlyBill?: number // Alias for monthlyBill
    tariff?: number // R$/kWh
    peakDemandKw?: number
}

export interface RoofData {
    type: 'ceramic' | 'metallic' | 'concrete' | 'fiber_cement' | 'fibrociment' | 'other'
    area: number
    availableArea?: number // Alias for area
    orientation: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
    inclination: number
    shading: 'none' | 'partial' | 'moderate' | 'heavy'
    hasShading?: boolean // Simplified boolean version
    condition: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface OnboardingData {
    location?: LocationData
    consumption?: ConsumptionData
    roof?: RoofData
    results?: OnboardingResult
}

export interface OnboardingResult {
    systemCapacityKwp: number
    panelCount: number
    estimatedGenerationKwhYear: number
    estimatedSavingsMonthly: number
    estimatedSavingsYearly: number
    paybackYears: number
    estimatedCost: number
}
