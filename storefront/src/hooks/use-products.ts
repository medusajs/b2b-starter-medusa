/**
 * React Query hooks para produtos internos
 * Gerencia listagem e busca com cache
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { listInternalProducts, searchInternalProducts } from "@/lib/api/internal"

/**
 * Hook para listar produtos com busca e paginação
 */
export const useInternalProducts = (q: string = "", page: number = 0, limit: number = 20) => {
    return useQuery({
        queryKey: ["admin/internal/products", q, page, limit],
        queryFn: () => listInternalProducts(q, page, limit),
        select: (response) => ({
            items: response.data.items,
            meta: response.meta,
        }),
        staleTime: 30_000, // 30 segundos
        retry: 2,
    })
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
    return useQuery({
        queryKey: ["admin/internal/products/search", filters],
        queryFn: () => searchInternalProducts(filters),
        select: (response) => ({
            items: response.data.items,
            meta: response.meta,
        }),
        enabled: Object.keys(filters).length > 0,
        staleTime: 30_000,
        retry: 2,
    })
}
