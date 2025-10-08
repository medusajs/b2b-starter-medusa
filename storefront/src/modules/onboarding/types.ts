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
  annualKwh?: number
  monthlyBill: number
  peakDemandKw?: number
}

export interface RoofData {
  type: 'ceramic' | 'metallic' | 'concrete' | 'fiber_cement' | 'other'
  area: number
  orientation: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
  inclination: number
  shading: 'none' | 'partial' | 'moderate' | 'heavy'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface OnboardingData {
  location?: LocationData
  consumption?: ConsumptionData
  roof?: RoofData
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
