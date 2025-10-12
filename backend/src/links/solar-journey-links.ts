/**
 * ========================================
 * Solar Journey RemoteLinks - PLG Strategy 360°
 * ========================================
 * 
 * Este arquivo configura os links entre os módulos do Medusa para permitir
 * queries cross-module usando RemoteQuery.
 * 
 * Links configurados:
 * 1. SolarCalculationKit → Product (exposição de kits no catálogo)
 * 2. CreditAnalysis → SolarCalculation (análise de crédito baseada em cálculo)
 * 3. FinancingApplication → Order (aplicação vinculada a pedido)
 * 4. OrderFulfillment → Order (fulfillment vinculado a pedido)
 * 5. OrderShipment → OrderFulfillment (envios vinculados a fulfillment)
 * 
 * Estratégia PLG 360°:
 * - Stage 1: Calculation → Kits with Products (product_id exposure)
 * - Stage 2: Credit → Financing Offers (modality/rates exposure)
 * - Stage 3: Financing → Payment Schedule (360 installments transparency)
 * - Stage 4: Fulfillment → Product Tracking (real-time events)
 */

import { defineLink } from "@medusajs/framework/utils"
import { SolarCalculation } from "../entities/solar-calculation.entity"
import { SolarCalculationKit } from "../entities/solar-calculation-kit.entity"
import { CreditAnalysis } from "../entities/credit-analysis.entity"
import { FinancingOffer } from "../entities/financing-offer.entity"
import { FinancingApplication } from "../entities/financing-application.entity"
import { OrderFulfillment } from "../entities/order-fulfillment.entity"
import { OrderShipment } from "../entities/order-shipment.entity"
import { Modules } from "@medusajs/framework/utils"

/**
 * ========================================
 * Link 1: SolarCalculationKit → Product
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: [kit] } = await query.graph({
 *   entity: "solar_calculation_kit",
 *   fields: [
 *     "*",
 *     "product.id",
 *     "product.title",
 *     "product.thumbnail",
 *     "product.variants.*"
 *   ],
 *   filters: { id: kitId }
 * })
 * ```
 * 
 * PLG Impact: Expõe produtos do catálogo nas recomendações de kits
 */
export default defineLink(
    {
        linkable: SolarCalculationKit.linkable,
        field: "product_id",
        isList: false
    },
    {
        linkable: "Product", // Módulo core do Medusa
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Link 2: SolarCalculationKit → SolarCalculation
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: kits } = await query.graph({
 *   entity: "solar_calculation_kit",
 *   fields: [
 *     "*",
 *     "solar_calculation.id",
 *     "solar_calculation.potencia_instalada_kwp",
 *     "solar_calculation.investimento_total"
 *   ],
 *   filters: { solar_calculation_id: calculationId }
 * })
 * ```
 */
export const solarCalculationKitToCalculation = defineLink(
    {
        linkable: SolarCalculationKit.linkable,
        field: "solar_calculation_id",
        isList: false
    },
    {
        linkable: SolarCalculation.linkable,
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Link 3: CreditAnalysis → SolarCalculation
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: [analysis] } = await query.graph({
 *   entity: "credit_analysis",
 *   fields: [
 *     "*",
 *     "solar_calculation.id",
 *     "solar_calculation.investimento_total",
 *     "solar_calculation.payback_anos"
 *   ],
 *   filters: { id: analysisId }
 * })
 * ```
 * 
 * PLG Impact: Conecta análise de crédito com cálculo solar para contexto completo
 */
export const creditAnalysisToSolarCalculation = defineLink(
    {
        linkable: CreditAnalysis.linkable,
        field: "solar_calculation_id",
        isList: false
    },
    {
        linkable: SolarCalculation.linkable,
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Link 4: FinancingOffer → CreditAnalysis
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: offers } = await query.graph({
 *   entity: "financing_offer",
 *   fields: [
 *     "*",
 *     "credit_analysis.id",
 *     "credit_analysis.total_score",
 *     "credit_analysis.risk_level"
 *   ],
 *   filters: { credit_analysis_id: analysisId }
 * })
 * ```
 * 
 * PLG Impact: Lista ofertas de financiamento vinculadas à análise de crédito
 */
export const financingOfferToCreditAnalysis = defineLink(
    {
        linkable: FinancingOffer.linkable,
        field: "credit_analysis_id",
        isList: false
    },
    {
        linkable: CreditAnalysis.linkable,
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Link 5: FinancingApplication → CreditAnalysis
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: [application] } = await query.graph({
 *   entity: "financing_application",
 *   fields: [
 *     "*",
 *     "credit_analysis.id",
 *     "credit_analysis.total_score",
 *     "credit_analysis.offers.*"
 *   ],
 *   filters: { id: applicationId }
 * })
 * ```
 * 
 * PLG Impact: Conecta aplicação de financiamento com an��lise de crédito original
 */
export const financingApplicationToCreditAnalysis = defineLink(
    {
        linkable: FinancingApplication.linkable,
        field: "credit_analysis_id",
        isList: false
    },
    {
        linkable: CreditAnalysis.linkable,
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Link 6: FinancingApplication → Order
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: [application] } = await query.graph({
 *   entity: "financing_application",
 *   fields: [
 *     "*",
 *     "order.id",
 *     "order.status",
 *     "order.items.*",
 *     "order.fulfillments.*"
 *   ],
 *   filters: { id: applicationId }
 * })
 * ```
 * 
 * PLG Impact: Conecta financiamento com pedido para tracking completo
 */
export const financingApplicationToOrder = defineLink(
    {
        linkable: FinancingApplication.linkable,
        field: "order_id",
        isList: false
    },
    {
        linkable: "Order", // Módulo core do Medusa
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Link 7: OrderFulfillment → Order
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: [fulfillment] } = await query.graph({
 *   entity: "order_fulfillment",
 *   fields: [
 *     "*",
 *     "order.id",
 *     "order.status",
 *     "order.customer.id",
 *     "order.customer.email"
 *   ],
 *   filters: { order_id: orderId }
 * })
 * ```
 * 
 * PLG Impact: Conecta fulfillment com pedido para status completo
 */
export const orderFulfillmentToOrder = defineLink(
    {
        linkable: OrderFulfillment.linkable,
        field: "order_id",
        isList: false
    },
    {
        linkable: "Order", // Módulo core do Medusa
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Link 8: OrderShipment → OrderFulfillment
 * ========================================
 * 
 * Permite queries como:
 * ```typescript
 * const { data: shipments } = await query.graph({
 *   entity: "order_shipment",
 *   fields: [
 *     "*",
 *     "fulfillment.id",
 *     "fulfillment.status",
 *     "fulfillment.picked_items"
 *   ],
 *   filters: { fulfillment_id: fulfillmentId }
 * })
 * ```
 * 
 * PLG Impact: Lista envios com tracking events para transparency total
 */
export const orderShipmentToOrderFulfillment = defineLink(
    {
        linkable: OrderShipment.linkable,
        field: "fulfillment_id",
        isList: false
    },
    {
        linkable: OrderFulfillment.linkable,
        field: "id",
        isList: false
    }
)

/**
 * ========================================
 * Query Examples - PLG Strategy 360°
 * ========================================
 * 
 * 1. Solar Calculation with Kits and Products:
 * ```typescript
 * const { data: [calculation] } = await query.graph({
 *   entity: "solar_calculation",
 *   fields: [
 *     "*",
 *     "kits.*",
 *     "kits.product.id",
 *     "kits.product.title",
 *     "kits.product.thumbnail",
 *     "kits.product.variants.*"
 *   ],
 *   filters: { id: calculationId }
 * })
 * // PLG: Customer sees 5 kits with products immediately after calculation
 * ```
 * 
 * 2. Credit Analysis with Financing Offers and Solar Context:
 * ```typescript
 * const { data: [analysis] } = await query.graph({
 *   entity: "credit_analysis",
 *   fields: [
 *     "*",
 *     "offers.*",
 *     "solar_calculation.investimento_total",
 *     "solar_calculation.payback_anos"
 *   ],
 *   filters: { id: analysisId }
 * })
 * // PLG: Customer sees 3 financing options with solar investment context
 * ```
 * 
 * 3. Financing Application with Complete Payment Schedule and Order:
 * ```typescript
 * const { data: [application] } = await query.graph({
 *   entity: "financing_application",
 *   fields: [
 *     "*",
 *     "credit_analysis.total_score",
 *     "order.id",
 *     "order.status",
 *     "order.fulfillments.*"
 *   ],
 *   filters: { id: applicationId }
 * })
 * // PLG: Customer sees payment_schedule (360 installments) + order status
 * ```
 * 
 * 4. Order with Fulfillment, Shipments, and Products:
 * ```typescript
 * const { data: [order] } = await query.graph({
 *   entity: "order",
 *   fields: [
 *     "*",
 *     "items.*",
 *     "items.product.title",
 *     "items.product.thumbnail",
 *     "fulfillments.*",
 *     "fulfillments.shipments.*",
 *     "fulfillments.shipments.tracking_events"
 *   ],
 *   filters: { id: orderId }
 * })
 * // PLG: Customer sees products + fulfillment status + real-time tracking
 * ```
 * 
 * ========================================
 * Complete PLG Journey Query (Cross-Module):
 * ========================================
 * ```typescript
 * // Query from FinancingApplication to get EVERYTHING:
 * const { data: [journey] } = await query.graph({
 *   entity: "financing_application",
 *   fields: [
 *     "*",
 *     // Credit Analysis
 *     "credit_analysis.id",
 *     "credit_analysis.total_score",
 *     "credit_analysis.risk_level",
 *     "credit_analysis.offers.*",
 *     // Solar Calculation
 *     "credit_analysis.solar_calculation.id",
 *     "credit_analysis.solar_calculation.potencia_instalada_kwp",
 *     "credit_analysis.solar_calculation.investimento_total",
 *     "credit_analysis.solar_calculation.kits.*",
 *     "credit_analysis.solar_calculation.kits.product.title",
 *     // Order & Fulfillment
 *     "order.id",
 *     "order.status",
 *     "order.items.*",
 *     "order.fulfillments.*",
 *     "order.fulfillments.shipments.*",
 *     "order.fulfillments.shipments.tracking_events"
 *   ],
 *   filters: { id: applicationId }
 * })
 * 
 * // Response includes:
 * // - 360 installments in payment_schedule
 * // - 3 financing offers with rates
 * // - Solar calculation with 5 kits
 * // - Product details for each kit
 * // - Order status
 * // - Fulfillment with picked_items
 * // - Shipment with tracking_events
 * 
 * // ✅ COMPLETE 360° PLG COVERAGE IN A SINGLE QUERY!
 * ```
 */
