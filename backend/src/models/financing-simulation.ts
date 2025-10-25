import { model } from "@medusajs/framework/utils"

/**
 * FinancingSimulation Model
 * 
 * PURPOSE:
 * Salva simulações de financiamento para histórico do cliente e retomada posterior.
 * Cliente pode sair do site e voltar depois para continuar de onde parou.
 * 
 * BUSINESS IMPACT:
 * - Melhor UX (cliente não precisa refazer simulação)
 * - +10-15% conversão (reduz abandono no funil)
 * - Remarketing personalizado (sabe exatamente o que cliente quer)
 * - Análise de viabilidade (quais condições são mais populares)
 * 
 * EXAMPLE:
 * ```typescript
 * // Cliente simula financiamento
 * const simulation = financingRepository.create({
 *   customer_id: 'cus_123',
 *   system_cost: 35000,
 *   down_payment: 5000,
 *   financing_amount: 30000,
 *   term_months: 120,
 *   interest_rate_annual: 12.5,
 *   monthly_payment: 431.77,
 *   total_paid: 51812.40,
 *   bank: 'Banco Solar',
 *   product: 'Financiamento Solar Residencial',
 *   was_approved: true
 * })
 * 
 * // 2 dias depois cliente volta
 * const lastSim = await financingRepository.findOne({ 
 *   customer_id: 'cus_123' 
 * }, { 
 *   orderBy: { created_at: 'DESC' } 
 * })
 * // Mostra condições salvas para cliente decidir
 * ```
 */
export const FinancingSimulation = model.define("financing_simulation", {
    id: model.id({ prefix: "fin_sim" }).primaryKey(),

    // ===========================
    // IDENTIFICAÇÃO
    // ===========================

    customer_id: model.text().nullable(),
    session_id: model.text(),
    quote_id: model.text().nullable(),
    solar_calculation_id: model.text().nullable(),

    // ===========================
    // ENTRADA (CUSTOS)
    // ===========================

    system_cost: model.bigNumber(),          // Custo total do sistema (R$)
    down_payment: model.bigNumber(),         // Entrada (R$)
    financing_amount: model.bigNumber(),     // Valor a financiar (R$)
    term_months: model.number(),             // Prazo (meses): 12, 24, 36, 60, 84, 120

    // ===========================
    // CONDIÇÕES
    // ===========================

    interest_rate_annual: model.bigNumber(),  // Taxa anual (%)
    interest_rate_monthly: model.bigNumber(), // Taxa mensal (%)
    monthly_payment: model.bigNumber(),       // Parcela mensal (R$)
    total_interest: model.bigNumber(),        // Juros totais (R$)
    total_paid: model.bigNumber(),            // Total pago (R$)
    cet_annual: model.bigNumber().nullable(), // CET anual (%)

    // ===========================
    // INSTITUIÇÃO
    // ===========================

    bank: model.text(),                       // Banco: 'BV', 'Santander', 'Banco Solar', 'Itaú', etc.
    product: model.text(),                    // Produto: 'CDC Solar', 'Financiamento Renovável', etc.
    bank_url: model.text().nullable(),        // URL para aplicação
    bank_requirements: model.json().nullable(),// Documentos necessários

    // ===========================
    // ANÁLISE DE CRÉDITO
    // ===========================

    submitted_to_bank: model.boolean().default(false),
    submission_date: model.dateTime().nullable(),
    status: model.enum(['pending', 'analyzing', 'approved', 'rejected', 'expired', 'cancelled']).nullable(),
    was_approved: model.boolean().nullable(),
    rejection_reason: model.text().nullable(),
    approved_amount: model.bigNumber().nullable(),
    approved_term_months: model.number().nullable(),
    approved_rate_annual: model.bigNumber().nullable(),
    approved_monthly_payment: model.bigNumber().nullable(),

    // ===========================
    // CONVERSÃO
    // ===========================

    accepted_by_customer: model.boolean().default(false),
    acceptance_date: model.dateTime().nullable(),
    contract_id: model.text().nullable(),
    contract_url: model.text().nullable(),
    order_id: model.text().nullable(),

    // ===========================
    // COMPARAÇÃO
    // ===========================

    alternative_simulations: model.json().nullable(), // Outras simulações comparadas
    chosen_reason: model.text().nullable(),

    // ===========================
    // ECONOMIA PROJETADA
    // ===========================

    monthly_energy_savings: model.bigNumber().nullable(),
    payback_months: model.bigNumber().nullable(),
    roi_percentage: model.bigNumber().nullable(),
    roi_explanation: model.text().nullable(),

    // ===========================
    // CONTEXTO
    // ===========================

    user_context: model.json().nullable(),
    page_url: model.text().nullable(),
    ip_hash: model.text().nullable(),
    user_agent: model.text().nullable(),

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
    expires_at: model.dateTime().nullable(),
})

export default FinancingSimulation

/**
 * USAGE GUIDE:
 * 
 * 1. SAVE SIMULATION:
 * ```typescript
 * POST /store/financing/simulate
 * {
 *   system_cost: 35000,
 *   down_payment: 5000,
 *   term_months: 120,
 *   bank: 'BV'
 * }
 * // Save to database
 * ```
 * 
 * 2. GET CUSTOMER HISTORY:
 * ```typescript
 * GET /store/financing/history/:customer_id
 * // Returns all simulations ordered by created_at DESC
 * ```
 * 
 * 3. COMPARE BANKS:
 * ```typescript
 * POST /store/financing/compare
 * {
 *   system_cost: 35000,
 *   down_payment: 5000,
 *   term_months: 120
 * }
 * // Returns best rates from all banks
 * // Saves to alternative_simulations field
 * ```
 * 
 * 4. SUBMIT TO BANK:
 * ```typescript
 * POST /store/financing/:id/submit
 * // Updates: submitted_to_bank = true, status = 'analyzing'
 * ```
 * 
 * 5. ANALYTICS:
 * ```sql
 * -- Banco mais popular
 * SELECT bank, COUNT(*) FROM financing_simulation GROUP BY bank;
 * 
 * -- Taxa média aceita
 * SELECT AVG(interest_rate_annual) FROM financing_simulation WHERE was_approved = true;
 * 
 * -- Prazo mais escolhido
 * SELECT term_months, COUNT(*) FROM financing_simulation GROUP BY term_months;
 * ```
 */
