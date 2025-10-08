/**
 * URL Encoding/Decoding utilities for Finance Input
 *
 * Encodes FinanceInput data for URL parameters and decodes it back
 */

import type { FinanceInput } from '@/modules/finance/types'

/**
 * Encode FinanceInput to URL-safe string
 */
export function encodeFinanceInput(input: FinanceInput): string {
    try {
        // Create a simplified version for URL encoding
        const urlData = {
            id: input.id,
            capex: input.capex,
            system_kwp: input.system_kwp,
            annual_generation_kwh: input.annual_generation_kwh,
            monthly_savings_brl: input.monthly_savings_brl,
            current_monthly_bill_brl: input.current_monthly_bill_brl,
            oversizing_scenario: input.oversizing_scenario,
            created_at: input.created_at,
        }

        // Encode to base64
        const jsonString = JSON.stringify(urlData)
        const base64 = btoa(encodeURIComponent(jsonString))

        return base64
    } catch (error) {
        console.error('Error encoding finance input:', error)
        throw new Error('Failed to encode finance input')
    }
}

/**
 * Decode URL-safe string back to FinanceInput
 */
export function decodeFinanceInput(encoded: string): FinanceInput {
    try {
        // Decode from base64
        const jsonString = decodeURIComponent(atob(encoded))
        const urlData = JSON.parse(jsonString)

        // Validate required fields
        if (!urlData.id || !urlData.capex || !urlData.monthly_savings_brl) {
            throw new Error('Invalid encoded data: missing required fields')
        }

        // Reconstruct FinanceInput
        const input: FinanceInput = {
            id: urlData.id,
            capex: urlData.capex,
            system_kwp: urlData.system_kwp || 0,
            annual_generation_kwh: urlData.annual_generation_kwh || 0,
            monthly_savings_brl: urlData.monthly_savings_brl,
            current_monthly_bill_brl: urlData.current_monthly_bill_brl || 0,
            oversizing_scenario: urlData.oversizing_scenario || 130,
            created_at: urlData.created_at || new Date().toISOString(),
        }

        return input
    } catch (error) {
        console.error('Error decoding finance input:', error)
        throw new Error('Failed to decode finance input')
    }
}