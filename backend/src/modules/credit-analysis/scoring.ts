/**
 * Credit Scoring Pure Functions
 * 
 * Algoritmo multi-fator de scoring de crédito (0-100 pontos):
 * - Income Score (0-30): Capacidade de pagamento
 * - Employment Score (0-15): Estabilidade de renda
 * - Credit History Score (0-35): Histórico comportamental
 * - Debt Ratio Score (0-20): Nível de endividamento
 * 
 * Todas as funções são puras (sem side effects) e 100% testáveis.
 * 
 * @module credit-analysis/scoring
 */

import {
    CustomerType,
    INCOME_THRESHOLDS,
    EMPLOYMENT_THRESHOLDS,
    CREDIT_SCORE_THRESHOLDS,
    CREDIT_PENALTIES,
    DEBT_RATIO_THRESHOLDS,
    APPROVAL_RULES,
    INTEREST_RATE_CONFIG,
    RiskLevel,
} from "./types/enums";
import { CreditScoreFactors } from "./types/interfaces";

// ============================================================================
// Income Score (0-30 pontos)
// ============================================================================

/**
 * Calcula score baseado na renda mensal
 * 
 * Justificativa dos pesos:
 * - >= R$ 10.000: Renda alta, baixíssimo risco de inadimplência (30 pts)
 * - >= R$ 5.000: Renda média-alta, permite financiamentos médios (20 pts)
 * - >= R$ 3.000: Renda média, capacidade limitada (15 pts)
 * - >= R$ 1.500: Renda baixa, alto risco (10 pts)
 * - < R$ 1.500: Renda muito baixa, risco crítico (5 pts)
 * 
 * @param monthly_income - Renda mensal em R$
 * @returns Score de 0 a 30 pontos
 * 
 * @example
 * calculateIncomeScore(10000) // 30
 * calculateIncomeScore(5000)  // 20
 * calculateIncomeScore(1000)  // 5
 */
export function calculateIncomeScore(monthly_income: number): number {
    if (monthly_income >= INCOME_THRESHOLDS.EXCELLENT) {
        return 30;
    } else if (monthly_income >= INCOME_THRESHOLDS.GOOD) {
        return 20;
    } else if (monthly_income >= INCOME_THRESHOLDS.FAIR) {
        return 15;
    } else if (monthly_income >= INCOME_THRESHOLDS.POOR) {
        return 10;
    } else {
        return 5;
    }
}

// ============================================================================
// Employment Score (0-15 pontos)
// ============================================================================

/**
 * Calcula score baseado na estabilidade de emprego/negócio
 * 
 * PESSOA JURÍDICA (foundation_years):
 * - >= 5 anos: Empresa consolidada, baixo risco (15 pts)
 * - >= 3 anos: Empresa estabelecida (12 pts)
 * - >= 1 ano: Empresa em crescimento (8 pts)
 * - < 1 ano: Empresa nova, alto risco (5 pts)
 * 
 * PESSOA FÍSICA (employment_time_months):
 * - >= 36 meses: Alta estabilidade (15 pts)
 * - >= 24 meses: Boa estabilidade (12 pts)
 * - >= 12 meses: Estabilidade moderada (8 pts)
 * - >= 6 meses: Baixa estabilidade (5 pts)
 * - < 6 meses: Muito baixa estabilidade (2 pts)
 * 
 * @param customer_type - Tipo de cliente (individual/business)
 * @param employment_time_months - Meses no emprego atual (PF)
 * @param foundation_years - Anos desde fundação (PJ)
 * @returns Score de 0 a 15 pontos
 * 
 * @example
 * calculateEmploymentScore(CustomerType.INDIVIDUAL, 36, undefined) // 15
 * calculateEmploymentScore(CustomerType.BUSINESS, undefined, 5)    // 15
 * calculateEmploymentScore(CustomerType.INDIVIDUAL, 3, undefined)  // 2
 */
export function calculateEmploymentScore(
    customer_type: CustomerType,
    employment_time_months?: number,
    foundation_years?: number
): number {
    if (customer_type === CustomerType.BUSINESS) {
        // Pessoa Jurídica: anos de fundação
        const years = foundation_years ?? 0;
        if (years >= EMPLOYMENT_THRESHOLDS.PJ.EXCELLENT) return 15;
        if (years >= EMPLOYMENT_THRESHOLDS.PJ.GOOD) return 12;
        if (years >= EMPLOYMENT_THRESHOLDS.PJ.FAIR) return 8;
        return 5;
    } else {
        // Pessoa Física: meses no emprego atual
        const months = employment_time_months ?? 0;
        if (months >= EMPLOYMENT_THRESHOLDS.PF.EXCELLENT) return 15;
        if (months >= EMPLOYMENT_THRESHOLDS.PF.GOOD) return 12;
        if (months >= EMPLOYMENT_THRESHOLDS.PF.FAIR) return 8;
        if (months >= EMPLOYMENT_THRESHOLDS.PF.POOR) return 5;
        return 2;
    }
}

// ============================================================================
// Credit History Score (0-35 pontos)
// ============================================================================

/**
 * Calcula score baseado no histórico de crédito (bureau)
 * 
 * Score base (0-1000 do bureau):
 * - 750+: Excelente histórico (35 pts)
 * - 700-749: Muito bom (30 pts)
 * - 650-699: Bom (25 pts)
 * - 600-649: Regular (20 pts)
 * - 550-599: Ruim (15 pts)
 * - 500-549: Muito ruim (10 pts)
 * - < 500: Péssimo (5 pts)
 * 
 * PENALIDADES:
 * - Negativação ativa (SPC/Serasa): -20 pts
 * - Falência/Recuperação judicial: -35 pts
 * 
 * Score final não pode ser negativo (mínimo 0).
 * 
 * @param credit_score - Score do bureau (0-1000)
 * @param has_negative_credit - Tem negativação ativa?
 * @param has_bankruptcy - Tem falência/recuperação?
 * @returns Score de 0 a 35 pontos
 * 
 * @example
 * calculateCreditHistoryScore(800, false, false)  // 35
 * calculateCreditHistoryScore(700, true, false)   // 10 (30 - 20)
 * calculateCreditHistoryScore(600, false, true)   // 0 (20 - 35, min 0)
 */
export function calculateCreditHistoryScore(
    credit_score: number = 500,
    has_negative_credit: boolean = false,
    has_bankruptcy: boolean = false
): number {
    // Score base (0-35)
    let score = 5; // default mínimo

    if (credit_score >= CREDIT_SCORE_THRESHOLDS.EXCELLENT) {
        score = 35;
    } else if (credit_score >= CREDIT_SCORE_THRESHOLDS.VERY_GOOD) {
        score = 30;
    } else if (credit_score >= CREDIT_SCORE_THRESHOLDS.GOOD) {
        score = 25;
    } else if (credit_score >= CREDIT_SCORE_THRESHOLDS.FAIR) {
        score = 20;
    } else if (credit_score >= CREDIT_SCORE_THRESHOLDS.POOR) {
        score = 15;
    } else if (credit_score >= CREDIT_SCORE_THRESHOLDS.VERY_POOR) {
        score = 10;
    }

    // Aplicar penalidades
    if (has_negative_credit) {
        score += CREDIT_PENALTIES.NEGATIVE_CREDIT; // -20
    }
    if (has_bankruptcy) {
        score += CREDIT_PENALTIES.BANKRUPTCY; // -35
    }

    // Garantir que score não seja negativo
    return Math.max(0, score);
}

// ============================================================================
// Debt Ratio Score (0-20 pontos)
// ============================================================================

/**
 * Calcula score baseado no debt-to-income ratio
 * 
 * Percentual de dívidas mensais sobre renda:
 * - 0%: Sem dívidas (20 pts)
 * - < 20%: Endividamento baixo (18 pts)
 * - < 30%: Endividamento moderado (15 pts)
 * - < 40%: Endividamento alto (10 pts)
 * - < 50%: Endividamento muito alto (5 pts)
 * - >= 50%: Endividamento crítico (0 pts)
 * 
 * Justificativa: Debt ratio acima de 50% indica alta probabilidade
 * de inadimplência, pois o cliente já compromete metade da renda.
 * 
 * @param debt_ratio - Razão dívidas/renda (0.0 a 1.0+)
 * @returns Score de 0 a 20 pontos
 * 
 * @example
 * calculateDebtRatioScore(0)     // 20
 * calculateDebtRatioScore(0.15)  // 18
 * calculateDebtRatioScore(0.49)  // 5
 * calculateDebtRatioScore(0.70)  // 0
 */
export function calculateDebtRatioScore(debt_ratio: number): number {
    if (debt_ratio <= DEBT_RATIO_THRESHOLDS.NONE) {
        return 20;
    } else if (debt_ratio < DEBT_RATIO_THRESHOLDS.LOW) {
        return 18;
    } else if (debt_ratio < DEBT_RATIO_THRESHOLDS.MODERATE) {
        return 15;
    } else if (debt_ratio < DEBT_RATIO_THRESHOLDS.HIGH) {
        return 10;
    } else if (debt_ratio < DEBT_RATIO_THRESHOLDS.VERY_HIGH) {
        return 5;
    } else {
        return 0;
    }
}

// ============================================================================
// Total Score Calculation
// ============================================================================

/**
 * Calcula debt-to-income ratio
 * 
 * @param monthly_debts - Dívidas mensais totais
 * @param monthly_income - Renda mensal
 * @returns Razão dívidas/renda (0.0 a 1.0+)
 * 
 * @example
 * calculateDebtToIncomeRatio(1500, 5000) // 0.30 (30%)
 * calculateDebtToIncomeRatio(0, 3000)    // 0.00 (0%)
 */
export function calculateDebtToIncomeRatio(
    monthly_debts: number,
    monthly_income: number
): number {
    if (monthly_income <= 0) return 1.0; // Proteção contra divisão por zero
    return monthly_debts / monthly_income;
}

/**
 * Calcula score total consolidando todos os fatores
 * 
 * Soma dos fatores (0-100):
 * - income_score: 0-30
 * - employment_score: 0-15
 * - credit_history_score: 0-35
 * - debt_ratio_score: 0-20
 * 
 * @param factors - Fatores de score individuais
 * @returns Score total (0-100)
 * 
 * @example
 * calculateTotalScore({ income_score: 30, employment_score: 15, credit_history_score: 35, debt_ratio_score: 20 })
 * // 100
 */
export function calculateTotalScore(factors: Omit<CreditScoreFactors, "total_score">): number {
    return (
        factors.income_score +
        factors.employment_score +
        factors.credit_history_score +
        factors.debt_ratio_score
    );
}

/**
 * Calcula todos os fatores de score de uma vez
 * 
 * @param input - Dados do cliente para análise
 * @returns Fatores de score completos incluindo total
 * 
 * @example
 * calculateCreditScore({
 *   customer_type: CustomerType.INDIVIDUAL,
 *   monthly_income: 5000,
 *   monthly_debts: 1200,
 *   employment_time_months: 24,
 *   credit_score: 700,
 *   has_negative_credit: false,
 *   has_bankruptcy: false,
 * })
 * // { income_score: 20, employment_score: 12, credit_history_score: 30, debt_ratio_score: 15, total_score: 77 }
 */
export function calculateCreditScore(input: {
    customer_type: CustomerType;
    monthly_income: number;
    monthly_debts?: number;
    employment_time_months?: number;
    foundation_years?: number;
    credit_score?: number;
    has_negative_credit?: boolean;
    has_bankruptcy?: boolean;
}): CreditScoreFactors {
    const monthly_debts = input.monthly_debts ?? 0;
    const debt_ratio = calculateDebtToIncomeRatio(monthly_debts, input.monthly_income);

    const income_score = calculateIncomeScore(input.monthly_income);
    const employment_score = calculateEmploymentScore(
        input.customer_type,
        input.employment_time_months,
        input.foundation_years
    );
    const credit_history_score = calculateCreditHistoryScore(
        input.credit_score,
        input.has_negative_credit,
        input.has_bankruptcy
    );
    const debt_ratio_score = calculateDebtRatioScore(debt_ratio);

    const total_score = calculateTotalScore({
        income_score,
        employment_score,
        credit_history_score,
        debt_ratio_score,
    });

    return {
        income_score,
        employment_score,
        credit_history_score,
        debt_ratio_score,
        total_score,
    };
}

// ============================================================================
// Approval Logic
// ============================================================================

/**
 * Determina se a análise é aprovada
 * 
 * Critérios de aprovação (TODOS devem ser atendidos):
 * 1. total_score >= 60 (60% dos pontos)
 * 2. debt_ratio < 0.50 (endividamento < 50%)
 * 3. !has_negative_credit (sem negativação ativa)
 * 4. !has_bankruptcy (sem falência/recuperação)
 * 
 * Justificativa:
 * - Score 60+ indica risco aceitável
 * - Debt ratio < 50% garante capacidade de assumir nova dívida
 * - Restrições ativas indicam inadimplência recente
 * 
 * @param total_score - Score total (0-100)
 * @param debt_ratio - Razão dívidas/renda
 * @param has_negative_credit - Tem negativação ativa?
 * @param has_bankruptcy - Tem falência/recuperação?
 * @returns true se aprovado, false se rejeitado
 * 
 * @example
 * isApproved(70, 0.30, false, false) // true
 * isApproved(65, 0.55, false, false) // false (debt ratio > 50%)
 * isApproved(75, 0.20, true, false)  // false (negativação)
 */
export function isApproved(
    total_score: number,
    debt_ratio: number,
    has_negative_credit: boolean = false,
    has_bankruptcy: boolean = false
): boolean {
    return (
        total_score >= APPROVAL_RULES.MIN_SCORE &&
        debt_ratio < APPROVAL_RULES.MAX_DEBT_RATIO &&
        !has_negative_credit &&
        !has_bankruptcy
    );
}

// ============================================================================
// Interest Rate Calculation
// ============================================================================

/**
 * Calcula taxa de juros mensal baseada no score
 * 
 * Fórmula:
 * - Taxa base: 1.5% a.m. (19.56% a.a.)
 * - Desconto: (score - 60) × 0.01% por ponto acima de 60
 * - Desconto máximo: 0.4% (score 100)
 * - Taxa mínima: 1.1% a.m. (14.01% a.a.)
 * 
 * Justificativa:
 * - Score mais alto = menor risco = taxa mais baixa
 * - Incentiva clientes a melhorarem score
 * - Mantém rentabilidade mínima (1.1% a.m.)
 * 
 * @param total_score - Score total (0-100)
 * @returns Taxa de juros mensal (decimal, ex: 0.015 = 1.5%)
 * 
 * @example
 * calculateInterestRate(60)  // 0.015 (1.5% a.m.)
 * calculateInterestRate(80)  // 0.013 (1.3% a.m.)
 * calculateInterestRate(100) // 0.011 (1.1% a.m.)
 */
export function calculateInterestRate(total_score: number): number {
    const base_rate = INTEREST_RATE_CONFIG.BASE_RATE;
    const discount_factor = INTEREST_RATE_CONFIG.SCORE_DISCOUNT_FACTOR;
    const max_discount = INTEREST_RATE_CONFIG.MAX_DISCOUNT;
    const min_rate = INTEREST_RATE_CONFIG.MIN_RATE;

    // Calcular desconto baseado no score acima de 60
    const points_above_min = Math.max(0, total_score - APPROVAL_RULES.MIN_SCORE);
    const discount = Math.min(points_above_min * discount_factor, max_discount);

    // Aplicar desconto e garantir taxa mínima
    const rate = base_rate - discount;
    return Math.max(rate, min_rate);
}

// ============================================================================
// Risk Assessment
// ============================================================================

/**
 * Determina nível de risco baseado no score total
 * 
 * - LOW: >= 75 pontos (excelente crédito)
 * - MEDIUM: >= 50 e < 75 (crédito aceitável)
 * - HIGH: < 50 (crédito arriscado)
 * 
 * @param total_score - Score total (0-100)
 * @returns Nível de risco
 * 
 * @example
 * getRiskLevel(85) // RiskLevel.LOW
 * getRiskLevel(65) // RiskLevel.MEDIUM
 * getRiskLevel(45) // RiskLevel.HIGH
 */
export function getRiskLevel(total_score: number): RiskLevel {
    if (total_score >= 75) return RiskLevel.LOW;
    if (total_score >= 50) return RiskLevel.MEDIUM;
    return RiskLevel.HIGH;
}

/**
 * Calcula probabilidade de aprovação (0-100%)
 * 
 * Baseado no score total e presença de restrições.
 * 
 * @param total_score - Score total (0-100)
 * @param has_negative_credit - Tem negativação ativa?
 * @param has_bankruptcy - Tem falência/recuperação?
 * @returns Probabilidade de aprovação (0-100)
 * 
 * @example
 * getApprovalProbability(80, false, false) // 80
 * getApprovalProbability(70, true, false)  // 0 (negativação bloqueia)
 * getApprovalProbability(45, false, false) // 45
 */
export function getApprovalProbability(
    total_score: number,
    has_negative_credit: boolean = false,
    has_bankruptcy: boolean = false
): number {
    // Restrições bloqueiam aprovação
    if (has_negative_credit || has_bankruptcy) return 0;

    // Probabilidade = score total (0-100)
    return Math.min(100, Math.max(0, total_score));
}

/**
 * Calcula loan-to-income ratio
 * 
 * @param requested_amount - Valor solicitado
 * @param monthly_income - Renda mensal
 * @returns Razão empréstimo/renda mensal
 * 
 * @example
 * calculateLoanToIncomeRatio(50000, 5000) // 10.0 (10x renda)
 */
export function calculateLoanToIncomeRatio(
    requested_amount: number,
    monthly_income: number
): number {
    if (monthly_income <= 0) return Infinity;
    return requested_amount / monthly_income;
}

/**
 * Calcula valor máximo recomendado baseado na renda
 * 
 * Regra: Máximo de 30x a renda mensal (conservador)
 * 
 * @param monthly_income - Renda mensal
 * @returns Valor máximo recomendado
 * 
 * @example
 * calculateRecommendedMaxAmount(5000) // 150000 (30x)
 */
export function calculateRecommendedMaxAmount(monthly_income: number): number {
    return monthly_income * 30;
}
