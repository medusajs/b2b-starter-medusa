/**
 * Finance Module - Type Definitions
 * 
 * Agent: finance.credit
 * Mission: Simulate financing options and calculate ROI for solar installations
 * 
 * Inputs: CAPEX breakdown, interest rates, tariff savings, generation data
 * Outputs: TIR, VPL, Payback, Installments, PDF proposals
 * 
 * Integrations:
 * - Receives investment data from viability.pv
 * - Receives monthly savings from tariffs.aneel
 * - Provides financing options to cart and quotes
 */

// ============================================================================
// Core Finance Types
// ============================================================================

/**
 * Oversizing scenarios allowed by ANEEL regulations
 */
export type OversizingScenario = 114 | 130 | 145 | 160

/**
 * Financing modality types
 */
export type FinancingModality = 'CDC' | 'LEASING' | 'EAAS' | 'CASH'

/**
 * CAPEX breakdown for solar installation
 */
export interface CAPEXBreakdown {
    /** Solar kit (modules + inverters + structure) */
    kit: number

    /** Labor costs */
    labor: number

    /** Technical documentation (ART/TRT) */
    technical_docs: number

    /** Utility company homologation fees */
    homologation: number

    /** Shipping and logistics */
    shipping: number

    /** Project documentation */
    project_docs: number

    /** Total CAPEX */
    total: number
}

/**
 * Finance input data
 */
export interface FinanceInput {
    /** Unique calculation ID */
    id: string

    /** CAPEX breakdown */
    capex: CAPEXBreakdown

    /** System capacity in kWp */
    system_kwp: number

    /** Potência do sistema em kWp (alias para compatibilidade) */
    potencia_kwp?: number

    /** Annual generation in kWh */
    annual_generation_kwh: number

    /** Monthly electricity savings in BRL */
    monthly_savings_brl: number

    /** Current monthly electricity bill in BRL */
    current_monthly_bill_brl: number

    /** Oversizing scenario */
    oversizing_scenario: OversizingScenario

    /** Customer credit score (optional) */
    credit_score?: number

    /** Locale for currency/formatting */
    locale?: string

    /** Calculation timestamp */
    created_at: string
}

/**
 * Interest rate data (from BACEN or banks)
 */
export interface InterestRateData {
    /** Annual interest rate (e.g., 0.175 for 17.5%) */
    annual_rate: number

    /** Monthly interest rate */
    monthly_rate: number

    /** Rate source (BACEN, bank name, etc.) */
    source: string

    /** Rate validity period */
    valid_until?: string
}

/**
 * Installment calculation
 */
export interface InstallmentData {
    /** Number of installments */
    term_months: number

    /** Monthly installment amount */
    monthly_payment: number

    /** Total amount paid */
    total_paid: number

    /** Total interest paid */
    total_interest: number

    /** First installment date */
    first_payment_date?: string

    /** Last installment date */
    last_payment_date?: string
}

/**
 * ROI calculation results
 */
export interface ROICalculation {
    /** Internal Rate of Return (TIR) */
    irr: number

    /** Net Present Value (VPL) in BRL */
    npv: number

    /** Payback period in years */
    payback_years: number

    /** Payback period in months */
    payback_months: number

    /** 25-year accumulated savings */
    savings_25y: number

    /** Break-even month */
    breakeven_month: number
}

/**
 * Financing scenario comparison
 */
export interface FinancingScenario {
    /** Scenario identifier */
    scenario: OversizingScenario

    /** System capacity */
    kwp: number

    /** Annual generation */
    generation_kwh: number

    /** CAPEX for this scenario */
    capex: number

    /** Monthly savings */
    monthly_savings: number

    /** Installment data for different terms */
    installments: {
        months_12?: InstallmentData
        months_24?: InstallmentData
        months_36?: InstallmentData
        months_48?: InstallmentData
        months_60?: InstallmentData
    }

    /** ROI metrics */
    roi: ROICalculation

    /** Is this the recommended scenario? */
    is_recommended: boolean

    /** Recommendation reason */
    recommendation_reason?: string
}

/**
 * Complete finance output
 */
export interface FinanceOutput {
    /** Calculation ID */
    id: string

    /** Input data reference */
    input: FinanceInput

    /** Interest rate used */
    interest_rate: InterestRateData

    /** All financing scenarios */
    scenarios: FinancingScenario[]

    /** Recommended scenario */
    recommended_scenario: FinancingScenario

    /** Calculation timestamp */
    calculated_at: string

    /** PDF report URL (if generated) */
    pdf_url?: string

    /** Is calculation valid? */
    is_valid: boolean

    /** Validation errors */
    errors?: string[]
}

// ============================================================================
// Integration Types
// ============================================================================

/**
 * Data from Viability module for Finance
 */
export interface ViabilityFinanceData {
    viability_id: string
    system_kwp: number
    annual_generation_kwh: number
    oversizing_scenario: OversizingScenario
    capex_estimate: CAPEXBreakdown
    created_at: string
}

/**
 * Data from Tariffs module for Finance
 */
export interface TariffFinanceData {
    tariff_id: string
    monthly_savings_brl: number
    current_monthly_bill_brl: number
    tariff_class: string
    utility_company: string
}

/**
 * Finance data for Cart integration
 */
export interface FinanceCartData {
    finance_id: string
    selected_scenario: OversizingScenario
    selected_term_months: number
    monthly_payment: number
    total_financed: number
    interest_rate: number
    financing_modality: FinancingModality
}

/**
 * Finance data for Quote integration
 */
export interface FinanceQuoteData {
    finance_id: string
    scenario: FinancingScenario
    selected_term: number
    modality: FinancingModality
    bank_partner?: string
    approved_amount?: number
    pre_approved: boolean
}

/**
 * Finance data for Account/Dashboard
 */
export interface FinanceAccountData {
    calculations: FinanceOutput[]
    total_count: number
    latest_calculation?: FinanceOutput
    average_roi?: number
    average_payback?: number
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Finance calculator UI state
 */
export interface FinanceUIState {
    /** Current step in the flow */
    step: 'input' | 'calculating' | 'results' | 'comparison'

    /** Loading state */
    loading: boolean

    /** Error message */
    error?: string

    /** Selected scenario for details */
    selected_scenario?: OversizingScenario

    /** Selected financing term */
    selected_term?: number

    /** Selected modality */
    selected_modality?: FinancingModality
}

/**
 * Sensitivity analysis data
 */
export interface SensitivityAnalysis {
    /** Interest rate variations */
    rate_scenarios: Array<{
        rate: number
        payback_years: number
        monthly_payment: number
        irr: number
    }>

    /** Tariff increase scenarios */
    tariff_scenarios: Array<{
        annual_increase: number
        payback_years: number
        savings_25y: number
    }>

    /** Generation degradation scenarios */
    degradation_scenarios: Array<{
        annual_degradation: number
        total_generation_25y: number
        roi_impact: number
    }>
}

// ============================================================================
// Bank Integration Types
// ============================================================================

/**
 * Bank partner information
 */
export interface BankPartner {
    id: string
    name: string
    logo_url: string
    interest_rates: {
        min: number
        max: number
    }
    terms_available: number[]
    modalities: FinancingModality[]
    min_amount: number
    max_amount: number
    approval_time_hours: number
}

/**
 * Credit pre-approval request
 */
export interface CreditPreApprovalRequest {
    customer_cpf?: string
    customer_cnpj?: string
    requested_amount: number
    term_months: number
    credit_score?: number
    monthly_income?: number
}

/**
 * Credit pre-approval response
 */
export interface CreditPreApprovalResponse {
    approved: boolean
    approved_amount: number
    interest_rate: number
    bank_partner: BankPartner
    conditions: string[]
    valid_until: string
    proposal_id: string
}

// ============================================================================
// BACEN Integration Types
// ============================================================================

/**
 * BACEN rate reference
 */
export interface BACENRateReference {
    /** SELIC rate */
    selic: number

    /** CDI rate */
    cdi: number

    /** IPCA inflation */
    ipca: number

    /** Reference date */
    reference_date: string

    /** Data source */
    source: 'BACEN_API'
}

// ============================================================================
// Validation & Error Types
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
    is_valid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
}

/**
 * Validation error
 */
export interface ValidationError {
    field: string
    message: string
    code: string
}

/**
 * Validation warning
 */
export interface ValidationWarning {
    field: string
    message: string
    severity: 'low' | 'medium' | 'high'
}

// ============================================================================
// Export helpers
// ============================================================================

/**
 * Type guards
 */
export const isOversizingScenario = (value: number): value is OversizingScenario => {
    return [114, 130, 145, 160].includes(value)
}

export const isFinancingModality = (value: string): value is FinancingModality => {
    return ['CDC', 'LEASING', 'EAAS', 'CASH'].includes(value)
}
