'use client'

/**
 * Quotes Context
 * 
 * Global state management for quotes module
 * Handles quotes CRUD, approvals, and statistics
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type {
    Quote,
    QuoteSummary,
    QuoteFilters,
    QuoteStatistics,
    QuoteApproval
} from '../types'

// ============================================================================
// Context Types
// ============================================================================

interface QuotesContextValue {
    // State
    quotes: QuoteSummary[]
    currentQuote: Quote | null
    statistics: QuoteStatistics | null
    isLoading: boolean
    error: string | null

    // Actions
    fetchQuotes: (filters?: QuoteFilters) => Promise<void>
    fetchQuote: (id: string) => Promise<void>
    fetchStatistics: () => Promise<void>
    refreshQuotes: () => Promise<void>
    clearCurrentQuote: () => void
    clearError: () => void
}

// ============================================================================
// Context Creation
// ============================================================================

const QuotesContext = createContext<QuotesContextValue | undefined>(undefined)

// ============================================================================
// Provider Props
// ============================================================================

interface QuotesProviderProps {
    children: React.ReactNode
}

// ============================================================================
// Provider Component
// ============================================================================

export function QuotesProvider({ children }: QuotesProviderProps) {
    // State
    const [quotes, setQuotes] = useState<QuoteSummary[]>([])
    const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)
    const [statistics, setStatistics] = useState<QuoteStatistics | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentFilters, setCurrentFilters] = useState<QuoteFilters>({})

    // Fetch quotes list
    const fetchQuotes = useCallback(async (filters?: QuoteFilters) => {
        setIsLoading(true)
        setError(null)

        try {
            const queryParams = new URLSearchParams()

            if (filters?.status) {
                queryParams.append('status', filters.status.join(','))
            }
            if (filters?.type) {
                queryParams.append('type', filters.type.join(','))
            }
            if (filters?.customer_id) {
                queryParams.append('customer_id', filters.customer_id)
            }
            if (filters?.company_id) {
                queryParams.append('company_id', filters.company_id)
            }
            if (filters?.search) {
                queryParams.append('search', filters.search)
            }

            const response = await fetch(`/api/quotes?${queryParams}`, {
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to fetch quotes')
            }

            const data = await response.json()
            setQuotes(data.quotes || [])
            setCurrentFilters(filters || {})
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Fetch quotes error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch single quote
    const fetchQuote = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${id}`, {
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to fetch quote')
            }

            const data = await response.json()
            setCurrentQuote(data.quote)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Fetch quote error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const response = await fetch('/api/quotes/statistics', {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setStatistics(data.statistics)
            }
        } catch (err) {
            console.error('Fetch statistics error:', err)
        }
    }, [])

    // Refresh quotes (re-fetch with current filters)
    const refreshQuotes = useCallback(async () => {
        await fetchQuotes(currentFilters)
    }, [fetchQuotes, currentFilters])

    // Clear current quote
    const clearCurrentQuote = useCallback(() => {
        setCurrentQuote(null)
    }, [])

    // Clear error
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // Initial load
    useEffect(() => {
        fetchQuotes()
        fetchStatistics()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Context value
    const value: QuotesContextValue = {
        quotes,
        currentQuote,
        statistics,
        isLoading,
        error,
        fetchQuotes,
        fetchQuote,
        fetchStatistics,
        refreshQuotes,
        clearCurrentQuote,
        clearError
    }

    return (
        <QuotesContext.Provider value={value}>
            {children}
        </QuotesContext.Provider>
    )
}

// ============================================================================
// Hook
// ============================================================================

export function useQuotes() {
    const context = useContext(QuotesContext)

    if (context === undefined) {
        throw new Error('useQuotes must be used within QuotesProvider')
    }

    return context
}
