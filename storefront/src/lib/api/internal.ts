/**
 * Wrappers para APIs internas de produto e imagens
 * Consumo tipado das rotas /admin/internal/**
 */

import { adminFetch, storeFetch } from "./http"

// ============================================
// Types
// ============================================

export interface ProductImage {
    id: string
    url: string
    alt?: string
    rank?: number
}

export interface Product {
    id: string
    title: string
    handle: string
    description?: string
    thumbnail?: string
    images: ProductImage[]
    variants?: unknown[]
    categories?: unknown[]
    collection?: unknown
    tags?: unknown[]
    status?: string
}

export interface ListProductsResponse {
    success: boolean
    data: {
        items: Product[]
    }
    meta: {
        count: number
        limit: number
        offset: number
        total_pages: number
    }
}

export interface AttachImagesRequest {
    files: Array<{
        url?: string
        fileId?: string
        alt?: string
    }>
    attachTo?: "product" | "variant"
    variant_id?: string
}

export interface ReorderImagesRequest {
    reorder: Array<{
        image_id: string
        rank: number
    }>
}

export interface RemoveImagesRequest {
    image_ids: string[]
}

export interface PresignUploadRequest {
    filename: string
    contentType: string
}

export interface PresignUploadResponse {
    success: boolean
    data: {
        url: string
        fields?: Record<string, string>
        file_url?: string
    }
}

// ============================================
// Admin - Produtos
// ============================================

/**
 * Lista produtos com imagens ordenadas por rank
 */
export const listInternalProducts = (
    q = "",
    page = 0,
    limit = 20
): Promise<ListProductsResponse> => {
    const offset = page * limit
    return adminFetch<ListProductsResponse>(
        `/admin/internal/products?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`
    )
}

/**
 * Busca avançada de produtos
 */
export const searchInternalProducts = (body: {
    q?: string
    category_ids?: string[]
    collection_id?: string
    tags?: string[]
    status?: string[]
    limit?: number
    offset?: number
    sort_by?: string
    sort_order?: "ASC" | "DESC"
}): Promise<ListProductsResponse> => {
    return adminFetch<ListProductsResponse>("/admin/internal/products", {
        method: "POST",
        body: JSON.stringify(body),
    })
}

// ============================================
// Admin - Imagens
// ============================================

/**
 * Anexa imagens a um produto
 */
export const attachProductImages = (
    productId: string,
    body: AttachImagesRequest
) => {
    return adminFetch(`/admin/internal/products/${productId}/images`, {
        method: "POST",
        body: JSON.stringify(body),
    })
}

/**
 * Reordena imagens de um produto
 */
export const reorderProductImages = (
    productId: string,
    body: ReorderImagesRequest
) => {
    return adminFetch(`/admin/internal/products/${productId}/images`, {
        method: "PATCH",
        body: JSON.stringify(body),
    })
}

/**
 * Remove imagens de um produto
 */
export const removeProductImages = (
    productId: string,
    body: RemoveImagesRequest
) => {
    return adminFetch(`/admin/internal/products/${productId}/images`, {
        method: "DELETE",
        body: JSON.stringify(body),
    })
}

// ============================================
// Admin - Upload
// ============================================

/**
 * Gera URL pré-assinada para upload direto ao S3
 */
export const presignUpload = (
    filename: string,
    contentType: string
): Promise<PresignUploadResponse> => {
    return adminFetch<PresignUploadResponse>("/admin/internal/media/presign", {
        method: "POST",
        body: JSON.stringify({ filename, contentType }),
    })
}

// ============================================
// Store - Produtos Públicos (opcional)
// ============================================

/**
 * Busca produto por handle (rota store pública)
 * Requer x-publishable-api-key
 */
export const getProductByHandle = (handle: string): Promise<{ success: boolean; data: Product }> => {
    return storeFetch<{ success: boolean; data: Product }>(
        `/store/internal/products/${handle}`
    )
}
