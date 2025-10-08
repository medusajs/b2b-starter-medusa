/**
 * Common types for YSH Pricing Module
 */

export type PricingTier = {
    distributor: string;
    distributor_id: string;
    basePrice: number;
    finalPrice: number;
    markup: number;
    availability: "in_stock" | "low_stock" | "out_of_stock" | "backorder";
    leadTime?: number;
    minQuantity?: number;
    qtyAvailable?: number;
};

export type ProductPricing = {
    variantId: string;
    variantExternalId?: string;
    currency: string;
    tiers: PricingTier[];
    bestOffer: PricingTier;
    lastUpdated: Date;
};

export type DistributorConfig = {
    name: string;
    keywords: string[];
    priceMarkup: number;
    minOrderValue?: number;
    allowedCompanies?: string[];
    priority: number;
};

export type InventoryData = {
    distributor: string;
    qty_available: number;
    qty_reserved: number;
    allow_backorder: boolean;
    restock_date?: Date;
    warehouse_location?: string;
};

export type SyncStats = {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    duration_ms: number;
};
