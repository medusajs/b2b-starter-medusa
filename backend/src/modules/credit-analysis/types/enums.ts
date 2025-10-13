/**
 * Credit Analysis Types & Enums
 * 
 * Enumerações TypeScript alinhadas ao schema SQL e lógica de negócio.
 * Usado para validação Zod e type safety em toda a aplicação.
 * 
 * @module credit-analysis/types/enums
 */

// ============================================================================
// Customer & Employment Types
// ============================================================================

/**
 * Tipo de cliente para análise de crédito
 * 
 * - INDIVIDUAL (PF): Pessoa Física
 * - BUSINESS (PJ): Pessoa Jurídica
 */
export enum CustomerType {
    INDIVIDUAL = "individual",
    BUSINESS = "business",
}

/**
 * Status de emprego/ocupação
 * 
 * - EMPLOYED: Empregado CLT
 * - SELF_EMPLOYED: Autônomo/MEI
 * - BUSINESS_OWNER: Empresário
 * - RETIRED: Aposentado
 * - UNEMPLOYED: Desempregado
 */
export enum EmploymentStatus {
    EMPLOYED = "employed",
    SELF_EMPLOYED = "self_employed",
    BUSINESS_OWNER = "business_owner",
    RETIRED = "retired",
    UNEMPLOYED = "unemployed",
}

// ============================================================================
// Financing Modalities
// ============================================================================

/**
 * Modalidade de financiamento
 * 
 * - CDC: Crédito Direto ao Consumidor (juros mais altos, aprovação mais fácil)
 * - LEASING: Arrendamento Mercantil (bem fica em garantia)
 * - EAAS: Energy as a Service (modelo de assinatura)
 * - CASH: Compra à vista (sem financiamento)
 */
export enum FinancingModality {
    CDC = "CDC",
    LEASING = "LEASING",
    EAAS = "EAAS",
    CASH = "CASH",
}

// ============================================================================
// Analysis Status & Risk
// ============================================================================

/**
 * Status da análise de crédito
 * 
 * - PENDING: Aguardando análise
 * - APPROVED: Aprovado
 * - REJECTED: Rejeitado
 * - EXPIRED: Análise expirada (90 dias)
 */
export enum AnalysisStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    EXPIRED = "expired",
}

/**
 * Nível de risco creditício
 * 
 * Baseado no total_score:
 * - LOW: >= 75 pontos (excelente crédito)
 * - MEDIUM: >= 50 pontos (crédito aceitável)
 * - HIGH: < 50 pontos (crédito arriscado)
 */
export enum RiskLevel {
    LOW = "low",       // >= 75
    MEDIUM = "medium", // >= 50 e < 75
    HIGH = "high",     // < 50
}

// ============================================================================
// Scoring Weights & Thresholds
// ============================================================================

/**
 * Pesos dos fatores de score (0-100 total)
 * 
 * Justificativa:
 * - INCOME_MAX (30%): Capacidade de pagamento é o fator mais importante
 * - CREDIT_HISTORY_MAX (35%): Histórico comportamental é o melhor preditor de inadimplência
 * - DEBT_RATIO_MAX (20%): Endividamento atual impacta capacidade de assumir nova dívida
 * - EMPLOYMENT_MAX (15%): Estabilidade de renda complementa análise de capacidade
 */
export const SCORE_WEIGHTS = {
    INCOME_MAX: 30,
    EMPLOYMENT_MAX: 15,
    CREDIT_HISTORY_MAX: 35,
    DEBT_RATIO_MAX: 20,
    TOTAL_MAX: 100,
} as const;

/**
 * Thresholds de renda mensal (R$)
 * 
 * Baseado em análise de mercado:
 * - 10k+: Renda alta, baixo risco (30 pts)
 * - 5k-10k: Renda média-alta (20 pts)
 * - 3k-5k: Renda média (15 pts)
 * - 1.5k-3k: Renda baixa (10 pts)
 * - <1.5k: Renda muito baixa (5 pts)
 */
export const INCOME_THRESHOLDS = {
    EXCELLENT: 10000,  // >= 10k = 30 pts
    GOOD: 5000,        // >= 5k = 20 pts
    FAIR: 3000,        // >= 3k = 15 pts
    POOR: 1500,        // >= 1.5k = 10 pts
    VERY_POOR: 0,      // < 1.5k = 5 pts
} as const;

/**
 * Thresholds de tempo de emprego
 * 
 * PESSOA JURÍDICA (anos de fundação):
 * - >= 5 anos: 15 pts (empresa consolidada)
 * - >= 3 anos: 12 pts (empresa estabelecida)
 * - >= 1 ano: 8 pts (empresa em crescimento)
 * - < 1 ano: 5 pts (empresa nova, maior risco)
 * 
 * PESSOA FÍSICA (meses no emprego atual):
 * - >= 36 meses: 15 pts (alta estabilidade)
 * - >= 24 meses: 12 pts (boa estabilidade)
 * - >= 12 meses: 8 pts (estabilidade moderada)
 * - >= 6 meses: 5 pts (baixa estabilidade)
 * - < 6 meses: 2 pts (muito baixa estabilidade)
 */
export const EMPLOYMENT_THRESHOLDS = {
    PJ: {
        EXCELLENT: 5,  // >= 5 anos = 15 pts
        GOOD: 3,       // >= 3 anos = 12 pts
        FAIR: 1,       // >= 1 ano = 8 pts
        POOR: 0,       // < 1 ano = 5 pts
    },
    PF: {
        EXCELLENT: 36, // >= 36 meses = 15 pts
        GOOD: 24,      // >= 24 meses = 12 pts
        FAIR: 12,      // >= 12 meses = 8 pts
        POOR: 6,       // >= 6 meses = 5 pts
        VERY_POOR: 0,  // < 6 meses = 2 pts
    },
} as const;

/**
 * Thresholds de credit score (Serasa/Boa Vista)
 * 
 * Escala 0-1000:
 * - 750+: Excelente (35 pts)
 * - 700-749: Muito bom (30 pts)
 * - 650-699: Bom (25 pts)
 * - 600-649: Regular (20 pts)
 * - 550-599: Ruim (15 pts)
 * - 500-549: Muito ruim (10 pts)
 * - < 500: Péssimo (5 pts)
 * 
 * PENALIDADES:
 * - Negativação ativa: -20 pts
 * - Falência/Recuperação judicial: -35 pts
 */
export const CREDIT_SCORE_THRESHOLDS = {
    EXCELLENT: 750,    // >= 750 = 35 pts
    VERY_GOOD: 700,    // >= 700 = 30 pts
    GOOD: 650,         // >= 650 = 25 pts
    FAIR: 600,         // >= 600 = 20 pts
    POOR: 550,         // >= 550 = 15 pts
    VERY_POOR: 500,    // >= 500 = 10 pts
    BAD: 0,            // < 500 = 5 pts
} as const;

export const CREDIT_PENALTIES = {
    NEGATIVE_CREDIT: -20, // Restrições ativas (SPC/Serasa)
    BANKRUPTCY: -35,      // Falência/Recuperação judicial
} as const;

/**
 * Thresholds de debt-to-income ratio
 * 
 * Percentual de dívidas mensais sobre renda:
 * - 0%: Sem dívidas (20 pts)
 * - < 20%: Endividamento baixo (18 pts)
 * - < 30%: Endividamento moderado (15 pts)
 * - < 40%: Endividamento alto (10 pts)
 * - < 50%: Endividamento muito alto (5 pts)
 * - >= 50%: Endividamento crítico (0 pts)
 */
export const DEBT_RATIO_THRESHOLDS = {
    NONE: 0,           // 0% = 20 pts
    LOW: 0.20,         // < 20% = 18 pts
    MODERATE: 0.30,    // < 30% = 15 pts
    HIGH: 0.40,        // < 40% = 10 pts
    VERY_HIGH: 0.50,   // < 50% = 5 pts
    CRITICAL: 1.0,     // >= 50% = 0 pts
} as const;

// ============================================================================
// Approval Logic Constants
// ============================================================================

/**
 * Constantes para lógica de aprovação
 * 
 * APPROVAL:
 * - MIN_SCORE: Score mínimo para aprovação (60/100)
 * - MAX_DEBT_RATIO: Debt ratio máximo permitido (0.50 = 50%)
 * - ALLOWS_NEGATIVE_CREDIT: Permite negativação? (false)
 * - ALLOWS_BANKRUPTCY: Permite falência? (false)
 * 
 * INTEREST_RATE:
 * - BASE_RATE: Taxa base mensal (1.5% a.m. = ~19.56% a.a.)
 * - MAX_DISCOUNT: Desconto máximo para score alto (0.4% = 0.004)
 * - MIN_RATE: Taxa mínima possível (1.1% a.m. = ~14.01% a.a.)
 * 
 * EXPIRATION:
 * - ANALYSIS_VALIDITY_DAYS: Validade da análise (90 dias)
 */
export const APPROVAL_RULES = {
    MIN_SCORE: 60,
    MAX_DEBT_RATIO: 0.50,
    ALLOWS_NEGATIVE_CREDIT: false,
    ALLOWS_BANKRUPTCY: false,
} as const;

export const INTEREST_RATE_CONFIG = {
    BASE_RATE: 0.015,      // 1.5% a.m.
    MAX_DISCOUNT: 0.004,   // 0.4% desconto máximo
    MIN_RATE: 0.011,       // 1.1% a.m. (score 100)
    SCORE_DISCOUNT_FACTOR: 0.0001, // Desconto por ponto acima de 60
} as const;

export const EXPIRATION = {
    ANALYSIS_VALIDITY_DAYS: 90,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard para CustomerType
 */
export function isCustomerType(value: unknown): value is CustomerType {
    return typeof value === "string" && Object.values(CustomerType).includes(value as CustomerType);
}

/**
 * Type guard para FinancingModality
 */
export function isFinancingModality(value: unknown): value is FinancingModality {
    return typeof value === "string" && Object.values(FinancingModality).includes(value as FinancingModality);
}

/**
 * Type guard para EmploymentStatus
 */
export function isEmploymentStatus(value: unknown): value is EmploymentStatus {
    return typeof value === "string" && Object.values(EmploymentStatus).includes(value as EmploymentStatus);
}
