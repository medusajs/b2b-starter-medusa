import { model } from "@medusajs/framework/utils"

/**
 * Credit Analysis Model
 * Modelo para armazenar análise de crédito de clientes
 * 
 * Relacionamentos:
 * - Pode ser vinculado a uma cotação (quote_id)
 * - Pode ser vinculado a um cálculo solar (solar_calculation_id)
 * - Pertence a um cliente (customer_id)
 */
export const CreditAnalysis = model.define("credit_analysis", {
    id: model.id({ prefix: "cred" }).primaryKey(),

    // Relacionamentos
    customer_id: model.text(),
    quote_id: model.text().nullable(),
    solar_calculation_id: model.text().nullable(),

    // Status da análise
    status: model
        .enum([
            "pending",       // Aguardando análise
            "in_review",     // Em análise
            "approved",      // Aprovado
            "rejected",      // Rejeitado
            "conditional",   // Aprovado com condições
        ])
        .default("pending"),

    // Dados Pessoais / Empresa
    customer_type: model.enum(["individual", "business"]), // PF ou PJ
    full_name: model.text(),
    cpf_cnpj: model.text(),
    birth_date: model.dateTime().nullable(), // Data de nascimento (PF)
    company_foundation_date: model.dateTime().nullable(), // Data de fundação (PJ)

    // Contato
    email: model.text(),
    phone: model.text(),
    mobile_phone: model.text().nullable(),

    // Endereço
    address: model.json(), // { street, number, complement, neighborhood, city, state, zip, country }

    // Dados Financeiros
    monthly_income: model.number().nullable(), // Renda mensal (PF) ou faturamento (PJ)
    annual_revenue: model.number().nullable(), // Faturamento anual (PJ)
    occupation: model.text().nullable(), // Profissão (PF)
    employer: model.text().nullable(), // Empregador (PF)
    employment_time_months: model.number().nullable(), // Tempo de emprego (PF)

    // Score e Crédito
    credit_score: model.number().nullable(), // Score de crédito (300-850)
    has_negative_credit: model.boolean().default(false), // Negativado?
    has_bankruptcy: model.boolean().default(false), // Falência?
    monthly_debts: model.number().nullable(), // Dívidas mensais totais
    debt_to_income_ratio: model.number().nullable(), // Relação dívida/renda

    // Financiamento Solicitado
    requested_amount: model.number(), // Valor solicitado
    requested_term_months: model.number(), // Prazo solicitado (meses)
    financing_modality: model.enum(["CDC", "LEASING", "EAAS", "CASH"]).default("CDC"),
    has_down_payment: model.boolean().default(false),
    down_payment_amount: model.number().nullable(),

    // Documentos (URLs ou base64)
    documents: model.json(), // { cpf/cnpj, rg, proof_income, proof_address, contract_social, etc. }

    // Resultado da Análise
    analysis_result: model.json().nullable(), // { approved_amount, interest_rate, conditions, bank_partner, etc. }
    approved_amount: model.number().nullable(),
    approved_term_months: model.number().nullable(),
    approved_interest_rate: model.number().nullable(),
    approval_conditions: model.json().nullable(), // Array de condições

    // Observações
    customer_notes: model.text().nullable(), // Observações do cliente
    analyst_notes: model.text().nullable(), // Observações do analista
    rejection_reason: model.text().nullable(), // Motivo da rejeição

    // Metadados
    submission_source: model.text().nullable(), // origem: "storefront", "admin", "api"
    ip_address: model.text().nullable(),
    user_agent: model.text().nullable(),

    // Timestamps
    submitted_at: model.dateTime(),
    reviewed_at: model.dateTime().nullable(),
    approved_at: model.dateTime().nullable(),
    rejected_at: model.dateTime().nullable(),
    expires_at: model.dateTime().nullable(), // Validade da aprovação
})

export default CreditAnalysis
