'use client'

/**
 * useQuotesList Hook
 * 
 * Hook for managing quotes list with filtering and sorting
 */

import { useState, useCallback } from 'react'
import { useQuotes } from '../context/QuotesContext'
import type { QuoteFilters, QuoteSummary } from '../types'

export default function useQuotesList() {
    const { quotes, isLoading, fetchQuotes } = useQuotes()
    const [filters, setFilters] = useState<QuoteFilters>({})
    const [sortBy, setSortBy] = useState<'date' | 'value' | 'status'>('date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Apply filters
    const applyFilters = useCallback(async (newFilters: QuoteFilters) => {
        setFilters(newFilters)
        await fetchQuotes(newFilters)
    }, [fetchQuotes])

    // Clear filters
    const clearFilters = useCallback(async () => {
        setFilters({})
        await fetchQuotes({})
    }, [fetchQuotes])

    // Sort quotes
    const sortedQuotes = useCallback(() => {
        const sorted = [...quotes].sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    break
                case 'value':
                    comparison = a.total - b.total
                    break
                case 'status':
                    comparison = a.status.localeCompare(b.status)
                    break
            }

            return sortOrder === 'asc' ? comparison : -comparison
        })

        return sorted
    }, [quotes, sortBy, sortOrder])

    // Toggle sort order
    const toggleSortOrder = useCallback(() => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    }, [])

    // Change sort by
    const changeSortBy = useCallback((newSortBy: 'date' | 'value' | 'status') => {
        setSortBy(newSortBy)
    }, [])

    return {
        quotes: sortedQuotes(),
        filters,
        sortBy,
        sortOrder,
        isLoading,
        applyFilters,
        clearFilters,
        toggleSortOrder,
        changeSortBy
    }
}
