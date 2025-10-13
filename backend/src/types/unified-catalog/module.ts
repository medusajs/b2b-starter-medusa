// Enums
export enum ManufacturerTier {
    TIER_1 = "TIER_1",
    TIER_2 = "TIER_2",
    TIER_3 = "TIER_3",
    UNKNOWN = "UNKNOWN",
}

export enum StockStatus {
    IN_STOCK = "IN_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    LIMITED = "LIMITED",
    UNKNOWN = "UNKNOWN",
}

// Base Module Types
export interface ModuleManufacturer {
    id: string;
    name: string;
    slug: string;
    tier: ManufacturerTier;
    country?: string;
    website?: string;
    logo_url?: string;
    description?: string;
    aliases?: string[];
    product_count: number;
    avg_rating?: number;
    is_active: boolean;
    skus?: ModuleSKU[];
    metadata?: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

export interface ModuleSKU {
    id: string;
    sku_code: string;
    manufacturer_id: string;
    category: string;
    model_number: string;
    description?: string;
    technical_specs?: Record<string, unknown>;
    lowest_price?: number;
    highest_price?: number;
    average_price?: number;
    median_price?: number;
    total_offers: number;
    price_variation_pct?: number;
    is_active: boolean;
    manufacturer?: ModuleManufacturer;
    offers?: ModuleDistributorOffer[];
    metadata?: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

export interface ModuleDistributorOffer {
    id: string;
    sku_id: string;
    distributor_slug: string;
    price: number;
    stock_status: StockStatus;
    stock_quantity?: number;
    lead_time_days?: number;
    warranty_years?: number;
    certifications?: string[];
    sku?: ModuleSKU;
    metadata?: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

export interface ModuleKit {
    id: string;
    kit_code: string;
    name: string;
    description?: string;
    category: string;
    target_consumer_class: string;
    system_capacity_kwp: number;
    estimated_generation_kwh_year?: number;
    total_price_brl?: number;
    components?: unknown[];
    technical_specs?: Record<string, unknown>;
    is_active: boolean;
    metadata?: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

// Create Types
export interface ModuleCreateManufacturer {
    name: string;
    slug: string;
    tier?: ManufacturerTier;
    country?: string;
    website?: string;
    logo_url?: string;
    description?: string;
    aliases?: string[];
    product_count?: number;
    avg_rating?: number;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
}

export interface ModuleCreateSKU {
    sku_code: string;
    manufacturer_id: string;
    category: string;
    model_number: string;
    description?: string;
    technical_specs?: Record<string, unknown>;
    lowest_price?: number;
    highest_price?: number;
    average_price?: number;
    median_price?: number;
    total_offers?: number;
    price_variation_pct?: number;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
}

export interface ModuleCreateDistributorOffer {
    sku_id: string;
    distributor_slug: string;
    price: number;
    stock_status?: StockStatus;
    stock_quantity?: number;
    lead_time_days?: number;
    warranty_years?: number;
    certifications?: string[];
    metadata?: Record<string, unknown>;
}

export interface ModuleCreateKit {
    kit_code: string;
    name: string;
    description?: string;
    category: string;
    target_consumer_class: string;
    system_capacity_kwp: number;
    estimated_generation_kwh_year?: number;
    total_price_brl?: number;
    components?: unknown[];
    technical_specs?: Record<string, unknown>;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
}

// Update Types
export interface ModuleUpdateManufacturer {
    id: string;
    name?: string;
    slug?: string;
    tier?: ManufacturerTier;
    country?: string;
    website?: string;
    logo_url?: string;
    description?: string;
    aliases?: string[];
    product_count?: number;
    avg_rating?: number;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
}

export interface ModuleUpdateSKU {
    id: string;
    sku_code?: string;
    manufacturer_id?: string;
    category?: string;
    model_number?: string;
    description?: string;
    technical_specs?: Record<string, unknown>;
    lowest_price?: number;
    highest_price?: number;
    average_price?: number;
    median_price?: number;
    total_offers?: number;
    price_variation_pct?: number;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
}

export interface ModuleUpdateDistributorOffer {
    id: string;
    sku_id?: string;
    distributor_slug?: string;
    price?: number;
    stock_status?: StockStatus;
    stock_quantity?: number;
    lead_time_days?: number;
    warranty_years?: number;
    certifications?: string[];
    metadata?: Record<string, unknown>;
}

export interface ModuleUpdateKit {
    id: string;
    kit_code?: string;
    name?: string;
    description?: string;
    category?: string;
    target_consumer_class?: string;
    system_capacity_kwp?: number;
    estimated_generation_kwh_year?: number;
    total_price_brl?: number;
    components?: unknown[];
    technical_specs?: Record<string, unknown>;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
}