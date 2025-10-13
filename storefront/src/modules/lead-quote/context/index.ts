"use client"

/**
 * Lead Quote Context Module
 *
 * Provides context and state management for lead quote functionality
 * including quote requests, negotiations, and approvals.
 */

import React, { createContext, useContext, useReducer, ReactNode } from "react"

export interface LeadQuote {
    id: string
    customer_id: string
    status: "draft" | "pending" | "approved" | "rejected" | "expired"
    items: LeadQuoteItem[]
    total: number
    currency: string
    expires_at?: Date
    created_at: Date
    updated_at: Date
}

export interface LeadQuoteItem {
    id: string
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    notes?: string
}

export interface LeadQuoteContextState {
    currentQuote: LeadQuote | null
    quotes: LeadQuote[]
    isLoading: boolean
    error: string | null
}

export type LeadQuoteAction =
    | { type: "SET_CURRENT_QUOTE"; payload: LeadQuote | null }
    | { type: "SET_QUOTES"; payload: LeadQuote[] }
    | { type: "ADD_QUOTE"; payload: LeadQuote }
    | { type: "UPDATE_QUOTE"; payload: LeadQuote }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "CLEAR_ERROR" }

const initialState: LeadQuoteContextState = {
    currentQuote: null,
    quotes: [],
    isLoading: false,
    error: null,
}

function leadQuoteReducer(
    state: LeadQuoteContextState,
    action: LeadQuoteAction
): LeadQuoteContextState {
    switch (action.type) {
        case "SET_CURRENT_QUOTE":
            return { ...state, currentQuote: action.payload }

        case "SET_QUOTES":
            return { ...state, quotes: action.payload }

        case "ADD_QUOTE":
            return { ...state, quotes: [...state.quotes, action.payload] }

        case "UPDATE_QUOTE":
            return {
                ...state,
                quotes: state.quotes.map(quote =>
                    quote.id === action.payload.id ? action.payload : quote
                ),
                currentQuote: state.currentQuote?.id === action.payload.id
                    ? action.payload
                    : state.currentQuote
            }

        case "SET_LOADING":
            return { ...state, isLoading: action.payload }

        case "SET_ERROR":
            return { ...state, error: action.payload }

        case "CLEAR_ERROR":
            return { ...state, error: null }

        default:
            return state
    }
}

const LeadQuoteContext = createContext<{
    state: LeadQuoteContextState
    dispatch: React.Dispatch<LeadQuoteAction>
} | null>(null)

export interface LeadQuoteProviderProps {
    children: ReactNode
}

export function LeadQuoteProvider({ children }: LeadQuoteProviderProps) {
    const [state, dispatch] = useReducer(leadQuoteReducer, initialState)

    return React.createElement(
        LeadQuoteContext.Provider,
        { value: { state, dispatch } },
        children
    )
}

export function useLeadQuote() {
    const context = useContext(LeadQuoteContext)
    if (!context) {
        throw new Error("useLeadQuote must be used within a LeadQuoteProvider")
    }
    return context
}

// Action creators
export const leadQuoteActions = {
    setCurrentQuote: (quote: LeadQuote | null) => ({
        type: "SET_CURRENT_QUOTE" as const,
        payload: quote,
    }),

    setQuotes: (quotes: LeadQuote[]) => ({
        type: "SET_QUOTES" as const,
        payload: quotes,
    }),

    addQuote: (quote: LeadQuote) => ({
        type: "ADD_QUOTE" as const,
        payload: quote,
    }),

    updateQuote: (quote: LeadQuote) => ({
        type: "UPDATE_QUOTE" as const,
        payload: quote,
    }),

    setLoading: (loading: boolean) => ({
        type: "SET_LOADING" as const,
        payload: loading,
    }),

    setError: (error: string | null) => ({
        type: "SET_ERROR" as const,
        payload: error,
    }),

    clearError: () => ({
        type: "CLEAR_ERROR" as const,
    }),
}