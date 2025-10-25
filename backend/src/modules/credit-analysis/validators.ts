/**
 * Credit Analysis Validators (Zod Schemas)
 * 
 * Validação de inputs para análise de crédito usando Zod.
 * Garante type safety e validações de negócio antes de processar.
 * 
 * @module credit-analysis/validators
 */

import { z } from "zod";
import {
    CustomerType,
    EmploymentStatus,
    FinancingModality,
    AnalysisStatus,
    RiskLevel,
} from "./types/enums";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normaliza CPF removendo caracteres especiais
 * @example "123.456.789-00" → "12345678900"
 */
export function normalizeCPF(cpf: string): string {
    return cpf.replace(/[^\d]/g, "");
}

/**
 * Normaliza CNPJ removendo caracteres especiais
 * @example "12.345.678/0001-00" → "12345678000100"
 */
export function normalizeCNPJ(cnpj: string): string {
    return cnpj.replace(/[^\d]/g, "");
}

/**
 * Valida CPF usando algoritmo do dígito verificador
 */
export function validateCPF(cpf: string): boolean {
    const cleaned = normalizeCPF(cpf);

    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false; // Todos dígitos iguais

    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;

    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;

    return true;
}

/**
 * Valida CNPJ usando algoritmo do dígito verificador
 */
export function validateCNPJ(cnpj: string): boolean {
    const cleaned = normalizeCNPJ(cnpj);

    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false; // Todos dígitos iguais

    // Validar primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(12))) return false;

    // Validar segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(13))) return false;

    return true;
}

/**
 * Normaliza CEP removendo caracteres especiais
 * @example "12345-678" → "12345678"
 */
export function normalizeCEP(cep: string): string {
    return cep.replace(/[^\d]/g, "");
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 * @example "(11) 98765-4321" → válido
 */
export function isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[^\d]/g, "");
    return cleaned.length === 10 || cleaned.length === 11;
}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema para endereço
 */
export const AddressSchema = z.object({
    street: z.string().min(3, "Rua deve ter no mínimo 3 caracteres"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(3, "Bairro deve ter no mínimo 3 caracteres"),
    city: z.string().min(3, "Cidade deve ter no mínimo 3 caracteres"),
    state: z.string().length(2, "Estado deve ter 2 caracteres (UF)").toUpperCase(),
    postal_code: z.string()
        .transform(normalizeCEP)
        .refine((cep) => cep.length === 8, "CEP deve ter 8 dígitos"),
});

/**
 * Schema para documentos anexos
 */
export const DocumentsSchema = z.object({
    cpf_cnpj: z.string().optional(),
    proof_of_income: z.string().optional(),
    proof_of_residence: z.string().optional(),
    bank_statement: z.string().optional(),
}).optional();

/**
 * Schema principal para CreditAnalysisInput
 * 
 * Validações de negócio:
 * - CPF/CNPJ válidos
 * - Email válido
 * - Telefone brasileiro
 * - Valores monetários positivos
 * - Prazos entre 6-120 meses
 * - Credit score 0-1000
 * - Employment time consistente com customer_type
 */
export const CreditAnalysisInputSchema = z.object({
    // References
    customer_id: z.string().uuid("customer_id deve ser UUID válido"),
    quote_id: z.string().uuid("quote_id deve ser UUID válido").optional(),
    solar_calculation_id: z.string().uuid("solar_calculation_id deve ser UUID válido").optional(),

    // Customer Basic Info
    customer_type: z.nativeEnum(CustomerType, {
        errorMap: () => ({ message: "customer_type deve ser 'individual' ou 'business'" }),
    }),
    full_name: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
    cpf_cnpj: z.string()
        .transform((val) => val.replace(/[^\d]/g, ""))
        .refine(
            (val) => {
                if (val.length === 11) return validateCPF(val);
                if (val.length === 14) return validateCNPJ(val);
                return false;
            },
            { message: "CPF ou CNPJ inválido" }
        ),
    birth_date: z.coerce.date().optional(),
    email: z.string().email("Email inválido"),
    phone: z.string()
        .refine(isValidPhone, "Telefone deve ter 10 ou 11 dígitos"),

    // Address
    address: AddressSchema,

    // Financial Data
    monthly_income: z.number()
        .positive("Renda mensal deve ser positiva")
        .min(500, "Renda mensal mínima: R$ 500"),
    annual_revenue: z.number()
        .positive("Faturamento anual deve ser positivo")
        .optional(),
    monthly_debts: z.number()
        .nonnegative("Dívidas mensais não podem ser negativas")
        .optional()
        .default(0),

    // Employment/Business
    occupation: z.string().optional(),
    employer: z.string().optional(),
    employment_status: z.nativeEnum(EmploymentStatus).optional(),
    employment_time_months: z.number()
        .int("Tempo de emprego deve ser inteiro")
        .nonnegative("Tempo de emprego não pode ser negativo")
        .optional(),
    foundation_years: z.number()
        .int("Anos de fundação deve ser inteiro")
        .nonnegative("Anos de fundação não pode ser negativo")
        .optional(),

    // Credit Bureau Data
    credit_score: z.number()
        .int("Credit score deve ser inteiro")
        .min(0, "Credit score mínimo: 0")
        .max(1000, "Credit score máximo: 1000")
        .optional(),
    has_negative_credit: z.boolean().optional().default(false),
    has_bankruptcy: z.boolean().optional().default(false),
    negative_records: z.number()
        .int("Número de negativações deve ser inteiro")
        .nonnegative("Número de negativações não pode ser negativo")
        .optional()
        .default(0),

    // Financing Request
    requested_amount: z.number()
        .positive("Valor solicitado deve ser positivo")
        .min(1000, "Valor mínimo: R$ 1.000")
        .max(10000000, "Valor máximo: R$ 10.000.000"),
    requested_term_months: z.number()
        .int("Prazo deve ser inteiro")
        .min(6, "Prazo mínimo: 6 meses")
        .max(120, "Prazo máximo: 120 meses"),
    financing_modality: z.nativeEnum(FinancingModality, {
        errorMap: () => ({ message: "Modalidade inválida" }),
    }),

    // Supporting Documents
    documents: DocumentsSchema,
})
    // Validação cross-field: PJ deve ter annual_revenue e foundation_years
    .refine(
        (data) => {
            if (data.customer_type === CustomerType.BUSINESS) {
                return data.annual_revenue !== undefined && data.foundation_years !== undefined;
            }
            return true;
        },
        {
            message: "Pessoa Jurídica deve informar faturamento anual e anos de fundação",
            path: ["customer_type"],
        }
    )
    // Validação cross-field: PF deve ter employment_time_months
    .refine(
        (data) => {
            if (data.customer_type === CustomerType.INDIVIDUAL) {
                return data.employment_time_months !== undefined;
            }
            return true;
        },
        {
            message: "Pessoa Física deve informar tempo de emprego",
            path: ["employment_time_months"],
        }
    )
    // Validação: debt-to-income ratio não pode exceder 100%
    .refine(
        (data) => {
            const debtRatio = (data.monthly_debts || 0) / data.monthly_income;
            return debtRatio <= 1.0;
        },
        {
            message: "Dívidas mensais não podem exceder 100% da renda",
            path: ["monthly_debts"],
        }
    );

/**
 * Schema para query de análises
 */
export const CreditAnalysisQuerySchema = z.object({
    customer_id: z.string().uuid().optional(),
    quote_id: z.string().uuid().optional(),
    status: z.nativeEnum(AnalysisStatus).optional(),
    risk_level: z.nativeEnum(RiskLevel).optional(),
    min_score: z.coerce.number().min(0).max(100).optional(),
    max_score: z.coerce.number().min(0).max(100).optional(),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    offset: z.coerce.number().int().nonnegative().optional().default(0),
    fields: z.string().optional(),
}).refine(
    (data) => {
        if (data.min_score !== undefined && data.max_score !== undefined) {
            return data.min_score <= data.max_score;
        }
        return true;
    },
    {
        message: "min_score deve ser menor ou igual a max_score",
        path: ["min_score"],
    }
);

/**
 * Schema para gerar ofertas de financiamento
 */
export const GenerateOffersInputSchema = z.object({
    credit_analysis_id: z.string().uuid("credit_analysis_id deve ser UUID válido"),
    approved_amount: z.number()
        .positive("Valor aprovado deve ser positivo")
        .min(1000, "Valor mínimo: R$ 1.000"),
    approved_term_months: z.number()
        .int("Prazo deve ser inteiro")
        .min(6, "Prazo mínimo: 6 meses")
        .max(120, "Prazo máximo: 120 meses"),
    base_interest_rate: z.number()
        .positive("Taxa de juros deve ser positiva")
        .min(0.001, "Taxa mínima: 0.1% a.m.")
        .max(0.10, "Taxa máxima: 10% a.m."),
    use_bacen_only: z.boolean().optional().default(false),
});

/**
 * Schema para cálculo de CET
 */
export const CETCalculationInputSchema = z.object({
    principal: z.number()
        .positive("Principal deve ser positivo")
        .min(1000, "Valor mínimo: R$ 1.000"),
    term_months: z.number()
        .int("Prazo deve ser inteiro")
        .min(1, "Prazo mínimo: 1 mês")
        .max(120, "Prazo máximo: 120 meses"),
    interest_rate_monthly: z.number()
        .positive("Taxa mensal deve ser positiva")
        .min(0.001, "Taxa mínima: 0.1% a.m.")
        .max(0.10, "Taxa máxima: 10% a.m."),
    iof: z.number().nonnegative("IOF não pode ser negativo").optional(),
    tac: z.number().nonnegative("TAC não pode ser negativa").optional(),
    insurance_monthly: z.number().nonnegative("Seguro mensal não pode ser negativo").optional(),
});

// ============================================================================
// Type Exports (infer from schemas)
// ============================================================================

export type CreditAnalysisInputDTO = z.infer<typeof CreditAnalysisInputSchema>;
export type CreditAnalysisQueryDTO = z.infer<typeof CreditAnalysisQuerySchema>;
export type GenerateOffersInputDTO = z.infer<typeof GenerateOffersInputSchema>;
export type CETCalculationInputDTO = z.infer<typeof CETCalculationInputSchema>;
