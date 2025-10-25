/**
 * React hooks para produtos internos
 * Gerencia listagem e busca com estado
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import type { Product, ListProductsResponse } from "@/lib/api/internal"
import { listInternalProducts, searchInternalProducts } from "@/lib/api/internal"

interface UseProductsState {
    data: Product[]
    meta: ListProductsResponse["meta"] | null
    isLoading: boolean
    error: Error | null
}

/**
 * Hook para listar produtos com busca e paginação
 */
export const useInternalProducts = (q: string = "", page: number = 0, limit: number = 20) => {
    const [state, setState] = useState<UseProductsState>({
        data: [],
        meta: null,
        isLoading: true,
        error: null,
    })

    const refetch = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))
        try {
            const response = await listInternalProducts(q, page, limit)
            setState({
                data: response.data.items,
                meta: response.meta,
                isLoading: false,
                error: null,
            })
        } catch (error) {
            setState({
                data: [],
                meta: null,
                isLoading: false,
                error: error as Error,
            })
        }
    }, [q, page, limit])

    useEffect(() => {
        refetch()
    }, [refetch])

    return {
        ...state,
        refetch,
    }
}

/**
 * Hook para busca avançada de produtos
 */
export const useSearchInternalProducts = (filters: {
    q?: string
    category_ids?: string[]
    collection_id?: string
    tags?: string[]
    status?: string[]
    limit?: number
    offset?: number
    sort_by?: string
    sort_order?: "ASC" | "DESC"
}) => {
    const [state, setState] = useState<UseProductsState>({
        data: [],
        meta: null,
        isLoading: true,
        error: null,
    })

    const search = useCallback(async () => {
        if (Object.keys(filters).length === 0) {
            setState({
                data: [],
                meta: null,
                isLoading: false,
                error: null,
            })
            return
        }

        setState((prev) => ({ ...prev, isLoading: true, error: null }))
        try {
            const response = await searchInternalProducts(filters)
            setState({
                data: response.data.items,
                meta: response.meta,
                isLoading: false,
                error: null,
            })
        } catch (error) {
            setState({
                data: [],
                meta: null,
                isLoading: false,
                error: error as Error,
            })
        }
    }, [filters])

    useEffect(() => {
        search()
    }, [search])

    return {
        ...state,
        search,
    }
}