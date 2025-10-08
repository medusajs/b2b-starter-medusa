/**
 * Fallback Data for Production
 * Provides mock data when Medusa backend is unavailable
 */

import { HttpTypes } from "@medusajs/types"

// ==========================================
// Fallback Regions
// ==========================================

export const FALLBACK_REGIONS: any[] = [
    {
        id: "reg_br_fallback",
        name: "Brasil",
        currency_code: "brl",
        tax_rate: 0,
        countries: [
            {
                id: "1",
                iso_2: "br",
                iso_3: "bra",
                num_code: "76",
                name: "BRAZIL",
                display_name: "Brasil",
                region_id: "reg_br_fallback",
            },
        ],
        payment_providers: [],
        metadata: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
    {
        id: "reg_us_fallback",
        name: "United States",
        currency_code: "usd",
        tax_rate: 0,
        countries: [
            {
                id: "2",
                iso_2: "us",
                iso_3: "usa",
                num_code: "840",
                name: "UNITED STATES",
                display_name: "United States",
                region_id: "reg_us_fallback",
            },
        ],
        payment_providers: [],
        metadata: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
]

// ==========================================
// Fallback Collections
// ==========================================

export const FALLBACK_COLLECTIONS: any[] = [
    {
        id: "col_solar_kits_fallback",
        handle: "solar-kits",
        title: "Kits Solares",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: {
            description: "Kits completos para instalação fotovoltaica",
        },
    },
    {
        id: "col_panels_fallback",
        handle: "paineis-solares",
        title: "Painéis Solares",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: {
            description: "Módulos fotovoltaicos de alta eficiência",
        },
    },
    {
        id: "col_inverters_fallback",
        handle: "inversores",
        title: "Inversores",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: {
            description: "Inversores para sistemas solares",
        },
    },
]

// ==========================================
// Fallback Categories
// ==========================================

export const FALLBACK_CATEGORIES: any[] = [
    {
        id: "cat_kits_fallback",
        name: "Kits Completos",
        description: "Kits solares completos para instalação",
        handle: "kits-completos",
        is_internal: false,
        rank: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: null,
        parent_category_id: null,
        category_children: [],
    },
    {
        id: "cat_panels_fallback",
        name: "Painéis Solares",
        description: "Módulos fotovoltaicos",
        handle: "paineis-solares",
        is_internal: false,
        rank: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: null,
        parent_category_id: null,
        category_children: [],
    },
    {
        id: "cat_inverters_fallback",
        name: "Inversores",
        description: "Inversores solares",
        handle: "inversores",
        is_internal: false,
        rank: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: null,
        parent_category_id: null,
        category_children: [],
    },
]

// ==========================================
// Fallback Products
// ==========================================

export const FALLBACK_PRODUCTS: any[] = [
    {
        id: "prod_kit_5kwp_fallback",
        title: "Kit Solar 5 kWp",
        subtitle: "Kit residencial completo",
        description: "Kit solar completo para residências com consumo médio de 500 kWh/mês",
        handle: "kit-solar-5kwp",
        is_giftcard: false,
        status: "published" as any,
        thumbnail: "/images/fallback-solar-kit.jpg",
        weight: 500,
        length: null,
        height: null,
        width: null,
        hs_code: null,
        origin_country: null,
        mid_code: null,
        material: null,
        collection_id: "col_solar_kits_fallback",
        type_id: null,
        discountable: true,
        external_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: {
            power_kwp: 5.0,
            generation_kwh_month: 650,
            warranty_years: 25,
        },
        variants: [
            {
                id: "var_kit_5kwp_fallback",
                title: "Kit 5 kWp - Padrão",
                product_id: "prod_kit_5kwp_fallback",
                sku: "KIT-5KWP-STD",
                barcode: null,
                ean: null,
                upc: null,
                variant_rank: 0,
                inventory_quantity: 10,
                allow_backorder: false,
                manage_inventory: true,
                hs_code: null,
                origin_country: null,
                mid_code: null,
                material: null,
                weight: 500,
                length: null,
                height: null,
                width: null,
                metadata: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                calculated_price: {
                    calculated_amount: 35000,
                    is_calculated_price_tax_inclusive: false,
                } as any,
            },
        ],
        images: [],
        options: [],
        tags: [],
        type: null,
        collection: null,
        categories: [],
    },
]

// ==========================================
// Helper Functions
// ==========================================

export function isFallbackMode(): boolean {
    return process.env.NEXT_PUBLIC_FALLBACK_MODE === "true" ||
        process.env.NODE_ENV === "production"
}

export function logFallback(resource: string, reason?: string) {
    const timestamp = new Date().toISOString()
    console.warn(
        `[FALLBACK] ${timestamp} - Using fallback data for: ${resource}`,
        reason ? `Reason: ${reason}` : ""
    )
}
