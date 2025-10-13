'use client'

/**
 * useQuoteApprovals Hook
 * 
 * Hook for managing quote approvals (B2B)
 */

import { useState, useCallback } from 'react'
import { useQuotes } from '../context/QuotesContext'
import type { QuoteApproval } from '../types'

export default function useQuoteApprovals() {
    const { refreshQuotes, fetchQuote } = useQuotes()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Submit quote for approval
    const submitForApproval = useCallback(async (
        quoteId: string,
        approvers: string[]
    ): Promise<boolean> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${quoteId}/approvals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ approvers })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to submit for approval')
            }

            await refreshQuotes()
            await fetchQuote(quoteId)

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes, fetchQuote])

    // Approve quote
    const approveQuote = useCallback(async (
        quoteId: string,
        approvalId: string,
        comments?: string,
        conditions?: string[]
    ): Promise<boolean> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${quoteId}/approvals/${approvalId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ comments, conditions })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to approve quote')
            }

            await refreshQuotes()
            await fetchQuote(quoteId)

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes, fetchQuote])

    // Reject quote
    const rejectQuote = useCallback(async (
        quoteId: string,
        approvalId: string,
        comments: string,
        requestedChanges?: string[]
    ): Promise<boolean> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch(`/api/quotes/${quoteId}/approvals/${approvalId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ comments, requestedChanges })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to reject quote')
            }

            await refreshQuotes()
            await fetchQuote(quoteId)

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsProcessing(false)
        }
    }, [refreshQuotes, fetchQuote])

    // Get pending approvals for current user
    const getPendingApprovals = useCallback(async (): Promise<QuoteApproval[]> => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch('/api/quotes/approvals/pending', {
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to fetch pending approvals')
            }

            const data = await response.json()
            return data.approvals || []
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return []
        } finally {
            setIsProcessing(false)
        }
    }, [])

    return {
        isProcessing,
        error,
        submitForApproval,
        approveQuote,
        rejectQuote,
        getPendingApprovals
    }
}
