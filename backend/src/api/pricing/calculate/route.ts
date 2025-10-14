/**
 * YSH B2B - Dynamic Pricing API Routes
 * Exposes pricing calculation endpoints with multi-distributor support
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { calculateDynamicPricingWorkflow } from "../../../workflows/calculate-dynamic-pricing"

/**
 * POST /api/pricing/calculate
 * Calculate price for a product with specific context
 */
export async function POST(
  req: MedusaRequest<{
    product_id: string
    distributor_code: string
    distributor_tier?: string
    quantity?: number
    region_code?: string
    customer_group_id?: string
    payment_method?: string
    currency_code?: string
  }>,
  res: MedusaResponse
) {
  const {
    product_id,
    distributor_code,
    distributor_tier = "bronze",
    quantity = 1,
    region_code,
    customer_group_id,
    payment_method,
    currency_code = "BRL"
  } = req.body
  
  // Validate required fields
  if (!product_id || !distributor_code) {
    return res.status(400).json({
      error: "Missing required fields: product_id, distributor_code"
    })
  }
  
  try {
    // Execute pricing workflow
    const { result } = await calculateDynamicPricingWorkflow(req.scope).run({
      input: {
        product_id,
        distributor_code,
        distributor_tier,
        quantity,
        region_code,
        customer_group_id,
        payment_method,
        currency_code
      }
    })
    
    return res.json({
      pricing: result,
      calculation_timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("Pricing calculation error:", error)
    return res.status(500).json({
      error: "Failed to calculate pricing",
      message: error.message
    })
  }
}

/**
 * POST /api/pricing/batch-calculate
 * Calculate prices for multiple products at once
 */
export async function POST_BATCH(
  req: MedusaRequest<{
    items: Array<{
      product_id: string
      quantity: number
    }>
    distributor_code: string
    distributor_tier?: string
    region_code?: string
  }>,
  res: MedusaResponse
) {
  const {
    items,
    distributor_code,
    distributor_tier = "bronze",
    region_code
  } = req.body
  
  if (!items || items.length === 0 || !distributor_code) {
    return res.status(400).json({
      error: "Missing required fields: items, distributor_code"
    })
  }
  
  try {
    // Calculate pricing for each item
    const calculations = await Promise.all(
      items.map(async (item) => {
        const { result } = await calculateDynamicPricingWorkflow(req.scope).run({
          input: {
            product_id: item.product_id,
            distributor_code,
            distributor_tier,
            quantity: item.quantity,
            region_code
          }
        })
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          pricing: result
        }
      })
    )
    
    // Calculate totals
    const summary = {
      total_items: calculations.length,
      total_quantity: calculations.reduce((sum, calc) => sum + calc.quantity, 0),
      subtotal: calculations.reduce((sum, calc) => sum + calc.pricing.final_price, 0),
      total_savings: calculations.reduce(
        (sum, calc) => sum + (calc.pricing.base_price * calc.quantity - calc.pricing.final_price),
        0
      ),
      average_discount_percentage: calculations.reduce(
        (sum, calc) => sum + calc.pricing.total_discount_percentage,
        0
      ) / calculations.length
    }
    
    return res.json({
      calculations,
      summary,
      currency: "BRL",
      calculation_timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("Batch pricing calculation error:", error)
    return res.status(500).json({
      error: "Failed to calculate batch pricing",
      message: error.message
    })
  }
}
