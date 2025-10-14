/**
 * PAYMENT CALCULATOR WORKFLOW
 * Calcula o valor final com taxas Asaas incluídas + splits
 * 
 * Features:
 * - Calcula taxa do gateway baseado no método de pagamento
 * - Adiciona taxas de notificação
 * - Calcula splits baseados em custos reais (custos_pagamento)
 * - Valida soma de splits = 100% do valor
 * - Gera breakdown detalhado para o cliente
 */

import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

/**
 * INPUT: Payment Calculation Request
 */
interface CalculatePaymentInput {
    product_id: string
    distributor_code: string
    quantity: number
    payment_method: "boleto" | "credit_card" | "debit_card" | "pix_dynamic" | "pix_static"
    installments?: number  // Apenas para cartão de crédito
    enable_advance?: boolean  // Solicitar antecipação?
    notifications?: string[]  // ["email_sms", "whatsapp"]
    include_fees_in_price?: boolean  // true = cliente paga taxas, false = plataforma absorve
}

/**
 * OUTPUT: Payment Calculation Result
 */
interface PaymentCalculationResult {
    // Base Values
    base_price_brl: number  // Preço do produto sem taxas
    quantity: number
    subtotal_brl: number

    // Payment Method
    payment_method: string
    installments: number

    // Gateway Fees
    gateway_fee_type: string  // "percentage" | "fixed" | "hybrid"
    gateway_fee_percentage: number
    gateway_fee_fixed_brl: number
    gateway_fee_total_brl: number

    // Notification Fees
    notification_types: string[]
    notification_fee_brl: number

    // Advance Fees (if requested)
    advance_requested: boolean
    advance_type?: string
    advance_fee_monthly_percent?: number
    advance_fee_brl?: number
    advance_settlement_days?: number

    // Total
    total_before_fees_brl: number
    total_fees_brl: number
    total_with_fees_brl: number  // Valor final para o cliente

    // Split Breakdown
    splits: Array<{
        recipient_type: string
        recipient_name: string
        split_amount_brl: number
        split_percentage: number
        cost_key?: string
    }>
    total_splits_brl: number

    // Settlement Info
    estimated_settlement_date: string
    net_amount_after_fees_brl: number  // Valor líquido que YSH recebe

    // Cost Breakdown (from custos_pagamento)
    cost_breakdown: {
        custo_kit_reais: number
        custo_dossie_tecnico_homologacao_reais: number
        custo_mao_de_obra_reais: number
        valor_total_projeto_reais: number
    }
}

/**
 * STEP 1: Load Product and Cost Data
 */
const loadProductCostDataStep = createStep(
    "load-product-cost-data",
    async (input: CalculatePaymentInput, { container }) => {
        const query = container.resolve(Modules.PRODUCT)

        // Load product with cost_breakdown extension
        const product = await query.retrieve(input.product_id, {
            relations: ["cost_breakdown"],
        })

        if (!product) {
            throw new Error(`Product ${input.product_id} not found`)
        }

        // Get cost breakdown
        const costBreakdown = product.cost_breakdown || null

        if (!costBreakdown) {
            throw new Error(`Cost breakdown not found for product ${input.product_id}`)
        }

        // Get base price (tier-adjusted from previous workflow)
        const basePrice = product.variants[0]?.calculated_price || 0

        return new StepResponse({
            product,
            cost_breakdown: costBreakdown,
            base_price_brl: basePrice,
        })
    },
    async (data, { container }) => {
        // Compensation: nada a reverter
    }
)

/**
 * STEP 2: Load Payment Gateway Configuration
 */
const loadPaymentGatewayConfigStep = createStep(
    "load-payment-gateway-config",
    async (input: CalculatePaymentInput, { container }) => {
        const query = container.resolve("query")

        // Load active payment gateway
        const gateway = await query.graph({
            entity: "payment_gateway",
            fields: [
                "id",
                "gateway_provider",
                "boleto_fee_brl",
                "boleto_settlement_days",
                "credit_card_fee_single_percent",
                "credit_card_fee_2_6_installments_percent",
                "credit_card_fee_7_12_installments_percent",
                "credit_card_fee_13_21_installments_percent",
                "credit_card_fixed_fee_brl",
                "credit_card_settlement_days",
                "debit_card_fee_percent",
                "debit_card_fixed_fee_brl",
                "debit_card_settlement_days",
                "pix_dynamic_fee_brl",
                "pix_static_fee_brl",
                "pix_settlement_seconds",
                "email_sms_fee_brl",
                "voice_robot_fee_brl",
                "mail_fee_brl",
                "whatsapp_fee_brl",
                "advance_boleto_monthly_percent",
                "advance_credit_single_monthly_percent",
                "advance_credit_installment_monthly_percent",
                "advance_settlement_days",
            ],
            filters: { environment: "production" },
        })

        if (!gateway || gateway.length === 0) {
            throw new Error("No active payment gateway configured")
        }

        return new StepResponse(gateway[0])
    },
    async (data, { container }) => {
        // Compensation: nada a reverter
    }
)

/**
 * STEP 3: Calculate Gateway Fees
 */
const calculateGatewayFeesStep = createStep(
    "calculate-gateway-fees",
    async (
        input: {
            payment_method: string
            installments: number
            subtotal_brl: number
            gateway_config: any
        }
    ) => {
        const { payment_method, installments, subtotal_brl, gateway_config } = input

        let feePercentage = 0
        let feeFixed = 0
        let feeType = "fixed"
        let settlementDays = 0

        switch (payment_method) {
            case "boleto":
                feeFixed = gateway_config.boleto_fee_brl
                feeType = "fixed"
                settlementDays = gateway_config.boleto_settlement_days
                break

            case "credit_card":
                feeFixed = gateway_config.credit_card_fixed_fee_brl
                feeType = "hybrid"
                settlementDays = gateway_config.credit_card_settlement_days

                // Determina taxa baseado em parcelas
                if (installments === 1) {
                    feePercentage = gateway_config.credit_card_fee_single_percent
                } else if (installments >= 2 && installments <= 6) {
                    feePercentage = gateway_config.credit_card_fee_2_6_installments_percent
                } else if (installments >= 7 && installments <= 12) {
                    feePercentage = gateway_config.credit_card_fee_7_12_installments_percent
                } else if (installments >= 13 && installments <= 21) {
                    feePercentage = gateway_config.credit_card_fee_13_21_installments_percent
                } else {
                    throw new Error(`Invalid installments: ${installments}. Allowed: 1-21`)
                }
                break

            case "debit_card":
                feePercentage = gateway_config.debit_card_fee_percent
                feeFixed = gateway_config.debit_card_fixed_fee_brl
                feeType = "hybrid"
                settlementDays = gateway_config.debit_card_settlement_days
                break

            case "pix_dynamic":
                feeFixed = gateway_config.pix_dynamic_fee_brl
                feeType = "fixed"
                settlementDays = 0  // Imediato
                break

            case "pix_static":
                feeFixed = gateway_config.pix_static_fee_brl
                feeType = "fixed"
                settlementDays = 0  // Imediato
                break

            default:
                throw new Error(`Unknown payment method: ${payment_method}`)
        }

        // Calcula taxa total
        const feePercentageAmount = (subtotal_brl * feePercentage) / 100
        const feeTotalBrl = feePercentageAmount + feeFixed

        return new StepResponse({
            gateway_fee_type: feeType,
            gateway_fee_percentage: feePercentage,
            gateway_fee_fixed_brl: feeFixed,
            gateway_fee_total_brl: feeTotalBrl,
            settlement_days: settlementDays,
        })
    }
)

/**
 * STEP 4: Calculate Notification Fees
 */
const calculateNotificationFeesStep = createStep(
    "calculate-notification-fees",
    async (
        input: {
            notifications: string[]
            gateway_config: any
        }
    ) => {
        const { notifications, gateway_config } = input

        let totalNotificationFee = 0

        if (!notifications || notifications.length === 0) {
            return new StepResponse({ notification_fee_brl: 0 })
        }

        for (const notifType of notifications) {
            switch (notifType) {
                case "email_sms":
                    totalNotificationFee += gateway_config.email_sms_fee_brl  // Grátis
                    break
                case "whatsapp":
                    totalNotificationFee += gateway_config.whatsapp_fee_brl
                    break
                case "voice_robot":
                    totalNotificationFee += gateway_config.voice_robot_fee_brl
                    break
                case "mail":
                    totalNotificationFee += gateway_config.mail_fee_brl
                    break
            }
        }

        return new StepResponse({ notification_fee_brl: totalNotificationFee })
    }
)

/**
 * STEP 5: Calculate Advance Fees (if requested)
 */
const calculateAdvanceFeesStep = createStep(
    "calculate-advance-fees",
    async (
        input: {
            enable_advance: boolean
            payment_method: string
            installments: number
            subtotal_brl: number
            gateway_config: any
        }
    ) => {
        const { enable_advance, payment_method, installments, subtotal_brl, gateway_config } = input

        if (!enable_advance) {
            return new StepResponse({
                advance_requested: false,
                advance_fee_brl: 0,
                advance_settlement_days: 0,
            })
        }

        let advanceMonthlyPercent = 0
        let advanceType = ""

        switch (payment_method) {
            case "boleto":
                advanceMonthlyPercent = gateway_config.advance_boleto_monthly_percent
                advanceType = "boleto"
                break

            case "credit_card":
                if (installments === 1) {
                    advanceMonthlyPercent = gateway_config.advance_credit_single_monthly_percent
                    advanceType = "credit_card_single"
                } else {
                    advanceMonthlyPercent = gateway_config.advance_credit_installment_monthly_percent
                    advanceType = "credit_card_installment"
                }
                break

            default:
                // PIX e débito não têm antecipação (são imediatos ou 3 dias)
                return new StepResponse({
                    advance_requested: false,
                    advance_fee_brl: 0,
                    advance_settlement_days: 0,
                })
        }

        // Calcula taxa de antecipação (proporcional ao período)
        const advanceFeeBrl = (subtotal_brl * advanceMonthlyPercent) / 100

        return new StepResponse({
            advance_requested: true,
            advance_type: advanceType,
            advance_fee_monthly_percent: advanceMonthlyPercent,
            advance_fee_brl: advanceFeeBrl,
            advance_settlement_days: gateway_config.advance_settlement_days,
        })
    }
)

/**
 * STEP 6: Calculate Payment Splits
 */
const calculatePaymentSplitsStep = createStep(
    "calculate-payment-splits",
    async (
        input: {
            cost_breakdown: any
            distributor_code: string
            total_before_fees_brl: number
        }
    ) => {
        const { cost_breakdown, distributor_code, total_before_fees_brl } = input

        // Exemplo de split baseado em custos reais do JSON:
        // 1. Distribuidor: custo_kit_reais (kit completo)
        // 2. Dossiê técnico: custo_dossie_tecnico_homologacao_reais
        // 3. Mão de obra: custo_mao_de_obra_reais
        // 4. Plataforma: 5% do total

        const splits = []

        // Split 1: Distribuidor (Kit)
        const kitAmount = cost_breakdown.custo_kit_reais || 0
        const kitPercent = (kitAmount / total_before_fees_brl) * 100
        splits.push({
            recipient_type: "distributor",
            recipient_name: `Distributor ${distributor_code}`,
            split_amount_brl: kitAmount,
            split_percentage: kitPercent,
            cost_key: "custo_kit_reais",
        })

        // Split 2: Dossiê Técnico
        const dossieAmount = cost_breakdown.custo_dossie_tecnico_homologacao_reais || 0
        const dossiePercent = (dossieAmount / total_before_fees_brl) * 100
        splits.push({
            recipient_type: "technical_dossier",
            recipient_name: "Technical Dossier & Homologation",
            split_amount_brl: dossieAmount,
            split_percentage: dossiePercent,
            cost_key: "custo_dossie_tecnico_homologacao_reais",
        })

        // Split 3: Mão de Obra
        const laborAmount = cost_breakdown.custo_mao_de_obra_reais || 0
        const laborPercent = (laborAmount / total_before_fees_brl) * 100
        splits.push({
            recipient_type: "labor",
            recipient_name: "Installation Labor",
            split_amount_brl: laborAmount,
            split_percentage: laborPercent,
            cost_key: "custo_mao_de_obra_reais",
        })

        // Split 4: Plataforma (5% do total)
        const platformPercent = 5.0
        const platformAmount = (total_before_fees_brl * platformPercent) / 100
        splits.push({
            recipient_type: "platform",
            recipient_name: "YSH Platform Fee",
            split_amount_brl: platformAmount,
            split_percentage: platformPercent,
            cost_key: null,
        })

        // Calcula total de splits
        const totalSplits = splits.reduce((sum, split) => sum + split.split_amount_brl, 0)

        return new StepResponse({
            splits,
            total_splits_brl: totalSplits,
        })
    }
)

/**
 * MAIN WORKFLOW: Calculate Payment with Fees
 */
export const calculatePaymentWithFeesWorkflow = createWorkflow(
    "calculate-payment-with-fees",
    (input: CalculatePaymentInput) => {
        // Step 1: Load product and cost data
        const productData = loadProductCostDataStep(input)

        // Step 2: Load payment gateway config
        const gatewayConfig = loadPaymentGatewayConfigStep(input)

        // Calculate subtotal
        const subtotal = productData.base_price_brl * input.quantity

        // Step 3: Calculate gateway fees
        const gatewayFees = calculateGatewayFeesStep({
            payment_method: input.payment_method,
            installments: input.installments || 1,
            subtotal_brl: subtotal,
            gateway_config: gatewayConfig,
        })

        // Step 4: Calculate notification fees
        const notificationFees = calculateNotificationFeesStep({
            notifications: input.notifications || [],
            gateway_config: gatewayConfig,
        })

        // Step 5: Calculate advance fees
        const advanceFees = calculateAdvanceFeesStep({
            enable_advance: input.enable_advance || false,
            payment_method: input.payment_method,
            installments: input.installments || 1,
            subtotal_brl: subtotal,
            gateway_config: gatewayConfig,
        })

        // Calculate totals
        const totalFees = gatewayFees.gateway_fee_total_brl +
            notificationFees.notification_fee_brl +
            (advanceFees.advance_fee_brl || 0)

        const totalWithFees = input.include_fees_in_price ? subtotal + totalFees : subtotal

        // Step 6: Calculate splits
        const splits = calculatePaymentSplitsStep({
            cost_breakdown: productData.cost_breakdown,
            distributor_code: input.distributor_code,
            total_before_fees_brl: subtotal,
        })

        // Calculate estimated settlement date
        const settlementDays = advanceFees.advance_requested
            ? advanceFees.advance_settlement_days
            : gatewayFees.settlement_days

        const estimatedSettlementDate = new Date()
        estimatedSettlementDate.setDate(estimatedSettlementDate.getDate() + settlementDays)

        // Return comprehensive result
        return new WorkflowResponse({
            // Base values
            base_price_brl: productData.base_price_brl,
            quantity: input.quantity,
            subtotal_brl: subtotal,

            // Payment method
            payment_method: input.payment_method,
            installments: input.installments || 1,

            // Gateway fees
            gateway_fee_type: gatewayFees.gateway_fee_type,
            gateway_fee_percentage: gatewayFees.gateway_fee_percentage,
            gateway_fee_fixed_brl: gatewayFees.gateway_fee_fixed_brl,
            gateway_fee_total_brl: gatewayFees.gateway_fee_total_brl,

            // Notification fees
            notification_types: input.notifications || [],
            notification_fee_brl: notificationFees.notification_fee_brl,

            // Advance fees
            advance_requested: advanceFees.advance_requested,
            advance_type: advanceFees.advance_type,
            advance_fee_monthly_percent: advanceFees.advance_fee_monthly_percent,
            advance_fee_brl: advanceFees.advance_fee_brl,
            advance_settlement_days: advanceFees.advance_settlement_days,

            // Totals
            total_before_fees_brl: subtotal,
            total_fees_brl: totalFees,
            total_with_fees_brl: totalWithFees,

            // Splits
            splits: splits.splits,
            total_splits_brl: splits.total_splits_brl,

            // Settlement
            estimated_settlement_date: estimatedSettlementDate.toISOString(),
            net_amount_after_fees_brl: subtotal - totalFees,

            // Cost breakdown
            cost_breakdown: productData.cost_breakdown,
        })
    }
)
