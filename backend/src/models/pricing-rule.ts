/**
 * YSH B2B - Pricing Rule Model
 * Extends Medusa.js Pricing Module with dynamic rules
 * Supports multi-distributor, tier-based, volume, and region-based pricing
 */

import { model } from "@medusajs/framework/utils"

/**
 * Rule Type - Determines how the pricing rule is applied
 */
export enum PricingRuleType {
  DISTRIBUTOR_TIER = "distributor_tier", // Based on distributor tier level
  VOLUME_DISCOUNT = "volume_discount", // Quantity-based discounts
  REGION_ADJUSTMENT = "region_adjustment", // Regional price variations
  SEASONAL_PROMOTION = "seasonal_promotion", // Time-based promotions
  CUSTOMER_GROUP = "customer_group", // B2B customer segments
  INMETRO_CERTIFIED = "inmetro_certified", // Premium for certified products
  PAYMENT_METHOD = "payment_method", // Cash discount, installments
  FIRST_ORDER = "first_order" // New customer incentive
}

/**
 * Rule Application Method
 */
export enum RuleApplicationMethod {
  PERCENTAGE = "percentage", // Discount/markup as percentage
  FIXED_AMOUNT = "fixed_amount", // Fixed BRL amount
  MULTIPLIER = "multiplier", // Direct multiplier (e.g., 1.15 = 15% markup)
  OVERRIDE = "override" // Replace base price entirely
}

/**
 * Pricing Rule Model
 * Defines conditional pricing logic for products
 */
const PricingRule = model.define("pricing_rule", {
  id: model.id().primaryKey(),
  
  // Rule Identification
  name: model.text(),
  description: model.text().nullable(),
  code: model.text().unique(), // E.g., "FLV-GOLD-VOL50"
  
  // Rule Type & Application
  rule_type: model.enum(PricingRuleType),
  application_method: model.enum(RuleApplicationMethod),
  value: model.number(), // The adjustment value (%, BRL, or multiplier)
  
  // Conditions - Distributor
  distributor_codes: model.json().nullable(), // Array: ["FLV", "NEO"]
  distributor_tiers: model.json().nullable(), // Array: ["gold", "platinum"]
  
  // Conditions - Product
  product_ids: model.json().nullable(), // Specific products
  product_tags: model.json().nullable(), // E.g., ["solar-kit", "inverter"]
  product_categories: model.json().nullable(),
  sku_patterns: model.json().nullable(), // Regex patterns for SKUs
  
  // Conditions - Volume/Quantity
  min_quantity: model.number().nullable(),
  max_quantity: model.number().nullable(),
  min_order_value: model.number().nullable(), // In BRL
  
  // Conditions - Geographic
  region_codes: model.json().nullable(), // ISO region codes
  country_codes: model.json().nullable(),
  state_codes: model.json().nullable(), // Brazilian states: SP, RJ, MG
  
  // Conditions - Temporal
  start_date: model.dateTime().nullable(),
  end_date: model.dateTime().nullable(),
  active_days: model.json().nullable(), // [1,2,3,4,5] = Mon-Fri
  active_hours: model.json().nullable(), // [[9,18]] = 9am-6pm
  
  // Conditions - Customer
  customer_group_ids: model.json().nullable(),
  new_customer_only: model.boolean().default(false),
  
  // Conditions - INMETRO Certification
  requires_inmetro: model.boolean().default(false),
  inmetro_min_kpi_score: model.number().nullable(), // Minimum 0-100
  
  // Conditions - Payment
  payment_methods: model.json().nullable(), // ["pix", "boleto", "card"]
  installment_count: model.number().nullable(),
  
  // Priority & Stacking
  priority: model.number().default(0), // Higher = applied first
  stackable: model.boolean().default(true), // Can combine with other rules
  max_discount_cap: model.number().nullable(), // Maximum total discount %
  
  // Status & Limits
  is_active: model.boolean().default(true),
  usage_limit: model.number().nullable(), // Total times rule can be used
  usage_count: model.number().default(0),
  per_customer_limit: model.number().nullable(),
  
  // Metadata
  created_by: model.text().nullable(), // Admin user ID
  metadata: model.json().nullable(),
})

export default PricingRule
