import { model } from "@medusajs/framework/utils"

/**
 * SolarViabilityAnalysis Model
 * 
 * PURPOSE:
 * Salva análises de viabilidade solar completas incluindo análise técnica,
 * econômica, e recomendações. Cliente pode revisar depois.
 * 
 * BUSINESS IMPACT:
 * - Melhor UX (cliente pode comparar análises)
 * - Remarketing (sabe exatamente interesse do cliente)
 * - Auditoria (rastreabilidade completa)
 * - Análise de mercado (quais perfis são viáveis)
 * 
 * DIFFERENCE vs SolarCalculation:
 * - SolarCalculation: Cálculo técnico simples (kWp, painéis, área)
 * - SolarViabilityAnalysis: Análise COMPLETA (técnica + econômica + ROI + recomendação)
 * 
 * EXAMPLE:
 * ```typescript
 * const analysis = viabilityRepository.create({
 *   customer_id: 'cus_123',
 *   monthly_consumption_kwh: 500,
 *   monthly_bill_brl: 450,
 *   system_size_kwp: 4.5,
 *   total_investment: 35000,
 *   payback_months: 48,
 *   roi_25_years_percentage: 450,
 *   is_viable: true,
 *   viability_score: 85,
 *   recommendation: 'highly_recommended'
 * })
 * ```
 */
export const SolarViabilityAnalysis = model.define("solar_viability_analysis", {
    id: model.id({ prefix: "viability" }).primaryKey(),

    // ===========================
    // IDENTIFICAÇÃO
    // ===========================

    customer_id: model.text().nullable(),
    session_id: model.text(),
    quote_id: model.text().nullable(),
    solar_calculation_id: model.text().nullable(),

    // ===========================
    // INPUT (CONSUMO)
    // ===========================

    monthly_consumption_kwh: model.bigNumber(),
    monthly_bill_brl: model.bigNumber(),
    tariff_kwh_brl: model.bigNumber(),
    utility_company: model.text(),
    state: model.text().nullable(),
    city: model.text().nullable(),

    // ===========================
    // SYSTEM SIZING
    // ===========================

    system_size_kwp: model.bigNumber(),
    panel_count: model.number(),
    panel_wattage: model.bigNumber(),
    roof_area_needed_m2: model.bigNumber(),
    annual_generation_kwh: model.bigNumber(),
    capacity_factor: model.bigNumber(),

    // ===========================
    // INVESTIMENTO
    // ===========================

    equipment_cost: model.bigNumber(),
    installation_cost: model.bigNumber(),
    project_cost: model.bigNumber(),
    total_investment: model.bigNumber(),
    cost_per_kwp: model.bigNumber(),

    // ===========================
    // ECONOMIA E ROI
    // ===========================

    monthly_savings_brl: model.bigNumber(),
    annual_savings_brl: model.bigNumber(),
    payback_months: model.bigNumber(),
    payback_years: model.bigNumber(),
    roi_25_years_percentage: model.bigNumber(),
    total_savings_25_years: model.bigNumber(),
    irr_percentage: model.bigNumber(),
    npv_brl: model.bigNumber(),

    // ===========================
    // ANÁLISE DE VIABILIDADE
    // ===========================

    is_viable: model.boolean(),
    viability_score: model.number(),
    recommendation: model.enum(['highly_recommended', 'recommended', 'marginal', 'not_recommended']),
    viability_factors: model.json().nullable(),
    recommendation_reason: model.text().nullable(),

    // ===========================
    // RISCOS E OPORTUNIDADES
    // ===========================

    risks: model.json().nullable(),
    opportunities: model.json().nullable(),

    // ===========================
    // PREMISSAS
    // ===========================

    assumptions: model.json().nullable(),

    // ===========================
    // ALTERNATIVAS
    // ===========================

    alternative_scenarios: model.json().nullable(),

    // ===========================
    // FINANCIAMENTO
    // ===========================

    financing_suggested: model.boolean().default(false),
    financing_options: model.json().nullable(),

    // ===========================
    // PRÓXIMOS PASSOS
    // ===========================

    next_steps: model.json().nullable(),
    requested_quote: model.boolean().default(false),
    quote_requested_at: model.dateTime().nullable(),

    // ===========================
    // CONTEXTO
    // ===========================

    page_url: model.text().nullable(),
    ip_hash: model.text().nullable(),
    user_agent: model.text().nullable(),
    device_type: model.text().nullable(),

    // ===========================
    // QUALIDADE
    // ===========================

    confidence_score: model.bigNumber().nullable(),
    data_sources: model.json().nullable(),
    validated_by_engineer: model.boolean().default(false),
    validator_id: model.text().nullable(),
    validation_notes: model.text().nullable(),

    // ===========================
    // STATUS
    // ===========================

    status: model.enum(['draft', 'completed', 'sent_to_customer', 'accepted', 'rejected', 'expired']).default('draft'),
    sent_at: model.dateTime().nullable(),
    accepted_at: model.dateTime().nullable(),
    expires_at: model.dateTime().nullable(),

    // ===========================
    // METADATA
    // ===========================

    source: model.enum(['web', 'app', 'admin', 'api']).default('web'),
    notes: model.text().nullable(),
    tags: model.json().nullable(),

    // ===========================
    // TIMESTAMPS
    // ===========================

    created_at: model.dateTime(),
    updated_at: model.dateTime(),
})

export default SolarViabilityAnalysis

/**
 * USAGE GUIDE:
 * 
 * 1. CREATE ANALYSIS:
 * ```typescript
 * POST /store/solar/analyze-viability
 * {
 *   monthly_consumption_kwh: 500,
 *   monthly_bill_brl: 450,
 *   state: 'SP',
 *   city: 'São Paulo'
 * }
 * // Returns complete viability analysis
 * ```
 * 
 * 2. GET CUSTOMER ANALYSES:
 * ```typescript
 * GET /store/solar/viability-history/:customer_id
 * // Returns all analyses with comparison
 * ```
 * 
 * 3. COMPARE SCENARIOS:
 * ```typescript
 * GET /store/solar/viability/:id/alternatives
 * // Returns alternative_scenarios field
 * ```
 * 
 * 4. ANALYTICS:
 * ```sql
 * -- Viabilidade por região
 * SELECT state, AVG(viability_score) FROM solar_viability_analysis GROUP BY state;
 * 
 * -- Payback médio
 * SELECT AVG(payback_months) FROM solar_viability_analysis WHERE is_viable = true;
 * 
 * -- Taxa de conversão
 * SELECT COUNT(*) FILTER (WHERE requested_quote = true) * 100.0 / COUNT(*) 
 * FROM solar_viability_analysis;
 * ```
 */
