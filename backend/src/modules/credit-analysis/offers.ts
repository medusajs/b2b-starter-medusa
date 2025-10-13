/**
 * Financing Offers Generator
 * 
 * Geração de ofertas de financiamento com cálculo de CET (Custo Efetivo Total)
 * conforme regulamentação BACEN.
 * 
 * CET inclui:
 * - Taxa de juros nominal
 * - IOF (Imposto sobre Operações Financeiras)
 * - TAC (Taxa de Abertura de Crédito)
 * - Seguro prestamista (opcional)
 * 
 * @module credit-analysis/offers
 */

import { FinancingModality } from "./types/enums.js";
import {
    FinancingOffer,
    CETCalculationInput,
    CETCalculationResult,
} from "./types/interfaces.js";

// ============================================================================
// Constants
// ============================================================================

/**
 * Taxas BACEN para financiamento (atualizar periodicamente)
 * 
 * Fonte: BACEN - Indicadores de Taxas de Juros
 * Última atualização: 2024-01
 */
const BACEN_RATES = {
    CDC: {
        MIN: 0.0150, // 1.50% a.m. (19.56% a.a.)
        MAX: 0.0350, // 3.50% a.m. (51.11% a.a.)
        AVERAGE: 0.0250, // 2.50% a.m. (34.49% a.a.)
    },
    LEASING: {
        MIN: 0.0120, // 1.20% a.m. (15.39% a.a.)
        MAX: 0.0280, // 2.80% a.m. (38.92% a.a.)
        AVERAGE: 0.0200, // 2.00% a.m. (26.82% a.a.)
    },
    EAAS: {
        MIN: 0.0100, // 1.00% a.m. (12.68% a.a.)
        MAX: 0.0200, // 2.00% a.m. (26.82% a.a.)
        AVERAGE: 0.0150, // 1.50% a.m. (19.56% a.a.)
    },
} as const;

/**
 * Taxas de IOF (Imposto sobre Operações Financeiras)
 * 
 * - Diária: 0.0082% ao dia (máximo 365 dias)
 * - Adicional: 0.38% sobre o valor total
 * 
 * Fórmula: IOF = (principal × 0.0082% × dias) + (principal × 0.38%)
 */
const IOF_RATES = {
    DAILY: 0.000082, // 0.0082% ao dia
    ADDITIONAL: 0.0038, // 0.38% fixo
    MAX_DAYS: 365,
} as const;

/**
 * TAC (Taxa de Abertura de Crédito)
 * 
 * Percentual sobre o valor financiado (varia por modalidade).
 */
const TAC_RATES = {
    CDC: 0.0200, // 2% para CDC
    LEASING: 0.0150, // 1.5% para Leasing
    EAAS: 0.0100, // 1% para EaaS
    CASH: 0.0000, // 0% para pagamento à vista
} as const;

/**
 * Seguro prestamista (opcional)
 * 
 * Percentual mensal sobre o saldo devedor.
 */
const INSURANCE_RATE = 0.0020; // 0.20% ao mês

/**
 * Instituições financeiras parceiras
 */
const INSTITUTIONS = [
    "Banco do Brasil",
    "Caixa Econômica",
    "Santander",
    "Bradesco",
    "Itaú",
    "Sicredi",
    "BV Financeira",
] as const;

// ============================================================================
// IOF Calculation
// ============================================================================

/**
 * Calcula IOF total para operação de crédito
 * 
 * Fórmula BACEN:
 * - IOF Diário: principal × 0.0082% × min(dias, 365)
 * - IOF Adicional: principal × 0.38%
 * - IOF Total: IOF Diário + IOF Adicional
 * 
 * @param principal - Valor do principal
 * @param term_months - Prazo em meses
 * @returns IOF total
 * 
 * @example
 * calculateIOF(50000, 24) // ~500
 */
export function calculateIOF(principal: number, term_months: number): number {
    const days = Math.min(term_months * 30, IOF_RATES.MAX_DAYS);
    const iof_daily = principal * IOF_RATES.DAILY * days;
    const iof_additional = principal * IOF_RATES.ADDITIONAL;
    return iof_daily + iof_additional;
}

/**
 * Calcula TAC baseado na modalidade
 * 
 * @param principal - Valor do principal
 * @param modality - Modalidade de financiamento
 * @returns TAC (Taxa de Abertura de Crédito)
 * 
 * @example
 * calculateTAC(50000, FinancingModality.CDC) // 1000 (2%)
 */
export function calculateTAC(principal: number, modality: FinancingModality): number {
    const rate = TAC_RATES[modality] || 0;
    return principal * rate;
}

/**
 * Calcula seguro prestamista mensal
 * 
 * @param balance - Saldo devedor
 * @returns Seguro mensal
 * 
 * @example
 * calculateInsurance(50000) // 100 (0.20%)
 */
export function calculateInsurance(balance: number): number {
    return balance * INSURANCE_RATE;
}

// ============================================================================
// Payment Calculation (Price Table)
// ============================================================================

/**
 * Calcula parcela mensal usando tabela Price
 * 
 * Fórmula: PMT = PV × [i × (1 + i)^n] / [(1 + i)^n - 1]
 * Onde:
 * - PV = Valor Presente (principal)
 * - i = Taxa de juros mensal
 * - n = Número de parcelas
 * 
 * @param principal - Valor do principal
 * @param interest_rate_monthly - Taxa de juros mensal (decimal)
 * @param term_months - Prazo em meses
 * @returns Parcela mensal
 * 
 * @example
 * calculateMonthlyPayment(50000, 0.015, 24) // ~2386
 */
export function calculateMonthlyPayment(
    principal: number,
    interest_rate_monthly: number,
    term_months: number
): number {
    if (interest_rate_monthly === 0) {
        return principal / term_months;
    }

    const factor = Math.pow(1 + interest_rate_monthly, term_months);
    const pmt = principal * (interest_rate_monthly * factor) / (factor - 1);
    return pmt;
}

/**
 * Calcula total a pagar (parcelas + IOF + TAC)
 * 
 * @param monthly_payment - Parcela mensal
 * @param term_months - Prazo em meses
 * @param iof - IOF total
 * @param tac - TAC
 * @returns Total a pagar
 * 
 * @example
 * calculateTotalAmount(2386, 24, 500, 1000) // ~58764
 */
export function calculateTotalAmount(
    monthly_payment: number,
    term_months: number,
    iof: number,
    tac: number
): number {
    return (monthly_payment * term_months) + iof + tac;
}

// ============================================================================
// CET Calculation (Custo Efetivo Total)
// ============================================================================

/**
 * Calcula CET (Custo Efetivo Total) conforme BACEN
 * 
 * CET é a taxa efetiva que considera TODOS os custos da operação:
 * - Taxa de juros nominal
 * - IOF
 * - TAC
 * - Seguro prestamista
 * 
 * Método: Newton-Raphson para encontrar taxa interna de retorno (TIR).
 * 
 * @param input - Dados para cálculo do CET
 * @returns Resultado com CET mensal e anual
 * 
 * @example
 * calculateCET({
 *   principal: 50000,
 *   term_months: 24,
 *   interest_rate_monthly: 0.015,
 *   iof: 500,
 *   tac: 1000,
 * })
 * // { cet_monthly: 0.0175, cet_annual: 0.2302, ... }
 */
export function calculateCET(input: CETCalculationInput): CETCalculationResult {
    const {
        principal,
        term_months,
        interest_rate_monthly,
        iof = 0,
        tac = 0,
        insurance_monthly = 0,
    } = input;

    // Calcular parcela base (sem custos adicionais)
    const base_payment = calculateMonthlyPayment(principal, interest_rate_monthly, term_months);

    // IOF e TAC são cobrados antecipadamente (reduzem valor líquido recebido)
    const net_principal = principal - iof - tac;

    // Valor de cada parcela (incluindo seguro mensal)
    const monthly_payment = base_payment + insurance_monthly;

    // Calcular CET usando Newton-Raphson (TIR)
    let cet_monthly = interest_rate_monthly; // Chute inicial
    const max_iterations = 100;
    const tolerance = 0.000001;

    for (let i = 0; i < max_iterations; i++) {
        let npv = -net_principal; // Valor presente líquido
        let derivative = 0;

        for (let month = 1; month <= term_months; month++) {
            const discount_factor = Math.pow(1 + cet_monthly, month);
            npv += monthly_payment / discount_factor;
            derivative -= (month * monthly_payment) / (discount_factor * (1 + cet_monthly));
        }

        if (Math.abs(npv) < tolerance) break;

        // Atualizar CET (Newton-Raphson)
        cet_monthly -= npv / derivative;
    }

    // Converter CET mensal para anual: (1 + i)^12 - 1
    const cet_annual = Math.pow(1 + cet_monthly, 12) - 1;

    // Calcular valores totais
    const total_iof = iof;
    const total_insurance = insurance_monthly * term_months;
    const total_amount = monthly_payment * term_months + iof + tac;
    const total_cost = total_amount - principal;

    return {
        cet_monthly,
        cet_annual,
        total_iof,
        total_insurance,
        total_cost,
        monthly_payment,
        total_amount,
    };
}

// ============================================================================
// Offer Generation
// ============================================================================

/**
 * Gera múltiplas ofertas de financiamento para comparação
 * 
 * - Gera ofertas para cada modalidade (CDC, Leasing, EaaS)
 * - Calcula CET para cada oferta
 * - Ordena por CET crescente (melhor oferta primeiro)
 * - Marca a oferta com menor CET como recomendada
 * 
 * @param credit_analysis_id - ID da análise de crédito
 * @param approved_amount - Valor aprovado
 * @param approved_term_months - Prazo aprovado
 * @param base_interest_rate - Taxa base aprovada
 * @param use_bacen_only - Usar apenas taxas BACEN (sem markup)
 * @returns Lista de ofertas ordenadas por CET
 * 
 * @example
 * generateFinancingOffers("analysis-123", 50000, 24, 0.015, false)
 * // [
 * //   { modality: "EAAS", cet: 0.0185, rank: 1, is_recommended: true, ... },
 * //   { modality: "LEASING", cet: 0.0210, rank: 2, is_recommended: false, ... },
 * //   { modality: "CDC", cet: 0.0245, rank: 3, is_recommended: false, ... },
 * // ]
 */
export function generateFinancingOffers(
    credit_analysis_id: string,
    approved_amount: number,
    approved_term_months: number,
    base_interest_rate: number,
    use_bacen_only: boolean = false
): FinancingOffer[] {
    const offers: FinancingOffer[] = [];

    // Modalidades a gerar ofertas
    const modalities: FinancingModality[] = [
        FinancingModality.CDC,
        FinancingModality.LEASING,
        FinancingModality.EAAS,
    ];

    for (const modality of modalities) {
        // Taxa de juros (BACEN ou base + markup)
        let interest_rate_monthly: number;

        if (use_bacen_only) {
            // Usar apenas taxas BACEN (sem markup)
            interest_rate_monthly = BACEN_RATES[modality].AVERAGE;
        } else {
            // Usar taxa base aprovada (pode ter markup)
            interest_rate_monthly = base_interest_rate;
        }

        // Calcular custos adicionais
        const iof = calculateIOF(approved_amount, approved_term_months);
        const tac = calculateTAC(approved_amount, modality);
        const insurance_monthly = calculateInsurance(approved_amount / approved_term_months);

        // Calcular CET
        const cet_result = calculateCET({
            principal: approved_amount,
            term_months: approved_term_months,
            interest_rate_monthly,
            iof,
            tac,
            insurance_monthly,
        });

        // Taxa anual: (1 + i)^12 - 1
        const interest_rate_annual = Math.pow(1 + interest_rate_monthly, 12) - 1;

        // Selecionar instituição aleatória (mock - em produção viria de API)
        const institution = INSTITUTIONS[Math.floor(Math.random() * INSTITUTIONS.length)];

        // Entrada requerida (20% para Leasing, 0% para demais)
        const down_payment_required = modality === FinancingModality.LEASING
            ? approved_amount * 0.20
            : undefined;

        // Detalhes da oferta
        const offer_details = getOfferDetails(modality);

        offers.push({
            credit_analysis_id,
            modality,
            institution,
            max_amount: approved_amount,
            term_months: approved_term_months,
            interest_rate_monthly,
            interest_rate_annual,
            cet: cet_result.cet_monthly,
            monthly_payment: cet_result.monthly_payment,
            total_amount: cet_result.total_amount,
            down_payment_required,
            iof,
            tac,
            insurance: cet_result.total_insurance,
            rank: 0, // Será definido após ordenação
            is_recommended: false,
            offer_details,
        });
    }

    // Ordenar por CET crescente (menor CET = melhor oferta)
    offers.sort((a, b) => a.cet - b.cet);

    // Atribuir ranking e marcar recomendada
    offers.forEach((offer, index) => {
        offer.rank = index + 1;
        offer.is_recommended = index === 0; // Primeira oferta é recomendada
    });

    return offers;
}

/**
 * Retorna detalhes específicos da modalidade
 * 
 * @param modality - Modalidade de financiamento
 * @returns Detalhes da oferta
 */
function getOfferDetails(modality: FinancingModality) {
    switch (modality) {
        case FinancingModality.CDC:
            return {
                features: [
                    "Aprovação rápida (até 48h)",
                    "Não exige entrada",
                    "Sem garantia de bem",
                ],
                requirements: [
                    "Renda comprovada",
                    "Sem restrições no CPF/CNPJ",
                ],
                restrictions: [
                    "Taxa de juros mais alta",
                    "Não permite quitação antecipada sem desconto",
                ],
                advantages: [
                    "Processo 100% digital",
                    "Liberação rápida do crédito",
                ],
            };

        case FinancingModality.LEASING:
            return {
                features: [
                    "Bem fica em garantia",
                    "Taxa de juros reduzida",
                    "Opção de compra ao final",
                ],
                requirements: [
                    "Entrada de 20%",
                    "Renda comprovada",
                    "Sem restrições",
                ],
                restrictions: [
                    "Bem não pode ser vendido durante o contrato",
                    "Exige seguro obrigatório",
                ],
                advantages: [
                    "Menor custo total",
                    "Possibilidade de retomada do bem",
                ],
            };

        case FinancingModality.EAAS:
            return {
                features: [
                    "Modelo de assinatura mensal",
                    "Manutenção incluída",
                    "Monitoramento remoto",
                ],
                requirements: [
                    "Contrato de 60-120 meses",
                    "Instalação aprovada",
                ],
                restrictions: [
                    "Não há propriedade do sistema",
                    "Cancelamento tem multa",
                ],
                advantages: [
                    "Zero investimento inicial",
                    "Economia imediata na conta de luz",
                    "Sem preocupação com manutenção",
                ],
            };

        default:
            return {
                features: [],
                requirements: [],
                restrictions: [],
                advantages: [],
            };
    }
}

/**
 * Formata oferta para exibição (helper)
 * 
 * @param offer - Oferta de financiamento
 * @returns String formatada
 * 
 * @example
 * formatOffer(offer)
 * // "EaaS - R$ 2.386/mês (CET 1.85% a.m.) - Santander"
 */
export function formatOffer(offer: FinancingOffer): string {
    const cet_percent = (offer.cet * 100).toFixed(2);
    const payment = offer.monthly_payment.toFixed(2);
    return `${offer.modality} - R$ ${payment}/mês (CET ${cet_percent}% a.m.) - ${offer.institution}`;
}
