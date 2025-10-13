/**
 * Credit Analysis Interfaces & DTOs
 * 
 * Interfaces TypeScript alinhadas ao schema SQL (credit-analysis.entity.ts)
 * e aos requisitos de negócio para análise de crédito multi-fator.
 * 
 * @module credit-analysis/types/interfaces
 */

import {
    CustomerType,
    EmploymentStatus,
    FinancingModality,
    AnalysisStatus,
    RiskLevel,
} from "./enums";

// ============================================================================
// Input DTOs
// ============================================================================

/**
 * Input para criar análise de crédito
 * 
 * Alinhado ao método createCreditAnalysis() do service.
 * Validado por CreditAnalysisInputSchema (validators.ts).
 */
export interface CreditAnalysisInput {
    // Customer References (RemoteLinks)
    customer_id: string;
    quote_id?: string;
    solar_calculation_id?: string;

    // Customer Basic Info
    customer_type: CustomerType;
    full_name: string;
    cpf_cnpj: string;
    birth_date?: Date;
    email: string;
    phone: string;

    // Address
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        postal_code: string;
    };

    // Financial Data
    monthly_income: number;
    annual_revenue?: number; // PJ only
    monthly_debts?: number;

    // Employment/Business
    occupation?: string;
    employer?: string;
    employment_status?: EmploymentStatus;
    employment_time_months?: number; // PF
    foundation_years?: number; // PJ

    // Credit Bureau Data
    credit_score?: number; // 0-1000 (Serasa/Boa Vista)
    has_negative_credit?: boolean;
    has_bankruptcy?: boolean;
    negative_records?: number;

    // Financing Request
    requested_amount: number;
    requested_term_months: number;
    financing_modality: FinancingModality;

    // Supporting Documents
    documents?: {
        cpf_cnpj?: string; // URL ou ID
        proof_of_income?: string;
        proof_of_residence?: string;
        bank_statement?: string;
    };
}

/**
 * Query params para buscar análises
 */
export interface CreditAnalysisQuery {
    customer_id?: string;
    quote_id?: string;
    status?: AnalysisStatus;
    risk_level?: RiskLevel;
    min_score?: number;
    max_score?: number;
    limit?: number;
    offset?: number;
    fields?: string; // Graph API fields
}

/**
 * Input para gerar ofertas de financiamento
 */
export interface GenerateOffersInput {
    credit_analysis_id: string;
    approved_amount: number;
    approved_term_months: number;
    base_interest_rate: number;
    use_bacen_only?: boolean; // Usar apenas taxas BACEN (sem markup)
}

// ============================================================================
// Output DTOs
// ============================================================================

/**
 * Resultado da análise de crédito
 * 
 * Retornado por analyzeCreditAutomatically().
 */
export interface CreditAnalysisResult {
    // Approval Decision
    approved: boolean;
    approved_amount?: number;
    approved_term_months?: number;
    approved_interest_rate?: number;

    // Score Breakdown
    score_factors: CreditScoreFactors;
    total_score: number;
    risk_level: RiskLevel;
    approval_probability: number; // 0-100%

    // Rejection Info
    rejection_reason?: string;
    recommended_actions?: string[];

    // Approval Conditions
    approval_conditions?: string[];
    required_down_payment?: number;
    max_loan_to_value?: number; // LTV máximo
}

/**
 * Fatores de score detalhados (0-100 total)
 * 
 * Corresponde aos campos da entity:
 * - income_score (0-30)
 * - employment_score (0-15)
 * - credit_history_score (0-35)
 * - debt_ratio_score (0-20)
 * - total_score (0-100)
 */
export interface CreditScoreFactors {
    income_score: number;        // 0-30
    employment_score: number;    // 0-15
    credit_history_score: number; // 0-35
    debt_ratio_score: number;    // 0-20
    total_score: number;         // 0-100
}

/**
 * Detalhes da análise (analysis_details JSONB)
 */
export interface AnalysisDetails {
    loan_to_income_ratio: number;   // Empréstimo / Renda mensal
    debt_to_income_ratio: number;   // Dívidas / Renda mensal
    recommended_max_amount: number; // Valor máximo recomendado
    risk_factors: string[];         // Fatores de risco identificados
    strengths: string[];            // Pontos fortes do cliente
    weaknesses: string[];           // Pontos fracos a melhorar
}

/**
 * Metadata da análise (analysis_metadata JSONB)
 */
export interface AnalysisMetadata {
    version: string;          // Versão do algoritmo (ex: "2.0.0")
    service: string;          // Service que executou ("CreditAnalysisService")
    duration_ms: number;      // Tempo de execução
    credit_bureau?: string;   // Bureau consultado ("Serasa", "Boa Vista")
    external_analysis_id?: string; // ID da análise no bureau externo
}

// ============================================================================
// Financing Offer DTOs
// ============================================================================

/**
 * Oferta de financiamento calculada
 * 
 * Alinhado ao FinancingOffer entity.
 */
export interface FinancingOffer {
    id?: string;
    credit_analysis_id: string;

    // Offer Details
    modality: FinancingModality;
    institution?: string; // Banco/Financeira

    // Amount & Term
    max_amount: number;
    term_months: number;

    // Interest Rates
    interest_rate_monthly: number;
    interest_rate_annual: number;
    cet: number; // Custo Efetivo Total (BACEN)

    // Payment Details
    monthly_payment: number;
    total_amount: number; // Total a pagar
    down_payment_required?: number;

    // Additional Costs
    iof?: number;
    tac?: number; // Taxa de Abertura de Crédito
    insurance?: number; // Seguro prestamista

    // Ranking
    rank: number; // 1 = melhor oferta (menor CET)
    is_recommended: boolean;

    // Additional Info
    offer_details?: {
        features: string[];
        requirements: string[];
        restrictions: string[];
        advantages: string[];
    };
}

/**
 * Input para calcular CET (Custo Efetivo Total)
 */
export interface CETCalculationInput {
    principal: number;
    term_months: number;
    interest_rate_monthly: number;
    iof?: number;
    tac?: number;
    insurance_monthly?: number;
}

/**
 * Resultado do cálculo de CET
 */
export interface CETCalculationResult {
    cet_monthly: number;
    cet_annual: number;
    total_iof: number;
    total_insurance: number;
    total_cost: number; // Custo total do financiamento
    monthly_payment: number;
    total_amount: number; // Total a pagar
}

// ============================================================================
// Risk Assessment DTOs
// ============================================================================

/**
 * Fatores de risco identificados
 */
export interface RiskFactor {
    category: "income" | "employment" | "credit_history" | "debt" | "other";
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    impact_on_score: number; // Pontos perdidos
}

/**
 * Pontos fortes do cliente
 */
export interface Strength {
    category: "income" | "employment" | "credit_history" | "debt" | "other";
    description: string;
    contribution_to_score: number; // Pontos ganhos
}

/**
 * Ação recomendada para melhorar aprovação
 */
export interface RecommendedAction {
    action: string;
    expected_impact: string;
    priority: "high" | "medium" | "low";
    estimated_time: string; // Ex: "3-6 meses"
}

// ============================================================================
// Entity Representation (para referência)
// ============================================================================

/**
 * Representação TypeScript da CreditAnalysis entity
 * 
 * NÃO use diretamente - use os DTOs acima.
 * Esta interface serve apenas como referência ao schema SQL.
 */
export interface CreditAnalysisEntity {
    id: string;

    // References
    customer_id: string;
    quote_id?: string;
    solar_calculation_id?: string;

    // Request Data
    requested_amount: number;
    requested_term_months: number;
    modality: string;

    // Customer Financial Data
    monthly_income: number;
    total_monthly_debts?: number;
    employment_status?: string;
    employment_months?: number;

    // Credit Bureau Data
    credit_score?: number;
    negative_records: number;
    has_active_restrictions: boolean;

    // Score Calculation
    income_score: number;
    employment_score: number;
    credit_history_score: number;
    debt_ratio_score: number;
    total_score: number;

    // Risk Assessment
    risk_level: string;
    approval_probability: number;
    approved: boolean;
    rejection_reason?: string;

    // JSONB Fields
    analysis_details?: AnalysisDetails;
    analysis_metadata?: AnalysisMetadata;

    // Timestamps
    created_at: Date;
    updated_at: Date;

    // Relations
    financing_offers?: FinancingOffer[];
}

/**
 * Representação TypeScript da FinancingOffer entity
 */
export interface FinancingOfferEntity {
    id: string;
    credit_analysis_id: string;

    // Offer Details
    modality: string;
    institution: string;
    max_amount: number;
    term_months: number;

    // Interest Rates
    interest_rate_monthly: number;
    interest_rate_annual: number;
    cet: number;

    // Payment Details
    monthly_payment: number;
    total_amount: number;
    down_payment_required?: number;

    // Ranking
    rank: number;
    is_recommended: boolean;

    // JSONB
    offer_details?: {
        features: string[];
        requirements: string[];
        restrictions: string[];
        advantages: string[];
    };

    // Timestamps
    created_at: Date;
}
