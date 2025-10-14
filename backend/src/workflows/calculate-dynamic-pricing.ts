/**
 * YSH B2B - Dynamic Pricing Calculation Workflow
 * Calculates prices based on distributor tier, volume, region, and rules
 */

import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
  transform
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

/**
 * Input for pricing calculation
 */
interface CalculatePricingInput {
  product_id: string
  distributor_code: string
  distributor_tier: string
  quantity: number
  region_code?: string
  customer_group_id?: string
  payment_method?: string
  currency_code?: string
}

/**
 * Pricing calculation result
 */
interface PricingResult {
  base_price: number
  tier_multiplier: number
  tier_adjusted_price: number
  volume_discount_percentage: number
  volume_discount_amount: number
  applied_rules: Array<{
    rule_code: string
    rule_name: string
    adjustment_value: number
    adjustment_type: string
  }>
  total_discount_percentage: number
  final_price: number
  price_per_unit: number
  currency_code: string
  inmetro_certified: boolean
  estimated_delivery_days: number
}

/**
 * Step 1: Load Product and Extension Data
 */
const loadProductDataStep = createStep(
  "load-product-data",
  async (input: CalculatePricingInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)
    const query = container.resolve("query")
    
    // Load base product
    const product = await productModuleService.retrieveProduct(input.product_id)
    
    // Load product extension with distributor-specific data
    const { data: productExtensions } = await query.graph({
      entity: "product_extension",
      fields: [
        "id",
        "product_id",
        "distributor_code",
        "ysh_sku",
        "base_price_brl",
        "bronze_price_brl",
        "silver_price_brl", 
        "gold_price_brl",
        "platinum_price_brl",
        "volume_tier_1_qty",
        "volume_tier_1_price",
        "volume_tier_2_qty",
        "volume_tier_2_price",
        "volume_tier_3_qty",
        "volume_tier_3_price",
        "inmetro_certified",
        "inmetro_kpi_score",
        "lead_time_days",
        "power_kwp"
      ],
      filters: {
        product_id: input.product_id,
        distributor_code: input.distributor_code
      }
    })
    
    const extension = productExtensions[0]
    
    if (!extension) {
      throw new Error(
        `Product extension not found for product ${input.product_id} ` +
        `and distributor ${input.distributor_code}`
      )
    }
    
    return new StepResponse({ product, extension })
  }
)

/**
 * Step 2: Calculate Tier-Based Price
 */
const calculateTierPriceStep = createStep(
  "calculate-tier-price",
  async (input: {
    extension: any
    tier: string
    base_price: number
  }) => {
    const { extension, tier, base_price } = input
    
    // Get tier-specific price or calculate multiplier
    const tierPrices: Record<string, number | null> = {
      bronze: extension.bronze_price_brl || base_price * 1.0,
      silver: extension.silver_price_brl || base_price * 0.95,
      gold: extension.gold_price_brl || base_price * 0.90,
      platinum: extension.platinum_price_brl || base_price * 0.85
    }
    
    const tierPrice = tierPrices[tier] || base_price
    const tierMultiplier = tierPrice / base_price
    
    return new StepResponse({
      tier_price: tierPrice,
      tier_multiplier: tierMultiplier
    })
  }
)

/**
 * Step 3: Calculate Volume Discount
 */
const calculateVolumeDiscountStep = createStep(
  "calculate-volume-discount",
  async (input: {
    extension: any
    quantity: number
    tier_price: number
  }) => {
    const { extension, quantity, tier_price } = input
    
    let volumeDiscount = 0
    let discountPercentage = 0
    
    // Determine volume tier and discount
    if (extension.volume_tier_3_qty && quantity >= extension.volume_tier_3_qty) {
      const discountPrice = extension.volume_tier_3_price || tier_price * 0.85
      discountPercentage = ((tier_price - discountPrice) / tier_price) * 100
      volumeDiscount = (tier_price - discountPrice) * quantity
    } else if (extension.volume_tier_2_qty && quantity >= extension.volume_tier_2_qty) {
      const discountPrice = extension.volume_tier_2_price || tier_price * 0.90
      discountPercentage = ((tier_price - discountPrice) / tier_price) * 100
      volumeDiscount = (tier_price - discountPrice) * quantity
    } else if (extension.volume_tier_1_qty && quantity >= extension.volume_tier_1_qty) {
      const discountPrice = extension.volume_tier_1_price || tier_price * 0.95
      discountPercentage = ((tier_price - discountPrice) / tier_price) * 100
      volumeDiscount = (tier_price - discountPrice) * quantity
    }
    
    return new StepResponse({
      volume_discount: volumeDiscount,
      volume_discount_percentage: discountPercentage
    })
  }
)

/**
 * Step 4: Apply Dynamic Pricing Rules
 */
const applyPricingRulesStep = createStep(
  "apply-pricing-rules",
  async (input: {
    calculationInput: CalculatePricingInput
    extension: any
    current_price: number
  }, { container }) => {
    const query = container.resolve("query")
    
    // Load active pricing rules that match conditions
    const { data: pricingRules } = await query.graph({
      entity: "pricing_rule",
      fields: [
        "id",
        "code",
        "name",
        "rule_type",
        "application_method",
        "value",
        "priority",
        "stackable"
      ],
      filters: {
        is_active: true,
        distributor_codes: {
          $contains: input.calculationInput.distributor_code
        }
      }
    })
    
    // Sort by priority (highest first)
    const sortedRules = pricingRules.sort((a, b) => b.priority - a.priority)
    
    let adjustedPrice = input.current_price
    const appliedRules: Array<any> = []
    let totalDiscountPercentage = 0
    
    for (const rule of sortedRules) {
      // Check if rule conditions are met
      const conditionsMet = checkRuleConditions(rule, {
        quantity: input.calculationInput.quantity,
        tier: input.calculationInput.distributor_tier,
        region: input.calculationInput.region_code,
        payment_method: input.calculationInput.payment_method,
        inmetro_certified: input.extension.inmetro_certified,
        inmetro_kpi_score: input.extension.inmetro_kpi_score
      })
      
      if (!conditionsMet) continue
      
      // Apply rule
      let adjustment = 0
      switch (rule.application_method) {
        case "percentage":
          adjustment = (adjustedPrice * rule.value) / 100
          adjustedPrice -= adjustment
          totalDiscountPercentage += rule.value
          break
        case "fixed_amount":
          adjustment = rule.value
          adjustedPrice -= adjustment
          totalDiscountPercentage += (adjustment / input.current_price) * 100
          break
        case "multiplier":
          const newPrice = adjustedPrice * rule.value
          adjustment = adjustedPrice - newPrice
          adjustedPrice = newPrice
          totalDiscountPercentage += ((1 - rule.value) * 100)
          break
        case "override":
          adjustment = adjustedPrice - rule.value
          adjustedPrice = rule.value
          totalDiscountPercentage = ((input.current_price - rule.value) / input.current_price) * 100
          break
      }
      
      appliedRules.push({
        rule_code: rule.code,
        rule_name: rule.name,
        adjustment_value: adjustment,
        adjustment_type: rule.application_method
      })
      
      // Stop if not stackable
      if (!rule.stackable) break
    }
    
    return new StepResponse({
      final_price: Math.max(adjustedPrice, 0), // Never negative
      applied_rules: appliedRules,
      total_discount_percentage: totalDiscountPercentage
    })
  }
)

/**
 * Helper: Check if pricing rule conditions are met
 */
function checkRuleConditions(rule: any, context: any): boolean {
  // Check quantity conditions
  if (rule.min_quantity && context.quantity < rule.min_quantity) return false
  if (rule.max_quantity && context.quantity > rule.max_quantity) return false
  
  // Check tier conditions
  if (rule.distributor_tiers && rule.distributor_tiers.length > 0) {
    if (!rule.distributor_tiers.includes(context.tier)) return false
  }
  
  // Check region conditions
  if (rule.region_codes && rule.region_codes.length > 0 && context.region) {
    if (!rule.region_codes.includes(context.region)) return false
  }
  
  // Check payment method
  if (rule.payment_methods && rule.payment_methods.length > 0 && context.payment_method) {
    if (!rule.payment_methods.includes(context.payment_method)) return false
  }
  
  // Check INMETRO requirements
  if (rule.requires_inmetro && !context.inmetro_certified) return false
  if (rule.inmetro_min_kpi_score && context.inmetro_kpi_score < rule.inmetro_min_kpi_score) {
    return false
  }
  
  // Check temporal conditions (simplified - would need date comparison)
  // TODO: Implement start_date, end_date, active_days, active_hours checks
  
  return true
}

/**
 * Step 5: Load Distributor Configuration
 */
const loadDistributorConfigStep = createStep(
  "load-distributor-config",
  async (distributor_code: string, { container }) => {
    const query = container.resolve("query")
    
    const { data: distributors } = await query.graph({
      entity: "distributor",
      fields: [
        "id",
        "code",
        "name",
        "tier",
        "pricing_multiplier",
        "default_lead_time_days",
        "inmetro_status",
        "avg_delivery_days"
      ],
      filters: {
        code: distributor_code,
        is_active: true
      }
    })
    
    const distributor = distributors[0]
    if (!distributor) {
      throw new Error(`Distributor not found: ${distributor_code}`)
    }
    
    return new StepResponse({ distributor })
  }
)

/**
 * Main Workflow: Calculate Dynamic Pricing
 */
export const calculateDynamicPricingWorkflow = createWorkflow(
  "calculate-dynamic-pricing",
  (input: CalculatePricingInput) => {
    // Step 1: Load product data
    const { product, extension } = loadProductDataStep(input)
    
    // Step 2: Calculate tier-based price
    const { tier_price, tier_multiplier } = calculateTierPriceStep({
      extension,
      tier: input.distributor_tier,
      base_price: extension.base_price_brl
    })
    
    // Step 3: Calculate volume discount
    const { volume_discount, volume_discount_percentage } = calculateVolumeDiscountStep({
      extension,
      quantity: input.quantity,
      tier_price
    })
    
    // Price after volume discount
    const price_after_volume = transform(
      { tier_price, quantity: input.quantity, volume_discount },
      (data) => {
        return (data.tier_price * data.quantity - data.volume_discount) / data.quantity
      }
    )
    
    // Step 4: Apply dynamic pricing rules
    const { final_price, applied_rules, total_discount_percentage } = applyPricingRulesStep({
      calculationInput: input,
      extension,
      current_price: price_after_volume
    })
    
    // Step 5: Load distributor config for delivery estimates
    const { distributor } = loadDistributorConfigStep(input.distributor_code)
    
    // Build final result
    const result = transform(
      {
        extension,
        tier_multiplier,
        tier_price,
        volume_discount,
        volume_discount_percentage,
        final_price,
        applied_rules,
        total_discount_percentage,
        distributor,
        quantity: input.quantity,
        currency: input.currency_code || "BRL"
      },
      (data): PricingResult => ({
        base_price: data.extension.base_price_brl,
        tier_multiplier: data.tier_multiplier,
        tier_adjusted_price: data.tier_price,
        volume_discount_percentage: data.volume_discount_percentage,
        volume_discount_amount: data.volume_discount,
        applied_rules: data.applied_rules,
        total_discount_percentage: data.total_discount_percentage,
        final_price: data.final_price * data.quantity,
        price_per_unit: data.final_price,
        currency_code: data.currency,
        inmetro_certified: data.extension.inmetro_certified,
        estimated_delivery_days: data.distributor.avg_delivery_days || data.extension.lead_time_days
      })
    )
    
    return new WorkflowResponse(result)
  }
)
