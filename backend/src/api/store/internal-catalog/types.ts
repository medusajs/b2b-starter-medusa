/**
 * Internal Catalog API Types
 * Optimized for high-performance image loading and caching
 */

export interface ImageSet {
    original: string;
    thumb: string;
    medium: string;
    large: string;
    verified?: boolean;
    hash?: string;
}

export interface ProductImage {
    url: string;
    sizes: ImageSet;
    preloaded: boolean;
    cached: boolean;
    load_time_ms?: number;
}

export interface TechnicalSpecs {
    power_w?: number;
    power_kw?: number;
    voltage_v?: number;
    current_a?: number;
    efficiency?: number;
    type?: string;
    phases?: string;
    technology?: string;
    [key: string]: any;
}

export interface ProductMetadata {
    source: string;
    source_file?: string;
    loaded_at?: string;
    normalized?: boolean;
    specs_enriched?: boolean;
    image_match?: {
        method: string;
        confidence: number;
        exact_match: boolean;
        tier: string;
    };
}

export interface InternalProduct {
    id: string;
    sku: string;
    name: string;
    manufacturer: string;
    model?: string;
    category: string;
    price_brl?: number;
    price?: string;
    image: ProductImage;
    distributor?: string;
    source: string;
    availability?: boolean;
    description?: string;
    technical_specs?: TechnicalSpecs;
    metadata?: ProductMetadata;
}

export interface CategoryStats {
    category: string;
    total_products: number;
    with_images: number;
    with_prices: number;
    manufacturers: string[];
    avg_price_brl?: number;
    min_price_brl?: number;
    max_price_brl?: number;
}

export interface CatalogResponse {
    products: InternalProduct[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
    stats: CategoryStats;
    cache: {
        hit: boolean;
        age_seconds?: number;
        preloaded: boolean;
    };
    performance: {
        query_time_ms: number;
        image_load_time_ms: number;
        total_time_ms: number;
    };
}

export interface ImageSyncStatus {
    total_images: number;
    synced: number;
    missing: number;
    pending: number;
    errors: number;
    sync_time_ms: number;
    last_sync: string;
}

export interface CatalogHealthCheck {
    status: 'healthy' | 'degraded' | 'unhealthy';
    categories: { [key: string]: CategoryStats };
    images: ImageSyncStatus;
    cache: {
        size: number;
        hit_rate: number;
        entries: number;
    };
    uptime_seconds: number;
    last_updated: string;
}
