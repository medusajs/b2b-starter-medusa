/**
 * YSH B2B - Distributor Pricing Rules API
 * Manage pricing rules per distributor and tier
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /api/distributors/:code/pricing-rules
 * Get all active pricing rules for a distributor
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { code } = req.params
  const { tier, rule_type } = req.query
  
  const query = req.scope.resolve("query")
  
  try {
    const filters: any = {
      is_active: true,
      distributor_codes: {
        $contains: code
      }
    }
    
    // Optional filters
    if (tier) {
      filters.distributor_tiers = {
        $contains: tier
      }
    }
    
    if (rule_type) {
      filters.rule_type = rule_type
    }
    
    const { data: rules } = await query.graph({
      entity: "pricing_rule",
      fields: [
        "id",
        "code",
        "name",
        "description",
        "rule_type",
        "application_method",
        "value",
        "distributor_codes",
        "distributor_tiers",
        "min_quantity",
        "max_quantity",
        "priority",
        "stackable",
        "start_date",
        "end_date"
      ],
      filters
    })
    
    // Group rules by type
    const groupedRules = rules.reduce((acc: any, rule: any) => {
      if (!acc[rule.rule_type]) {
        acc[rule.rule_type] = []
      }
      acc[rule.rule_type].push(rule)
      return acc
    }, {})
    
    return res.json({
      distributor_code: code,
      tier: tier || "all",
      rules: groupedRules,
      total_rules: rules.length
    })
  } catch (error: any) {
    console.error("Error fetching pricing rules:", error)
    return res.status(500).json({
      error: "Failed to fetch pricing rules",
      message: error.message
    })
  }
}

/**
 * POST /api/distributors/:code/pricing-rules
 * Create a new pricing rule for a distributor
 */
export async function POST(
  req: MedusaRequest<{
    name: string
    code: string
    rule_type: string
    application_method: string
    value: number
    distributor_tiers?: string[]
    min_quantity?: number
    max_quantity?: number
    priority?: number
    stackable?: boolean
    start_date?: string
    end_date?: string
  }>,
  res: MedusaResponse
) {
  const { code: distributorCode } = req.params
  const ruleData = req.body
  
  const query = req.scope.resolve("query")
  
  try {
    // Validate distributor exists
    const { data: distributors } = await query.graph({
      entity: "distributor",
      fields: ["id", "code"],
      filters: { code: distributorCode }
    })
    
    if (distributors.length === 0) {
      return res.status(404).json({
        error: `Distributor not found: ${distributorCode}`
      })
    }
    
    // Create pricing rule
    const { data: createdRule } = await query.graph({
      entity: "pricing_rule",
      fields: ["id", "code", "name", "rule_type"],
      data: {
        ...ruleData,
        distributor_codes: [distributorCode],
        is_active: true,
        usage_count: 0
      }
    })
    
    return res.status(201).json({
      rule: createdRule,
      message: `Pricing rule created successfully for ${distributorCode}`
    })
  } catch (error: any) {
    console.error("Error creating pricing rule:", error)
    return res.status(500).json({
      error: "Failed to create pricing rule",
      message: error.message
    })
  }
}

/**
 * GET /api/distributors/:code/tiers
 * Get tier configuration and benefits for a distributor
 */
export async function GET_TIERS(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { code } = req.params
  const query = req.scope.resolve("query")
  
  try {
    // Get distributor info
    const { data: distributors } = await query.graph({
      entity: "distributor",
      fields: [
        "id",
        "code",
        "name",
        "tier",
        "pricing_multiplier",
        "volume_discount_enabled",
        "min_order_value"
      ],
      filters: { code }
    })
    
    if (distributors.length === 0) {
      return res.status(404).json({
        error: `Distributor not found: ${code}`
      })
    }
    
    const distributor = distributors[0]
    
    // Define tier benefits
    const tierBenefits = {
      bronze: {
        level: 1,
        discount: "0%",
        multiplier: 1.0,
        min_order: 5000,
        volume_discount: false,
        payment_terms: "Pagamento à vista",
        support: "Email support",
        priority_shipping: false
      },
      silver: {
        level: 2,
        discount: "5%",
        multiplier: 0.95,
        min_order: 3000,
        volume_discount: true,
        payment_terms: "7 dias",
        support: "Email + Phone support",
        priority_shipping: false
      },
      gold: {
        level: 3,
        discount: "10%",
        multiplier: 0.90,
        min_order: 2000,
        volume_discount: true,
        payment_terms: "15 dias",
        support: "Priority support 24/7",
        priority_shipping: true
      },
      platinum: {
        level: 4,
        discount: "15%",
        multiplier: 0.85,
        min_order: 1000,
        volume_discount: true,
        payment_terms: "30 dias",
        support: "Dedicated account manager",
        priority_shipping: true
      }
    }
    
    return res.json({
      distributor: {
        code: distributor.code,
        name: distributor.name,
        current_tier: distributor.tier
      },
      tier_benefits: tierBenefits,
      current_tier_details: tierBenefits[distributor.tier as keyof typeof tierBenefits]
    })
  } catch (error: any) {
    console.error("Error fetching tier info:", error)
    return res.status(500).json({
      error: "Failed to fetch tier information",
      message: error.message
    })
  }
}

/**
 * GET /api/distributors/:code/stats
 * Get pricing statistics for a distributor
 */
export async function GET_STATS(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { code } = req.params
  const query = req.scope.resolve("query")
  
  try {
    // Get distributor
    const { data: distributors } = await query.graph({
      entity: "distributor",
      fields: [
        "id",
        "code",
        "name",
        "tier",
        "inmetro_status",
        "inmetro_kpi_score",
        "avg_delivery_days",
        "fulfillment_rate"
      ],
      filters: { code, is_active: true }
    })
    
    if (distributors.length === 0) {
      return res.status(404).json({
        error: `Distributor not found: ${code}`
      })
    }
    
    const distributor = distributors[0]
    
    // Get products count
    const { data: products } = await query.graph({
      entity: "product_extension",
      fields: ["id", "inmetro_certified"],
      filters: { distributor_code: code }
    })
    
    const stats = {
      distributor: {
        code: distributor.code,
        name: distributor.name,
        tier: distributor.tier
      },
      products: {
        total: products.length,
        inmetro_certified: products.filter((p: any) => p.inmetro_certified).length,
        certification_rate: products.length > 0 
          ? (products.filter((p: any) => p.inmetro_certified).length / products.length * 100).toFixed(2) + '%'
          : '0%'
      },
      performance: {
        inmetro_kpi_score: distributor.inmetro_kpi_score || 0,
        avg_delivery_days: distributor.avg_delivery_days || 0,
        fulfillment_rate: distributor.fulfillment_rate || 0
      },
      certification: {
        status: distributor.inmetro_status,
        compliance_score: distributor.inmetro_kpi_score
      }
    }
    
    return res.json(stats)
  } catch (error: any) {
    console.error("Error fetching distributor stats:", error)
    return res.status(500).json({
      error: "Failed to fetch distributor statistics",
      message: error.message
    })
  }
}
