/**
 * Finance Scenarios Storage
 * 
 * Manages persistence of financing calculations and scenarios
 * Supports localStorage and future backend integration
 */

import type {
  FinanceOutput,
  FinancingScenario,
  OversizingScenario,
} from '@/modules/finance/types'

// ============================================================================
// Types
// ============================================================================

export interface StoredScenario {
  id: string
  calculation_id: string
  scenario: OversizingScenario
  created_at: string
  user_id?: string
  name?: string
  notes?: string
}

export interface ScenarioComparison {
  scenarios: StoredScenario[]
  created_at: string
  comparison_notes?: string
}

export interface StorageStats {
  total_calculations: number
  total_scenarios: number
  storage_used_bytes: number
  oldest_calculation?: string
  newest_calculation?: string
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  CALCULATIONS: 'finance_calculations',
  SCENARIOS: 'finance_scenarios',
  COMPARISONS: 'finance_comparisons',
  USER_PREFERENCES: 'finance_user_prefs',
} as const

// ============================================================================
// Calculations Storage
// ============================================================================

/**
 * Save a complete finance calculation
 */
export function saveCalculation(calculation: FinanceOutput): void {
  if (typeof window === 'undefined') return
  
  try {
    // Get existing calculations
    const existing = getAllCalculations()
    
    // Check if calculation already exists (update)
    const index = existing.findIndex(c => c.id === calculation.id)
    
    if (index >= 0) {
      existing[index] = calculation
    } else {
      existing.unshift(calculation) // Add to beginning
    }
    
    // Keep only last 50 calculations
    const trimmed = existing.slice(0, 50)
    
    // Save
    localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(trimmed))
    
    console.log(`Saved calculation ${calculation.id}`)
    
  } catch (error) {
    console.error('Error saving calculation:', error)
  }
}

/**
 * Get a specific calculation by ID
 */
export function getCalculation(id: string): FinanceOutput | null {
  if (typeof window === 'undefined') return null
  
  try {
    const all = getAllCalculations()
    return all.find(c => c.id === id) || null
  } catch (error) {
    console.error('Error getting calculation:', error)
    return null
  }
}

/**
 * Get all stored calculations
 */
export function getAllCalculations(): FinanceOutput[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CALCULATIONS)
    if (!stored) return []
    
    return JSON.parse(stored) as FinanceOutput[]
  } catch (error) {
    console.error('Error loading calculations:', error)
    return []
  }
}

/**
 * Delete a calculation
 */
export function deleteCalculation(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getAllCalculations()
    const filtered = existing.filter(c => c.id !== id)
    
    localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(filtered))
    
    // Also delete associated scenarios
    deleteScenariosByCalculation(id)
    
    console.log(`Deleted calculation ${id}`)
  } catch (error) {
    console.error('Error deleting calculation:', error)
  }
}

/**
 * Clear all calculations
 */
export function clearAllCalculations(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEYS.CALCULATIONS)
    localStorage.removeItem(STORAGE_KEYS.SCENARIOS)
    localStorage.removeItem(STORAGE_KEYS.COMPARISONS)
    
    console.log('Cleared all calculations and scenarios')
  } catch (error) {
    console.error('Error clearing calculations:', error)
  }
}

// ============================================================================
// Scenarios Storage
// ============================================================================

/**
 * Save a specific scenario from a calculation
 */
export function saveScenario(
  calculationId: string,
  scenario: FinancingScenario,
  name?: string,
  notes?: string
): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored: StoredScenario = {
      id: `scenario_${calculationId}_${scenario.scenario}_${Date.now()}`,
      calculation_id: calculationId,
      scenario: scenario.scenario,
      created_at: new Date().toISOString(),
      name,
      notes,
    }
    
    const existing = getAllScenarios()
    existing.unshift(stored)
    
    // Keep only last 100 scenarios
    const trimmed = existing.slice(0, 100)
    
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(trimmed))
    
    console.log(`Saved scenario ${stored.id}`)
  } catch (error) {
    console.error('Error saving scenario:', error)
  }
}

/**
 * Get all stored scenarios
 */
export function getAllScenarios(): StoredScenario[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCENARIOS)
    if (!stored) return []
    
    return JSON.parse(stored) as StoredScenario[]
  } catch (error) {
    console.error('Error loading scenarios:', error)
    return []
  }
}

/**
 * Get scenarios for a specific calculation
 */
export function getScenariosByCalculation(calculationId: string): StoredScenario[] {
  return getAllScenarios().filter(s => s.calculation_id === calculationId)
}

/**
 * Delete scenarios for a calculation
 */
function deleteScenariosByCalculation(calculationId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getAllScenarios()
    const filtered = existing.filter(s => s.calculation_id !== calculationId)
    
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting scenarios:', error)
  }
}

// ============================================================================
// Scenario Comparisons
// ============================================================================

/**
 * Save a scenario comparison
 */
export function saveComparison(
  scenarios: StoredScenario[],
  notes?: string
): string {
  if (typeof window === 'undefined') return ''
  
  try {
    const comparison: ScenarioComparison = {
      scenarios,
      created_at: new Date().toISOString(),
      comparison_notes: notes,
    }
    
    const existing = getAllComparisons()
    existing.unshift(comparison)
    
    // Keep only last 20 comparisons
    const trimmed = existing.slice(0, 20)
    
    localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(trimmed))
    
    return comparison.created_at
  } catch (error) {
    console.error('Error saving comparison:', error)
    return ''
  }
}

/**
 * Get all saved comparisons
 */
export function getAllComparisons(): ScenarioComparison[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPARISONS)
    if (!stored) return []
    
    return JSON.parse(stored) as ScenarioComparison[]
  } catch (error) {
    console.error('Error loading comparisons:', error)
    return []
  }
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

/**
 * Get storage statistics
 */
export function getStorageStats(): StorageStats {
  if (typeof window === 'undefined') {
    return {
      total_calculations: 0,
      total_scenarios: 0,
      storage_used_bytes: 0,
    }
  }
  
  try {
    const calculations = getAllCalculations()
    const scenarios = getAllScenarios()
    
    // Calculate storage size
    const calcSize = JSON.stringify(calculations).length
    const scenarioSize = JSON.stringify(scenarios).length
    const totalSize = calcSize + scenarioSize
    
    // Get date range
    const dates = calculations.map(c => c.calculated_at).sort()
    
    return {
      total_calculations: calculations.length,
      total_scenarios: scenarios.length,
      storage_used_bytes: totalSize,
      oldest_calculation: dates[0],
      newest_calculation: dates[dates.length - 1],
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return {
      total_calculations: 0,
      total_scenarios: 0,
      storage_used_bytes: 0,
    }
  }
}

/**
 * Export all data as JSON
 */
export function exportAllData(): string {
  if (typeof window === 'undefined') return '{}'
  
  try {
    const data = {
      calculations: getAllCalculations(),
      scenarios: getAllScenarios(),
      comparisons: getAllComparisons(),
      exported_at: new Date().toISOString(),
    }
    
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('Error exporting data:', error)
    return '{}'
  }
}

/**
 * Import data from JSON
 */
export function importData(jsonData: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const data = JSON.parse(jsonData)
    
    if (data.calculations) {
      localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(data.calculations))
    }
    
    if (data.scenarios) {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(data.scenarios))
    }
    
    if (data.comparisons) {
      localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(data.comparisons))
    }
    
    console.log('Data imported successfully')
    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}

// ============================================================================
// User Preferences
// ============================================================================

export interface FinanceUserPreferences {
  default_oversizing: OversizingScenario
  preferred_term_months: number
  show_detailed_roi: boolean
  show_comparison_charts: boolean
  auto_save_calculations: boolean
}

const DEFAULT_PREFERENCES: FinanceUserPreferences = {
  default_oversizing: 130,
  preferred_term_months: 60,
  show_detailed_roi: true,
  show_comparison_charts: true,
  auto_save_calculations: true,
}

/**
 * Get user preferences
 */
export function getUserPreferences(): FinanceUserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    if (!stored) return DEFAULT_PREFERENCES
    
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
  } catch (error) {
    console.error('Error loading preferences:', error)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Save user preferences
 */
export function saveUserPreferences(prefs: Partial<FinanceUserPreferences>): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getUserPreferences()
    const updated = { ...current, ...prefs }
    
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
    
    console.log('Preferences saved')
  } catch (error) {
    console.error('Error saving preferences:', error)
  }
}
