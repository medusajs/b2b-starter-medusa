/**
 * PAYMENT CALCULATION API
 * Endpoints para calcular valores com taxas Asaas e splits
 * 
 * POST /api/payment/calculate - Calcula valor final com taxas
 * POST /api/payment/process - Cria cobrança no Asaas e registra splits
 * GET /api/payment/methods - Lista métodos disponíveis com taxas
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { calculatePaymentWithFeesWorkflow } from "../../../workflows/calculate-payment-with-fees"

/**
 * POST /api/payment/calculate
 * Calcula o valor final com todas as taxas incluídas
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const {
            product_id,
            distributor_code,
            quantity,
            payment_method,
            installments,
            enable_advance,
            notifications,
            include_fees_in_price,
        } = req.body

        // Validação
        if (!product_id || !distributor_code || !quantity || !payment_method) {
            res.status(400).json({
                error: "Missing required fields",
                required: ["product_id", "distributor_code", "quantity", "payment_method"],
            })
            return
        }

        // Valida método de pagamento
        const validMethods = ["boleto", "credit_card", "debit_card", "pix_dynamic", "pix_static"]
        if (!validMethods.includes(payment_method)) {
            res.status(400).json({
                error: "Invalid payment_method",
                allowed: validMethods,
            })
            return
        }

        // Executa workflow de cálculo
        const { result } = await calculatePaymentWithFeesWorkflow(req.scope).run({
            input: {
                product_id,
                distributor_code,
                quantity,
                payment_method,
                installments: installments || 1,
                enable_advance: enable_advance || false,
                notifications: notifications || [],
                include_fees_in_price: include_fees_in_price !== false,  // default true
            },
        })

        // Retorna breakdown completo
        res.status(200).json({
            calculation: result,
            calculation_timestamp: new Date().toISOString(),
            notes: {
                fees_bearer: include_fees_in_price !== false ? "customer" : "platform",
                settlement_info: "Gateway fees applied according to Asaas pricing table (Oct 2025)",
            },
        })
    } catch (error) {
        console.error("Payment calculation error:", error)
        res.status(500).json({
            error: "Failed to calculate payment",
            message: error.message,
        })
    }
}

/**
 * GET /api/payment/methods
 * Lista métodos de pagamento disponíveis com taxas
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const query = req.scope.resolve("query")

        // Load payment gateway config
        const gateway = await query.graph({
            entity: "payment_gateway",
            fields: [
                "id",
                "gateway_provider",
                "enabled_methods",
                "boleto_fee_brl",
                "boleto_settlement_days",
                "credit_card_fee_single_percent",
                "credit_card_fee_2_6_installments_percent",
                "credit_card_fee_7_12_installments_percent",
                "credit_card_fee_13_21_installments_percent",
                "credit_card_settlement_days",
                "debit_card_fee_percent",
                "debit_card_settlement_days",
                "pix_dynamic_fee_brl",
                "pix_static_fee_brl",
                "email_sms_fee_brl",
                "whatsapp_fee_brl",
                "voice_robot_fee_brl",
                "mail_fee_brl",
            ],
            filters: { environment: "production" },
        })

        if (!gateway || !gateway.data || gateway.data.length === 0) {
            res.status(404).json({
                error: "Payment gateway not configured",
            })
            return
        }

        const config = gateway.data[0]

        // Formata métodos de pagamento
        const methods = [
            {
                method: "boleto",
                name: "Boleto Bancário",
                fee_type: "fixed",
                fee_fixed_brl: config.boleto_fee_brl,
                settlement_days: config.boleto_settlement_days,
                installments_supported: false,
                advance_supported: true,
                advance_monthly_percent: 4.19,
            },
            {
                method: "credit_card",
                name: "Cartão de Crédito",
                fee_type: "percentage",
                fee_ranges: [
                    {
                        installments: "1 (à vista)",
                        fee_percent: config.credit_card_fee_single_percent,
                    },
                    {
                        installments: "2-6",
                        fee_percent: config.credit_card_fee_2_6_installments_percent,
                    },
                    {
                        installments: "7-12",
                        fee_percent: config.credit_card_fee_7_12_installments_percent,
                    },
                    {
                        installments: "13-21",
                        fee_percent: config.credit_card_fee_13_21_installments_percent,
                    },
                ],
                settlement_days: config.credit_card_settlement_days,
                installments_supported: true,
                installments_max: 21,
                advance_supported: true,
                advance_monthly_percent: 1.89,
            },
            {
                method: "debit_card",
                name: "Cartão de Débito",
                fee_type: "percentage",
                fee_percent: config.debit_card_fee_percent,
                settlement_days: config.debit_card_settlement_days,
                installments_supported: false,
                advance_supported: false,
            },
            {
                method: "pix_dynamic",
                name: "PIX Dinâmico (QR Code)",
                fee_type: "fixed",
                fee_fixed_brl: config.pix_dynamic_fee_brl,
                settlement_seconds: 10,
                installments_supported: false,
                advance_supported: false,
            },
            {
                method: "pix_static",
                name: "PIX (Chave/Manual/QR Code Estático)",
                fee_type: "fixed",
                fee_fixed_brl: config.pix_static_fee_brl,
                settlement_seconds: 10,
                installments_supported: false,
                advance_supported: false,
            },
        ]

        // Notificações disponíveis
        const notifications = [
            {
                type: "email_sms",
                name: "Email e SMS",
                fee_brl: config.email_sms_fee_brl,
                description: "GRATUITO - Lembre seu cliente sem custo",
            },
            {
                type: "whatsapp",
                name: "WhatsApp",
                fee_brl: config.whatsapp_fee_brl,
                description: "Notificação via WhatsApp",
            },
            {
                type: "voice_robot",
                name: "Robô de Voz",
                fee_brl: config.voice_robot_fee_brl,
                description: "Ligação automatizada para cobrança",
            },
            {
                type: "mail",
                name: "Correios",
                fee_brl: config.mail_fee_brl,
                description: "Carta física (entrega em ~7 dias)",
            },
        ]

        res.status(200).json({
            gateway_provider: config.gateway_provider,
            payment_methods: methods,
            notifications,
            additional_services: {
                advance_payment: {
                    description: "Antecipe o recebimento em até 2-3 dias úteis",
                    fees: {
                        boleto: "4,19% ao mês",
                        credit_card_single: "1,89% ao mês",
                        credit_card_installment: "1,89% ao mês",
                    },
                },
                serasa: {
                    negativation_fee_brl: 9.99,
                    query_fee_brl: 16.99,
                    description: "Negativação e consulta (apenas PJ)",
                },
                subaccounts: {
                    monthly_fee_brl: 12.90,
                    description: "Subcontas para splits automáticos",
                },
            },
        })
    } catch (error) {
        console.error("Payment methods error:", error)
        res.status(500).json({
            error: "Failed to load payment methods",
            message: error.message,
        })
    }
}
