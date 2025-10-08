/**
 * 💳 Credit Analysis Service
 * Serviço para análise de crédito de clientes solares
 * 
 * Funcionalidades:
 * - Criar análise de crédito
 * - Validar dados do cliente
 * - Calcular score de aprovação
 * - Buscar melhores condições de financiamento
 * - Integrar com bancos parceiros
 */

import { MedusaService } from "@medusajs/framework/utils"

export interface CreditAnalysisInput {
    // Relacionamentos
    customer_id: string
    quote_id?: string
    solar_calculation_id?: string

    // Tipo de cliente
    customer_type: "individual" | "business"

    // Dados Pessoais
    full_name: string
    cpf_cnpj: string
    birth_date?: Date
    company_foundation_date?: Date

    // Contato
    email: string
    phone: string
    mobile_phone?: string

    // Endereço
    address: {
        street: string
        number: string
        complement?: string
        neighborhood: string
        city: string
        state: string
        zip: string
        country: string
    }

    // Dados Financeiros
    monthly_income?: number
    annual_revenue?: number
    occupation?: string
    employer?: string
    employment_time_months?: number

    // Crédito
    credit_score?: number
    has_negative_credit?: boolean
    has_bankruptcy?: boolean
    monthly_debts?: number

    // Financiamento
    requested_amount: number
    requested_term_months: number
    financing_modality?: "CDC" | "LEASING" | "EAAS" | "CASH"
    has_down_payment?: boolean
    down_payment_amount?: number

    // Documentos
    documents?: Record<string, string>

    // Metadados
    customer_notes?: string
    submission_source?: string
    ip_address?: string
    user_agent?: string
}

export interface CreditAnalysisResult {
    approved: boolean
    approved_amount?: number
    approved_term_months?: number
    approved_interest_rate?: number
    approval_conditions?: string[]
    rejection_reason?: string
    recommended_actions?: string[]
}

export interface CreditScoreFactors {
    income_score: number           // 0-30 pontos
    employment_score: number       // 0-15 pontos
    credit_history_score: number   // 0-35 pontos
    debt_ratio_score: number       // 0-20 pontos
    total_score: number            // 0-100 pontos
}

export default class CreditAnalysisService extends MedusaService({}) {
    /**
     * Cria nova análise de crédito
     */
    async createCreditAnalysis(input: CreditAnalysisInput): Promise<any> {
        // Validar dados obrigatórios
        this.validateInput(input)

        // Calcular relação dívida/renda
        const debtToIncomeRatio = this.calculateDebtToIncomeRatio(
            input.monthly_debts || 0,
            input.monthly_income || input.annual_revenue ? (input.annual_revenue! / 12) : 0
        )

        // Criar análise (retorna dados para persistência externa)
        const analysisData = {
            customer_id: input.customer_id,
            quote_id: input.quote_id,
            solar_calculation_id: input.solar_calculation_id,
            customer_type: input.customer_type,
            full_name: input.full_name,
            cpf_cnpj: input.cpf_cnpj,
            birth_date: input.birth_date,
            company_foundation_date: input.company_foundation_date,
            email: input.email,
            phone: input.phone,
            mobile_phone: input.mobile_phone,
            address: input.address,
            monthly_income: input.monthly_income,
            annual_revenue: input.annual_revenue,
            occupation: input.occupation,
            employer: input.employer,
            employment_time_months: input.employment_time_months,
            credit_score: input.credit_score,
            has_negative_credit: input.has_negative_credit || false,
            has_bankruptcy: input.has_bankruptcy || false,
            monthly_debts: input.monthly_debts,
            debt_to_income_ratio: debtToIncomeRatio,
            requested_amount: input.requested_amount,
            requested_term_months: input.requested_term_months,
            financing_modality: input.financing_modality || "CDC",
            has_down_payment: input.has_down_payment || false,
            down_payment_amount: input.down_payment_amount,
            documents: input.documents || {},
            customer_notes: input.customer_notes,
            submission_source: input.submission_source || "api",
            ip_address: input.ip_address,
            user_agent: input.user_agent,
            submitted_at: new Date(),
            status: "pending",
        }

        // Nota: A persistência real será feita via API route usando o model diretamente
        return analysisData
    }

    /**
     * Analisa crédito automaticamente
     * Nota: analysis deve ser passado como parâmetro
     */
    async analyzeCreditAutomatically(analysis: any): Promise<CreditAnalysisResult> {
        if (!analysis) {
            throw new Error(`Credit analysis ${analysisId} not found`)
        }

        // Calcular score interno
        const scoreFactors = this.calculateCreditScore(analysis)

        // Determinar aprovação baseado no score
        const approved = scoreFactors.total_score >= 60 &&
            !analysis.has_negative_credit &&
            !analysis.has_bankruptcy &&
            (analysis.debt_to_income_ratio || 0) < 0.5

        // Calcular taxa de juros baseada no score
        const baseRate = 0.015 // 1.5% a.m. base
        const scoreDiscount = (scoreFactors.total_score - 60) * 0.0001 // Até 0.4% de desconto
        const interestRate = approved ? Math.max(0.01, baseRate - scoreDiscount) : baseRate

        // Montar resultado
        const result: CreditAnalysisResult = {
            approved,
            approved_amount: approved ? analysis.requested_amount : undefined,
            approved_term_months: approved ? analysis.requested_term_months : undefined,
            approved_interest_rate: approved ? interestRate : undefined,
            approval_conditions: approved ? this.getApprovalConditions(analysis, scoreFactors) : undefined,
            rejection_reason: approved ? undefined : this.getRejectionReason(analysis, scoreFactors),
            recommended_actions: approved ? [] : this.getRecommendedActions(analysis, scoreFactors)
        }

        // Retornar resultado (atualização será feita externamente)
        return result
    }

    /**
     * Calcula score de crédito interno (0-100)
     */
    private calculateCreditScore(analysis: any): CreditScoreFactors {
        const factors: CreditScoreFactors = {
            income_score: 0,
            employment_score: 0,
            credit_history_score: 0,
            debt_ratio_score: 0,
            total_score: 0
        }

        // 1. Renda (0-30 pontos)
        const income = analysis.monthly_income || (analysis.annual_revenue ? analysis.annual_revenue / 12 : 0)
        if (income >= 10000) factors.income_score = 30
        else if (income >= 5000) factors.income_score = 20
        else if (income >= 3000) factors.income_score = 15
        else if (income >= 1500) factors.income_score = 10
        else factors.income_score = 5

        // 2. Emprego/Empresa (0-15 pontos)
        if (analysis.customer_type === "business") {
            // PJ: avaliar tempo de fundação
            const foundationYears = analysis.company_foundation_date
                ? (new Date().getTime() - new Date(analysis.company_foundation_date).getTime()) / (1000 * 60 * 60 * 24 * 365)
                : 0
            if (foundationYears >= 5) factors.employment_score = 15
            else if (foundationYears >= 3) factors.employment_score = 12
            else if (foundationYears >= 1) factors.employment_score = 8
            else factors.employment_score = 5
        } else {
            // PF: avaliar tempo de emprego
            const employmentMonths = analysis.employment_time_months || 0
            if (employmentMonths >= 36) factors.employment_score = 15
            else if (employmentMonths >= 24) factors.employment_score = 12
            else if (employmentMonths >= 12) factors.employment_score = 8
            else if (employmentMonths >= 6) factors.employment_score = 5
            else factors.employment_score = 2
        }

        // 3. Histórico de crédito (0-35 pontos)
        const creditScore = analysis.credit_score || 0
        if (creditScore >= 750) factors.credit_history_score = 35
        else if (creditScore >= 700) factors.credit_history_score = 30
        else if (creditScore >= 650) factors.credit_history_score = 25
        else if (creditScore >= 600) factors.credit_history_score = 20
        else if (creditScore >= 550) factors.credit_history_score = 15
        else if (creditScore >= 500) factors.credit_history_score = 10
        else factors.credit_history_score = 5

        // Penalidades
        if (analysis.has_negative_credit) factors.credit_history_score -= 20
        if (analysis.has_bankruptcy) factors.credit_history_score -= 35

        factors.credit_history_score = Math.max(0, factors.credit_history_score)

        // 4. Relação dívida/renda (0-20 pontos)
        const debtRatio = analysis.debt_to_income_ratio || 0
        if (debtRatio === 0) factors.debt_ratio_score = 20
        else if (debtRatio < 0.2) factors.debt_ratio_score = 18
        else if (debtRatio < 0.3) factors.debt_ratio_score = 15
        else if (debtRatio < 0.4) factors.debt_ratio_score = 10
        else if (debtRatio < 0.5) factors.debt_ratio_score = 5
        else factors.debt_ratio_score = 0

        // Total
        factors.total_score = factors.income_score +
            factors.employment_score +
            factors.credit_history_score +
            factors.debt_ratio_score

        return factors
    }

    /**
     * Valida entrada de dados
     */
    private validateInput(input: CreditAnalysisInput): void {
        const errors: string[] = []

        if (!input.customer_id) errors.push("customer_id é obrigatório")
        if (!input.full_name) errors.push("full_name é obrigatório")
        if (!input.cpf_cnpj) errors.push("cpf_cnpj é obrigatório")
        if (!input.email) errors.push("email é obrigatório")
        if (!input.phone) errors.push("phone é obrigatório")
        if (!input.requested_amount || input.requested_amount <= 0) errors.push("requested_amount inválido")
        if (!input.requested_term_months || input.requested_term_months <= 0) errors.push("requested_term_months inválido")

        // Validar CPF/CNPJ
        if (input.cpf_cnpj) {
            const numbers = input.cpf_cnpj.replace(/\D/g, "")
            if (input.customer_type === "individual" && numbers.length !== 11) {
                errors.push("CPF inválido (deve ter 11 dígitos)")
            }
            if (input.customer_type === "business" && numbers.length !== 14) {
                errors.push("CNPJ inválido (deve ter 14 dígitos)")
            }
        }

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(", ")}`)
        }
    }

    /**
     * Calcula relação dívida/renda
     */
    private calculateDebtToIncomeRatio(monthlyDebts: number, monthlyIncome: number): number {
        if (monthlyIncome === 0) return 1 // Renda zero = ratio máximo
        return monthlyDebts / monthlyIncome
    }

    /**
     * Retorna condições de aprovação
     */
    private getApprovalConditions(analysis: any, scoreFactors: CreditScoreFactors): string[] {
        const conditions: string[] = []

        if (scoreFactors.total_score < 70) {
            conditions.push("Entrada mínima de 20% recomendada")
        }

        if (analysis.credit_score && analysis.credit_score < 650) {
            conditions.push("Seguro de crédito obrigatório")
        }

        if (analysis.debt_to_income_ratio > 0.3) {
            conditions.push("Limitação de prazo a 48 meses")
        }

        if (analysis.customer_type === "business" && analysis.annual_revenue) {
            const maxFinancing = analysis.annual_revenue * 0.5
            if (analysis.requested_amount > maxFinancing) {
                conditions.push(`Valor limitado a 50% do faturamento anual (R$ ${maxFinancing.toFixed(2)})`)
            }
        }

        return conditions
    }

    /**
     * Retorna motivo da rejeição
     */
    private getRejectionReason(analysis: any, scoreFactors: CreditScoreFactors): string {
        if (analysis.has_bankruptcy) {
            return "Histórico de falência detectado"
        }

        if (analysis.has_negative_credit) {
            return "Restrições no CPF/CNPJ (Serasa/SPC)"
        }

        if (analysis.debt_to_income_ratio >= 0.5) {
            return "Comprometimento de renda acima de 50%"
        }

        if (scoreFactors.total_score < 40) {
            return "Score de crédito insuficiente"
        }

        if (!analysis.monthly_income && !analysis.annual_revenue) {
            return "Renda não comprovada"
        }

        return "Perfil de crédito não atende aos requisitos mínimos"
    }

    /**
     * Retorna ações recomendadas para aprovação
     */
    private getRecommendedActions(analysis: any, scoreFactors: CreditScoreFactors): string[] {
        const actions: string[] = []

        if (analysis.has_negative_credit) {
            actions.push("Regularizar pendências no Serasa/SPC")
        }

        if (!analysis.credit_score || analysis.credit_score < 600) {
            actions.push("Melhorar score de crédito (pagar contas em dia, reduzir dívidas)")
        }

        if (analysis.debt_to_income_ratio > 0.4) {
            actions.push("Reduzir dívidas mensais ou aumentar renda comprovada")
        }

        if (!analysis.has_down_payment) {
            actions.push("Considerar entrada de 20-30% do valor total")
        }

        if (analysis.requested_term_months > 60) {
            actions.push("Reduzir prazo de financiamento para até 60 meses")
        }

        if (scoreFactors.income_score < 15) {
            actions.push("Apresentar comprovação de renda adicional")
        }

        return actions
    }

    /**
     * Retorna data de expiração da aprovação (90 dias)
     */
    private getExpirationDate(): Date {
        const date = new Date()
        date.setDate(date.getDate() + 90)
        return date
    }

}
