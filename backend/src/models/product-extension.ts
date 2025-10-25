/**
 * YSH B2B - Product Extension Model
 * Extends Medusa Product with distributor-specific and certification data
 */

import { model } from "@medusajs/framework/utils"

/**
 * Product Extension
 * Additional fields for solar equipment products
 */
const ProductExtension = model.define("product_extension", {
    id: model.id().primaryKey(),

    // Link to Medusa Product
    product_id: model.text().index(),

    // Distributor Information
    distributor_code: model.text().index(), // FLV, NEO, FTS
    distributor_sku: model.text().nullable(), // Original distributor SKU
    distributor_product_code: model.text().nullable(),

    // Dynamic SKU Generation
    ysh_sku: model.text().unique(), // Generated: FLV-KIT-563KWP-LONGI-GOLD-CERT-001
    sku_tier_suffix: model.text().nullable(), // GOLD, PLAT, SILV
    sku_certification_flag: model.text().nullable(), // CERT, PEND, NONE

    // INMETRO Certification
    inmetro_certified: model.boolean().default(false),
    inmetro_certificate_number: model.text().nullable(),
    inmetro_certification_date: model.dateTime().nullable(),
    inmetro_expiry_date: model.dateTime().nullable(),
    inmetro_kpi_score: model.number().nullable(), // 0-100
    inmetro_document_url: model.text().nullable(),
    inmetro_seal_image_url: model.text().nullable(),

    // Product Specifications (Solar-Specific)
    power_kwp: model.number().nullable(), // Kit power in kWp
    panel_brand: model.text().nullable(),
    panel_power_w: model.number().nullable(),
    panel_quantity: model.number().nullable(),
    inverter_brand: model.text().nullable(),
    inverter_power_kw: model.number().nullable(),
    inverter_model: model.text().nullable(),
    structure_type: model.text().nullable(), // "Cerâmico", "Fibrocimento", "Laje"

    // Tier-Based Pricing Configuration
    base_price_brl: model.number(), // Base price without multipliers
    bronze_price_brl: model.number().nullable(),
    silver_price_brl: model.number().nullable(),
    gold_price_brl: model.number().nullable(),
    platinum_price_brl: model.number().nullable(),

    // Volume Pricing Tiers
    volume_tier_1_qty: model.number().nullable(), // 1-10 units
    volume_tier_1_price: model.number().nullable(),
    volume_tier_2_qty: model.number().nullable(), // 11-50 units
    volume_tier_2_price: model.number().nullable(),
    volume_tier_3_qty: model.number().nullable(), // 51+ units
    volume_tier_3_price: model.number().nullable(),

    // Inventory & Availability
    stock_quantity: model.number().default(0),
    reserved_quantity: model.number().default(0),
    lead_time_days: model.number().default(7),
    backorder_allowed: model.boolean().default(false),

    // Quality & Performance Metrics
    warranty_years: model.number().nullable(),
    efficiency_rating: model.number().nullable(), // Percentage
    durability_score: model.number().nullable(), // 0-100
    customer_rating: model.number().nullable(), // 0-5 stars

    // Visibility & Access Control
    available_to_tiers: model.json().nullable(), // ["gold", "platinum"]
    restricted_regions: model.json().nullable(), // Regions where not available
    minimum_order_quantity: model.number().default(1),

    // Vision AI Extracted Data
    vision_analysis_completed: model.boolean().default(false),
    vision_extracted_specs: model.json().nullable(),
    vision_quality_score: model.number().nullable(),

    // Metadata
    normalized_title: model.text().nullable(), // Semantic search optimized
    search_tags: model.json().nullable(),
    metadata: model.json().nullable(),
})

export default ProductExtension
