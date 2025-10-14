/**
 * YSH B2B - Distributor Data Model
 * Extends Medusa.js with multi-distributor support
 * Implements tier-based pricing and INMETRO certification tracking
 */

import { model } from "@medusajs/framework/utils"

/**
 * Distributor Tier Levels
 * Determines pricing multipliers and access to products
 */
export enum DistributorTier {
  BRONZE = "bronze",
  SILVER = "silver", 
  GOLD = "gold",
  PLATINUM = "platinum"
}

/**
 * INMETRO Certification Status
 * Tracks compliance with Brazilian standards
 */
export enum InmetroStatus {
  CERTIFIED = "certified",
  PENDING = "pending",
  EXPIRED = "expired",
  NOT_REQUIRED = "not_required"
}

/**
 * Distributor Model
 * Represents a solar equipment distributor in the B2B platform
 */
const Distributor = model.define("distributor", {
  id: model.id().primaryKey(),
  
  // Basic Information
  code: model.text().unique(), // FLV, NEO, FTS
  name: model.text(),
  legal_name: model.text().nullable(),
  cnpj: model.text().nullable(),
  
  // Tier & Pricing Configuration
  tier: model.enum(DistributorTier).default(DistributorTier.BRONZE),
  pricing_multiplier: model.number().default(1.0), // Base multiplier for tier
  volume_discount_enabled: model.boolean().default(true),
  min_order_value: model.number().nullable(), // Minimum order in BRL
  
  // INMETRO Certification Tracking
  inmetro_status: model.enum(InmetroStatus).default(InmetroStatus.NOT_REQUIRED),
  inmetro_certificate_number: model.text().nullable(),
  inmetro_expiry_date: model.dateTime().nullable(),
  inmetro_kpi_score: model.number().nullable(), // 0-100 compliance score
  
  // Sales Channel Integration
  sales_channel_id: model.text().nullable(), // Link to Medusa Sales Channel
  
  // Business Rules
  allow_backorder: model.boolean().default(false),
  default_lead_time_days: model.number().default(7),
  shipping_regions: model.json().nullable(), // Array of region codes
  
  // Contact & Location
  contact_email: model.text().nullable(),
  contact_phone: model.text().nullable(),
  warehouse_address: model.json().nullable(),
  
  // Performance Metrics
  avg_delivery_days: model.number().nullable(),
  fulfillment_rate: model.number().nullable(), // Percentage 0-100
  return_rate: model.number().nullable(),
  customer_satisfaction_score: model.number().nullable(),
  
  // Status
  is_active: model.boolean().default(true),
  verified_at: model.dateTime().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

export default Distributor
