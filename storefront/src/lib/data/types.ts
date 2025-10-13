/**
 * Tipos compartilhados para data layer do frontend
 * DTOs e interfaces para produtos, imagens e API responses
 */

// ============================================
// Imagens
// ============================================

export interface ProductImage {
    id: string
    url: string
    alt?: string
    rank?: number
    metadata?: Record<string, unknown>
}

// ============================================
// Produtos
// ============================================

export interface ProductVariant {
    id: string
    title: string
    sku?: string
    prices?: ProductPrice[]
    options?: ProductOption[]
    inventory_quantity?: number
}

export interface ProductPrice {
    id: string
    amount: number
    currency_code: string
    price_list_id?: string
}

export interface ProductOption {
    id: string
    title: string
    values: ProductOptionValue[]
}

export interface ProductOptionValue {
    id: string
    value: string
}

export interface ProductCategory {
    id: string
    name: string
    handle: string
    parent_category_id?: string
}

export interface ProductCollection {
    id: string
    title: string
    handle: string
}

export interface ProductTag {
    id: string
    value: string
}

export interface Product {
    id: string
    title: string
    handle: string
    description?: string
    subtitle?: string
    thumbnail?: string
    images: ProductImage[]
    variants?: ProductVariant[]
    categories?: ProductCategory[]
    collection?: ProductCollection
    tags?: ProductTag[]
    status?: "draft" | "published" | "rejected"
    created_at: string
    updated_at: string
    metadata?: Record<string, unknown>
}

// ============================================
// API Responses
// ============================================

export interface PaginationMeta {
    count: number
    limit: number
    offset: number
    total_pages: number
}

export interface ListProductsResponse {
    success: boolean
    data: {
        items: Product[]
    }
    meta: PaginationMeta
}

export interface SingleProductResponse {
    success: boolean
    data: Product
}

export interface ErrorResponse {
    success: false
    error: {
        code: string
        message: string
    }
}

// ============================================
// Requests
// ============================================

export interface ProductSearchFilters {
    q?: string
    category_ids?: string[]
    collection_id?: string
    tags?: string[]
    status?: string[]
    limit?: number
    offset?: number
    sort_by?: string
    sort_order?: "ASC" | "DESC"
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
// Upload State
// ============================================

export interface UploadProgress {
    file: File
    progress: number
    status: "pending" | "uploading" | "success" | "error"
    url?: string
    error?: string
}

// ============================================
// Image Management
// ============================================

export interface ImageWithRank extends ProductImage {
    rank: number
    isNew?: boolean
    isDeleted?: boolean
}

export interface ImageReorderState {
    images: ImageWithRank[]
    hasChanges: boolean
}
