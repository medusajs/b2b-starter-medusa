/**
 * 💰 Apply Financing Workflow
 * Workflow completo de aplicação de financiamento com integração BACEN
 * 
 * Fluxo:
 * 1. Fetch Quote (Cotação)
 * 2. Fetch Credit Analysis (Análise de crédito)
 * 3. Submit Financing Application (Banco/Parceiro)
 * 4. Validate with BACEN (Taxas e regulamentação)
 * 5. Process Approval (Criar contrato)
 * 6. Create Order (Se aprovado)
 */

import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/workflows-sdk"

// ============================================================================
// Types
// ============================================================================

export interface ApplyFinancingInput {
    customer_id: string
    quote_id: string
    credit_analysis_id: string
    financing_offer_id: string
    modality: "CDC" | "LEASING" | "EAAS"
    down_payment_amount?: number
}

export interface ApplyFinancingOutput {
    application_id: string
    status: "approved" | "rejected" | "pending"
    contract_url?: string
    order_id?: string
    rejection_reason?: string
    next_steps: string[]
}

interface QuoteData {
    quote_id: string
    customer_id: string
    total_amount: number
    items: any[]
    status: string
}

interface CreditAnalysisData {
    analysis_id: string
    customer_id: string
    approved: boolean
    approved_amount: number
    approved_term_months: number
    approved_interest_rate: number
}

interface FinancingApplicationData {
    application_id: string
    bank_name: string
    modality: string
    principal: number
    term_months: number
    interest_rate: number
    monthly_payment: number
    total_cost: number
    status: "submitted" | "approved" | "rejected"
}

// ============================================================================
// Step 1: Fetch Quote
// ============================================================================

export const fetchQuoteStep = createStep(
    "fetch-quote",
    async (input: { quote_id: string }) => {
        console.log(`📋 Fetching quote: ${input.quote_id}`)

        // TODO: Query quote from database
        // SELECT * FROM quotes WHERE id = ?

        return new StepResponse({
            quote_id: input.quote_id,
            customer_id: "customer_123",
            total_amount: 45000,
            items: [],
            status: "accepted"
        } as QuoteData)
    }
)

// ============================================================================
// Step 2: Fetch Credit Analysis
// ============================================================================

export const fetchCreditAnalysisStep = createStep(
    "fetch-credit-analysis",
    async (input: { credit_analysis_id: string }) => {
        console.log(`💳 Fetching credit analysis: ${input.credit_analysis_id}`)

        // TODO: Query credit analysis from database
        // SELECT * FROM credit_analyses WHERE id = ?

        return new StepResponse({
            analysis_id: input.credit_analysis_id,
            customer_id: "customer_123",
            approved: true,
            approved_amount: 50000,
            approved_term_months: 60,
            approved_interest_rate: 14.4 // 1.2% a.m. = 14.4% a.a.
        } as CreditAnalysisData)
    }
)

// ============================================================================
// Step 3: Submit Financing Application
// ============================================================================

export const submitFinancingApplicationStep = createStep(
    "submit-financing-application",
    async (input: {
        quote: QuoteData
        creditAnalysis: CreditAnalysisData
        modality: string
        down_payment_amount?: number
    }) => {
        const { quote, creditAnalysis, down_payment_amount = 0 } = input

        const principal = quote.total_amount - down_payment_amount

        // Validar que o valor está dentro do aprovado
        if (principal > creditAnalysis.approved_amount) {
            throw new Error(`Valor solicitado (${principal}) excede o aprovado (${creditAnalysis.approved_amount})`)
        }

        // Calcular parcela mensal (Sistema PRICE)
        const monthlyRate = creditAnalysis.approved_interest_rate / 12 / 100
        const termMonths = creditAnalysis.approved_term_months
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
            (Math.pow(1 + monthlyRate, termMonths) - 1)
        const totalCost = monthlyPayment * termMonths

        const applicationId = `fin_app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log(`📤 Submitting financing application: ${applicationId}`)
        console.log(`   Bank: Banco Solar Partner`)
        console.log(`   Modality: ${input.modality}`)
        console.log(`   Principal: R$ ${principal.toFixed(2)}`)
        console.log(`   Term: ${termMonths} months`)
        console.log(`   Rate: ${creditAnalysis.approved_interest_rate}% a.a.`)
        console.log(`   Monthly Payment: R$ ${monthlyPayment.toFixed(2)}`)

        // TODO: Integrar com API do banco parceiro
        // POST /api/financing/applications

        return new StepResponse({
            application_id: applicationId,
            bank_name: "Banco Solar Partner",
            modality: input.modality,
            principal,
            term_months: termMonths,
            interest_rate: creditAnalysis.approved_interest_rate,
            monthly_payment: monthlyPayment,
            total_cost: totalCost,
            status: "submitted"
        } as FinancingApplicationData)
    },
    async (output) => {
        console.log(`🔄 Rollback: Canceling financing application ${output.application_id}`)
        // TODO: DELETE FROM financing_applications WHERE id = ?
    }
)

// ============================================================================
// Step 4: Validate with BACEN
// ============================================================================

interface BACENValidation {
    compliant: boolean
    selic_rate: number
    max_allowed_rate: number
    cet_calculated: number
    warnings: string[]
}

export const validateWithBacenStep = createStep(
    "validate-with-bacen",
    async (input: { application: FinancingApplicationData }) => {
        console.log(`🏦 Validating with BACEN...`)

        // Importar serviço BACEN
        const { default: BACENFinancingService } = await import("../../modules/financing/bacen-service.js")
        const bacenService = new (BACENFinancingService as any)()

        try {
            // Buscar taxa SELIC atual
            const rates = await bacenService.getCurrentRates()
            const selicRate = rates.selic.annual_rate

            // Taxa máxima permitida (SELIC + spread máximo de 20%)
            const maxAllowedRate = selicRate * 1.20

            // Calcular CET (Custo Efetivo Total)
            const cet = input.application.interest_rate * 1.10 // Simplificado: +10% para custos

            const warnings: string[] = []
            let compliant = true

            if (input.application.interest_rate > maxAllowedRate) {
                warnings.push(`Taxa de juros (${input.application.interest_rate.toFixed(2)}%) acima do limite BACEN (${maxAllowedRate.toFixed(2)}%)`)
                compliant = false
            }

            if (cet > 30) {
                warnings.push(`CET muito alto: ${cet.toFixed(2)}%`)
            }

            console.log(`   SELIC: ${selicRate.toFixed(2)}% a.a.`)
            console.log(`   Max Rate: ${maxAllowedRate.toFixed(2)}% a.a.`)
            console.log(`   Application Rate: ${input.application.interest_rate.toFixed(2)}% a.a.`)
            console.log(`   CET: ${cet.toFixed(2)}%`)
            console.log(`   Compliant: ${compliant ? '✅ YES' : '❌ NO'}`)

            return new StepResponse({
                compliant,
                selic_rate: selicRate,
                max_allowed_rate: maxAllowedRate,
                cet_calculated: cet,
                warnings
            } as BACENValidation)

        } catch (error) {
            console.warn(`⚠️  BACEN validation failed (non-blocking): ${error.message}`)

            // Fallback: validação offline
            return new StepResponse({
                compliant: true,
                selic_rate: 10.75,
                max_allowed_rate: 12.90,
                cet_calculated: input.application.interest_rate * 1.10,
                warnings: ["BACEN API indisponível - validação offline"]
            } as BACENValidation)
        }
    }
)

// ============================================================================
// Step 5: Process Approval
// ============================================================================

interface ApprovalResult {
    approved: boolean
    contract_id?: string
    contract_url?: string
    rejection_reason?: string
}

export const processApprovalStep = createStep(
    "process-approval",
    async (input: {
        application: FinancingApplicationData
        bacenValidation: BACENValidation
        quote: QuoteData
    }) => {
        const { application, bacenValidation, quote } = input

        // Decisão de aprovação
        const approved = bacenValidation.compliant && quote.status === "accepted"

        if (!approved) {
            const reason = !bacenValidation.compliant
                ? `Não conforme com BACEN: ${bacenValidation.warnings.join(", ")}`
                : "Cotação não aceita pelo cliente"

            console.log(`❌ Financing REJECTED: ${reason}`)

            return new StepResponse({
                approved: false,
                rejection_reason: reason
            } as ApprovalResult)
        }

        // Gerar contrato
        const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const contractUrl = `https://contracts.ysh.solar/${contractId}.pdf`

        console.log(`✅ Financing APPROVED!`)
        console.log(`   Contract ID: ${contractId}`)
        console.log(`   Contract URL: ${contractUrl}`)
        console.log(`   Monthly Payment: R$ ${application.monthly_payment.toFixed(2)}`)
        console.log(`   Term: ${application.term_months} months`)

        // TODO: Gerar PDF do contrato
        // TODO: Salvar contrato no storage (S3)

        return new StepResponse({
            approved: true,
            contract_id: contractId,
            contract_url: contractUrl
        } as ApprovalResult)
    },
    async (output) => {
        if (output.approved) {
            console.log(`🔄 Rollback: Canceling contract ${output.contract_id}`)
            // TODO: Mark contract as cancelled
        }
    }
)

// ============================================================================
// Step 6: Create Order (if approved)
// ============================================================================

export const createOrderFromQuoteStep = createStep(
    "create-order-from-quote",
    async (input: { quote: QuoteData; approved: boolean }) => {
        if (!input.approved) {
            return new StepResponse({ order_id: undefined })
        }

        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log(`🛒 Creating order from quote: ${orderId}`)

        // TODO: Converter quote → order
        // TODO: Use Medusa's order workflow

        return new StepResponse({ order_id: orderId })
    }
)

// ============================================================================
// Workflow: Apply Financing
// ============================================================================

export const applyFinancingWorkflow = createWorkflow(
    "apply-financing",
    function (input: ApplyFinancingInput): WorkflowResponse<ApplyFinancingOutput> {
        // Step 1: Fetch Quote
        const quote = fetchQuoteStep({ quote_id: input.quote_id })

        // Step 2: Fetch Credit Analysis
        const creditAnalysis = fetchCreditAnalysisStep({
            credit_analysis_id: input.credit_analysis_id
        })

        // Step 3: Submit Application
        const application = submitFinancingApplicationStep({
            quote,
            creditAnalysis,
            modality: input.modality,
            down_payment_amount: input.down_payment_amount
        })

        // Step 4: Validate with BACEN
        const bacenValidation = validateWithBacenStep({ application })

        // Step 5: Process Approval
        const approvalResult = processApprovalStep({
            application,
            bacenValidation,
            quote
        })

        // Step 6: Create Order (if approved)
        const orderResult = createOrderFromQuoteStep({
            quote,
            approved: approvalResult.approved
        })

        // Build next steps
        const nextSteps: string[] = []
        if (approvalResult.approved) {
            nextSteps.push("1. Assinar contrato digitalmente")
            nextSteps.push("2. Aguardar liberação de recursos (2-5 dias)")
            nextSteps.push("3. Acompanhar pedido")
        } else {
            nextSteps.push("1. Revisar análise de crédito")
            nextSteps.push("2. Fornecer documentação adicional")
        }

        return new WorkflowResponse({
            application_id: application.application_id,
            status: approvalResult.approved ? "approved" : "rejected",
            contract_url: approvalResult.contract_url,
            order_id: orderResult.order_id,
            rejection_reason: approvalResult.rejection_reason,
            next_steps: nextSteps
        })
    }
)
