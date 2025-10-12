/**
 * 💳 Analyze Credit Workflow
 * Workflow completo de análise de crédito com score automático
 * 
 * Fluxo:
 * 1. Fetch Customer Credit Data (Customer + histórico)
 * 2. Calculate Credit Score (Algoritmo interno)
 * 3. Find Best Financing Offers (Bancos parceiros)
 * 4. Save Analysis (Persistência)
 * 5. Notify Customer (Email/SMS)
 */

import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/workflows-sdk"
import { CreditAnalysisInput, CreditAnalysisResult } from "../../modules/credit-analysis/service"

// ============================================================================
// Types
// ============================================================================

export interface AnalyzeCreditInput {
    customer_id: string
    quote_id?: string
    solar_calculation_id?: string
    requested_amount: number
    requested_term_months: number
    financing_modality?: "CDC" | "LEASING" | "EAAS" | "CASH"
}

export interface AnalyzeCreditOutput {
    analysis_id: string
    result: CreditAnalysisResult
    best_offers: FinancingOffer[]
    notification_sent: boolean
}

export interface FinancingOffer {
    bank_name: string
    modality: string
    approved_amount: number
    term_months: number
    interest_rate_annual: number
    monthly_payment: number
    total_cost: number
    conditions: string[]
}

// ============================================================================
// Step 1: Fetch Customer Credit Data
// ============================================================================

interface CustomerCreditData {
    customer_id: string
    full_name: string
    cpf_cnpj: string
    email: string
    phone: string
    customer_type: "individual" | "business"
    monthly_income?: number
    annual_revenue?: number
    credit_score?: number
    has_negative_credit: boolean
    monthly_debts?: number
    address: any
}

export const fetchCustomerCreditDataStep = createStep(
    "fetch-customer-credit-data",
    async (input: { customer_id: string }) => {
        // TODO: Query customer data from database
        // SELECT c.*, ca.credit_score, ca.has_negative_credit
        // FROM customers c
        // LEFT JOIN credit_analyses ca ON ca.customer_id = c.id
        // WHERE c.id = ?

        console.log(`📊 Fetching credit data for customer: ${input.customer_id}`)

        // Fallback mock data
        return new StepResponse({
            customer_id: input.customer_id,
            full_name: "Cliente Solar",
            cpf_cnpj: "12345678900",
            email: "cliente@example.com",
            phone: "(11) 99999-9999",
            customer_type: "individual",
            monthly_income: 5000,
            credit_score: 750,
            has_negative_credit: false,
            monthly_debts: 1200,
            address: {
                city: "São Paulo",
                state: "SP",
                zip: "01000-000"
            }
        } as CustomerCreditData)
    }
)

// ============================================================================
// Step 2: Calculate Credit Score
// ============================================================================

interface CreditScoreResult {
    total_score: number
    income_score: number
    employment_score: number
    credit_history_score: number
    debt_ratio_score: number
    risk_level: "low" | "medium" | "high"
    approval_probability: number
}

export const calculateCreditScoreStep = createStep(
    "calculate-credit-score",
    async (input: {
        customerData: CustomerCreditData
        requested_amount: number
        requested_term_months: number
    }) => {
        const { customerData, requested_amount } = input

        // Score de renda (0-30 pontos)
        const monthlyIncome = customerData.monthly_income || 0
        const incomeToLoanRatio = monthlyIncome > 0 ? requested_amount / (monthlyIncome * 12) : 10
        let incomeScore = 0
        if (incomeToLoanRatio < 2) incomeScore = 30
        else if (incomeToLoanRatio < 3) incomeScore = 25
        else if (incomeToLoanRatio < 5) incomeScore = 20
        else if (incomeToLoanRatio < 7) incomeScore = 10
        else incomeScore = 5

        // Score de emprego (0-15 pontos) - Simplified
        const employmentScore = monthlyIncome > 3000 ? 15 : monthlyIncome > 2000 ? 10 : 5

        // Score de histórico de crédito (0-35 pontos)
        let creditHistoryScore = 0
        if (customerData.credit_score) {
            if (customerData.credit_score >= 800) creditHistoryScore = 35
            else if (customerData.credit_score >= 700) creditHistoryScore = 30
            else if (customerData.credit_score >= 600) creditHistoryScore = 20
            else if (customerData.credit_score >= 500) creditHistoryScore = 10
            else creditHistoryScore = 5
        } else {
            creditHistoryScore = 15 // Sem histórico
        }

        if (customerData.has_negative_credit) {
            creditHistoryScore = Math.max(0, creditHistoryScore - 20)
        }

        // Score de endividamento (0-20 pontos)
        const monthlyDebts = customerData.monthly_debts || 0
        const debtRatio = monthlyIncome > 0 ? monthlyDebts / monthlyIncome : 1
        let debtRatioScore = 0
        if (debtRatio < 0.3) debtRatioScore = 20
        else if (debtRatio < 0.5) debtRatioScore = 15
        else if (debtRatio < 0.7) debtRatioScore = 10
        else debtRatioScore = 5

        // Total Score
        const totalScore = incomeScore + employmentScore + creditHistoryScore + debtRatioScore

        // Risk Level
        let riskLevel: "low" | "medium" | "high"
        let approvalProbability: number
        if (totalScore >= 75) {
            riskLevel = "low"
            approvalProbability = 0.95
        } else if (totalScore >= 50) {
            riskLevel = "medium"
            approvalProbability = 0.70
        } else {
            riskLevel = "high"
            approvalProbability = 0.30
        }

        console.log(`📈 Credit Score Calculated: ${totalScore}/100 (${riskLevel} risk)`)

        return new StepResponse({
            total_score: totalScore,
            income_score: incomeScore,
            employment_score: employmentScore,
            credit_history_score: creditHistoryScore,
            debt_ratio_score: debtRatioScore,
            risk_level: riskLevel,
            approval_probability: approvalProbability
        } as CreditScoreResult)
    }
)

// ============================================================================
// Step 3: Find Best Financing Offers
// ============================================================================

export const findBestFinancingOffersStep = createStep(
    "find-best-financing-offers",
    async (input: {
        scoreResult: CreditScoreResult
        requested_amount: number
        requested_term_months: number
        modality?: string
    }) => {
        const { scoreResult, requested_amount, requested_term_months } = input

        // Taxas de juros baseadas no score
        let baseRate = 0.0
        if (scoreResult.total_score >= 75) baseRate = 1.2 // 1.2% a.m.
        else if (scoreResult.total_score >= 50) baseRate = 1.8 // 1.8% a.m.
        else baseRate = 2.5 // 2.5% a.m.

        const offers: FinancingOffer[] = []

        // Oferta 1: CDC (Crédito Direto ao Consumidor)
        const cdcRate = baseRate
        const cdcMonthly = requested_amount * (cdcRate / 100) * Math.pow(1 + cdcRate / 100, requested_term_months) /
            (Math.pow(1 + cdcRate / 100, requested_term_months) - 1)

        offers.push({
            bank_name: "Banco Solar Partner",
            modality: "CDC",
            approved_amount: requested_amount,
            term_months: requested_term_months,
            interest_rate_annual: cdcRate * 12,
            monthly_payment: cdcMonthly,
            total_cost: cdcMonthly * requested_term_months,
            conditions: ["Sem garantia", "Aprovação em 48h"]
        })

        // Oferta 2: Leasing (taxa menor)
        const leasingRate = baseRate * 0.85
        const leasingMonthly = requested_amount * (leasingRate / 100) * Math.pow(1 + leasingRate / 100, requested_term_months) /
            (Math.pow(1 + leasingRate / 100, requested_term_months) - 1)

        offers.push({
            bank_name: "Leasing Solar S/A",
            modality: "LEASING",
            approved_amount: requested_amount,
            term_months: requested_term_months,
            interest_rate_annual: leasingRate * 12,
            monthly_payment: leasingMonthly,
            total_cost: leasingMonthly * requested_term_months,
            conditions: ["Equipamento como garantia", "Aprovação em 72h"]
        })

        // Oferta 3: EaaS (Energy as a Service) - sem entrada
        if (scoreResult.total_score >= 60) {
            const eaasRate = baseRate * 1.15
            const eaasMonthly = requested_amount * (eaasRate / 100) * Math.pow(1 + eaasRate / 100, requested_term_months) /
                (Math.pow(1 + eaasRate / 100, requested_term_months) - 1)

            offers.push({
                bank_name: "YSH Energy Solutions",
                modality: "EAAS",
                approved_amount: requested_amount,
                term_months: requested_term_months,
                interest_rate_annual: eaasRate * 12,
                monthly_payment: eaasMonthly,
                total_cost: eaasMonthly * requested_term_months,
                conditions: ["Sem entrada", "Manutenção inclusa", "Seguro incluso"]
            })
        }

        console.log(`💰 Found ${offers.length} financing offers`)

        return new StepResponse({ offers })
    }
)

// ============================================================================
// Step 4: Save Analysis
// ============================================================================

export const saveCreditAnalysisStep = createStep(
    "save-credit-analysis",
    async (input: {
        customer_id: string
        quote_id?: string
        solar_calculation_id?: string
        scoreResult: CreditScoreResult
        result: CreditAnalysisResult
        offers: FinancingOffer[]
    }) => {
        const analysisId = `credit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log(`💾 Credit analysis saved: ${analysisId}`)
        console.log(`   Customer: ${input.customer_id}`)
        console.log(`   Score: ${input.scoreResult.total_score}/100`)
        console.log(`   Approved: ${input.result.approved ? 'YES' : 'NO'}`)
        console.log(`   Best Rate: ${input.offers[0]?.interest_rate_annual.toFixed(2)}% a.a.`)

        // TODO: INSERT INTO credit_analyses (...)

        return new StepResponse({ analysis_id: analysisId })
    },
    async (output) => {
        console.log(`🔄 Rollback: Deleting credit analysis ${output.analysis_id}`)
        // TODO: DELETE FROM credit_analyses WHERE id = ?
    }
)

// ============================================================================
// Step 5: Notify Customer
// ============================================================================

export const notifyCustomerStep = createStep(
    "notify-customer",
    async (input: {
        customer_id: string
        customerData: CustomerCreditData
        result: CreditAnalysisResult
        offers: FinancingOffer[]
    }) => {
        console.log(`📧 Sending notification to ${input.customerData.email}`)
        console.log(`   Subject: ${input.result.approved ? 'Crédito Aprovado!' : 'Análise de Crédito Finalizada'}`)

        // TODO: Send email via SendGrid/Mailgun
        // TODO: Send SMS via Twilio

        return new StepResponse({ notification_sent: true })
    }
)

// ============================================================================
// Workflow: Analyze Credit
// ============================================================================

export const analyzeCreditWorkflow = createWorkflow(
    "analyze-credit",
    function (input: AnalyzeCreditInput): WorkflowResponse<AnalyzeCreditOutput> {
        // Step 1: Fetch Customer Data
        const customerData = fetchCustomerCreditDataStep({
            customer_id: input.customer_id
        })

        // Step 2: Calculate Score
        const scoreResult = calculateCreditScoreStep({
            customerData,
            requested_amount: input.requested_amount,
            requested_term_months: input.requested_term_months
        })

        // Step 3: Find Offers
        const offersResult = findBestFinancingOffersStep({
            scoreResult,
            requested_amount: input.requested_amount,
            requested_term_months: input.requested_term_months,
            modality: input.financing_modality
        })

        // Create result
        const result: CreditAnalysisResult = {
            approved: scoreResult.total_score >= 50,
            approved_amount: input.requested_amount,
            approved_term_months: input.requested_term_months,
            approved_interest_rate: offersResult.offers[0]?.interest_rate_annual,
            approval_conditions: offersResult.offers[0]?.conditions,
            rejection_reason: scoreResult.total_score < 50 ? "Score insuficiente" : undefined
        }

        // Step 4: Save Analysis
        const saveResult = saveCreditAnalysisStep({
            customer_id: input.customer_id,
            quote_id: input.quote_id,
            solar_calculation_id: input.solar_calculation_id,
            scoreResult,
            result,
            offers: offersResult.offers
        })

        // Step 5: Notify
        const notifyResult = notifyCustomerStep({
            customer_id: input.customer_id,
            customerData,
            result,
            offers: offersResult.offers
        })

        return new WorkflowResponse({
            analysis_id: saveResult.analysis_id,
            result,
            best_offers: offersResult.offers,
            notification_sent: notifyResult.notification_sent
        })
    }
)
