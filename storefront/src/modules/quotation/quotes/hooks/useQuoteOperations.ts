'use client'

/**
 * useQuoteOperations Hook
 * 
 * Hook for quote CRUD operations
 */

import { useState, useCallback } from 'react'
import { useQuotes } from '../context/QuotesContext'
import type { Quote, QuoteInput, QuoteUpdate } from '../types'

export default function useQuoteOperations() {
    const { refreshQuotes, fetchQuote } = useQuotes()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Create quote
    const createQuote = useCallback(async (input: QuoteInput): Promise<Quote | null> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(input)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create quote')
            }

            const data = await response.json()
            await refreshQuotes()

            return data.quote
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes])

    // Update quote
    const updateQuote = useCallback(async (
        id: string,
        update: QuoteUpdate
    ): Promise<boolean> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(update)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update quote')
            }

            await refreshQuotes()
            await fetchQuote(id)

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes, fetchQuote])

    // Delete quote
    const deleteQuote = useCallback(async (id: string): Promise<boolean> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to delete quote')
            }

            await refreshQuotes()

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes])

    // Duplicate quote
    const duplicateQuote = useCallback(async (id: string): Promise<Quote | null> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${id}/duplicate`, {
                method: 'POST',
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to duplicate quote')
            }

            const data = await response.json()
            await refreshQuotes()

            return data.quote
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes])

    // Convert to order
    const convertToOrder = useCallback(async (id: string): Promise<string | null> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${id}/convert`, {
                method: 'POST',
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to convert quote')
            }

            const data = await response.json()
            await refreshQuotes()

            return data.order_id
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes])

    // Export quote (PDF)
    const exportQuote = useCallback(async (id: string): Promise<boolean> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${id}/export`, {
                method: 'POST',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to export quote')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `quote-${id}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsProcessing(false)
        }
    }, [])

    return {
        isProcessing,
        error,
        createQuote,
        updateQuote,
        deleteQuote,
        duplicateQuote,
        convertToOrder,
        exportQuote
    }
}
