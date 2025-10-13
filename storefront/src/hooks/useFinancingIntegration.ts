/**
 * Financing Integration Hook
 *
 * Integrates with the Finance module for credit simulation
 */

import { useFinance } from '@/modules/financing/financing/context/FinanceContext'
import type { FinanceInput, FinanceOutput } from '@/modules/finance/types'

export function useFinancingIntegration() {
    const finance = useFinance()

    return {
        financingData: finance.currentCalculation,
        isLoading: finance.state.loading,
        error: finance.state.error,
        calculateFinancing: finance.calculateFinancing,
        clearFinancingData: finance.clearCalculation,
    }
}