/**
 * Tipos compartilhados para rotas internas de admin
 */

export interface ProductImage {
    id: string
    url: string
    alt?: string
    rank?: number
    metadata?: Record<string, unknown>
}

export interface ProductListQuery {
    q?: string
    category?: string
    limit?: number
    offset?: number
}

export interface ProductSearchBody {
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

export interface ProductFilters {
    q?: string
    category_id?: string | string[]
    collection_id?: string
    tags?: string[]
    status?: string[]
}

export interface PaginatedResponse<T> {
    success: boolean
    data: {
        items: T[]
    }
    meta: {
        count: number
        limit: number
        offset: number
        total_pages: number
    }
}

export interface ErrorResponse {
    success: false
    error: {
        code: string
        message: string
    }
}

// Imagem de produto com rank ordenado
export interface ImageAttachmentFile {
    url?: string
    fileId?: string
    alt?: string
    buffer?: Buffer
    filename?: string
    mime?: string
}

export interface AttachImagesBody {
    files: ImageAttachmentFile[]
    attachTo?: "product" | "variant"
    variant_id?: string
}

export interface ReorderImagesBody {
    reorder: Array<{
        image_id: string
        rank: number
    }>
}

export interface RemoveImagesBody {
    image_ids: string[]
}

export interface PresignUploadBody {
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
