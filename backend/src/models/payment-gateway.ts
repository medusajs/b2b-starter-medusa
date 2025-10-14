/**
 * PAYMENT GATEWAY MODEL - Asaas Integration
 * Taxas oficiais da Asaas (válidas em Out/2025)
 * 
 * Features:
 * - Boleto, Cartão de Crédito/Débito, PIX
 * - Antecipação automática com taxas
 * - Notificações (Email, SMS, WhatsApp, Robô de Voz, Correios)
 * - Negativação Serasa
 */

import { model } from "@medusajs/framework/utils"

/**
 * ENUM: Payment Method Types
 */
export enum PaymentMethod {
    BOLETO = "boleto",
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    PIX_DYNAMIC = "pix_dynamic",
    PIX_STATIC = "pix_static",
    PIX_KEY = "pix_key",
}

/**
 * ENUM: Notification Types
 */
export enum NotificationType {
    EMAIL_SMS = "email_sms",           // GRATUITO
    VOICE_ROBOT = "voice_robot",       // R$ 0,55 por ligação
    MAIL = "mail",                      // R$ 2,91 por envio
    WHATSAPP = "whatsapp",             // R$ 0,55 por notificação
}

/**
 * ENUM: Advance Payment Types
 */
export enum AdvanceType {
    BOLETO = "boleto",                 // 4,19% ao mês
    CREDIT_CARD_SINGLE = "credit_card_single",   // 1,89% ao mês
    CREDIT_CARD_INSTALLMENT = "credit_card_installment",  // 1,89% ao mês
}

/**
 * MODEL: PaymentGateway
 * Gerencia configurações de pagamento e taxas da Asaas
 */
const PaymentGateway = model.define("payment_gateway", {
    id: model.id().primaryKey(),

    // Gateway Configuration
    gateway_provider: model.text().default("asaas"),
    api_key: model.text().nullable(),
    environment: model.enum(["production", "sandbox"]).default("sandbox"),

    // Payment Method Settings
    enabled_methods: model.json(), // Array: ["boleto", "credit_card", "pix_dynamic", ...]

    // Taxas Asaas - Boleto
    boleto_fee_brl: model.number().default(1.89),  // R$ 1,89 por boleto pago
    boleto_settlement_days: model.number().default(1),  // 1 dia útil após pagamento

    // Taxas Asaas - Cartão de Crédito (%)
    credit_card_fee_single_percent: model.number().default(2.89),  // À vista: 2,89%
    credit_card_fee_2_6_installments_percent: model.number().default(3.12),  // 2-6x: 3,12%
    credit_card_fee_7_12_installments_percent: model.number().default(3.44),  // 7-12x: 3,44%
    credit_card_fee_13_21_installments_percent: model.number().default(5.58),  // 13-21x: 5,58%
    credit_card_fixed_fee_brl: model.number().default(0.00),  // R$ 0,00 fixa
    credit_card_settlement_days: model.number().default(30),  // 30 dias

    // Taxas Asaas - Cartão de Débito (%)
    debit_card_fee_percent: model.number().default(1.89),  // 1,89%
    debit_card_fixed_fee_brl: model.number().default(0.00),  // R$ 0,00 fixa
    debit_card_settlement_days: model.number().default(3),  // 3 dias

    // Taxas Asaas - PIX
    pix_dynamic_fee_brl: model.number().default(1.89),  // R$ 1,89 por cobrança
    pix_static_fee_brl: model.number().default(1.89),  // R$ 1,89 por cobrança
    pix_settlement_seconds: model.number().default(10),  // Poucos segundos

    // Taxas de Notificação
    email_sms_fee_brl: model.number().default(0.00),  // GRATUITO
    voice_robot_fee_brl: model.number().default(0.55),  // R$ 0,55 por ligação
    mail_fee_brl: model.number().default(2.91),  // R$ 2,91 por envio (7 dias)
    whatsapp_fee_brl: model.number().default(0.55),  // R$ 0,55 por notificação

    // Taxas de Antecipação (% ao mês)
    advance_boleto_monthly_percent: model.number().default(4.19),  // 4,19% ao mês
    advance_credit_single_monthly_percent: model.number().default(1.89),  // 1,89% ao mês
    advance_credit_installment_monthly_percent: model.number().default(1.89),  // 1,89% ao mês
    advance_settlement_days: model.number().default(2),  // 2-3 dias úteis

    // Taxas de Movimentação Financeira
    transfer_main_account_fee_brl: model.number().default(0.00),  // GRATUITO
    transfer_under_250_fee_brl: model.number().default(3.49),  // Valores < R$ 250
    transfer_third_party_fee_brl: model.number().default(3.49),  // Contas de terceiro
    pix_transfer_fee_brl: model.number().default(3.49),  // R$ 3,49 (após 30 grátis)
    pix_free_transfers: model.number().default(30),  // Primeiras 30 grátis

    // Taxas Serasa (apenas PJ)
    serasa_negativation_fee_brl: model.number().default(9.99),  // R$ 9,99 por cobrança
    serasa_query_fee_brl: model.number().default(16.99),  // R$ 16,99 por consulta

    // Subcontas
    subaccount_monthly_fee_brl: model.number().default(12.90),  // R$ 12,90 por subconta

    // Metadata
    metadata: model.json().nullable(),

    created_at: model.dateTime().default(() => new Date()),
    updated_at: model.dateTime().default(() => new Date()),
})

/**
 * MODEL: PaymentTransaction
 * Registra transações de pagamento processadas
 */
const PaymentTransaction = model.define("payment_transaction", {
    id: model.id().primaryKey(),

    // Relacionamentos
    order_id: model.text().nullable().searchable(),  // Link para Medusa Order
    payment_gateway_id: model.text().searchable(),
    distributor_code: model.text().searchable(),  // FLV, NEO, FTS

    // Payment Details
    payment_method: model.enum(PaymentMethod),
    amount_brl: model.number(),  // Valor total da cobrança
    installments: model.number().default(1),  // Parcelas (1 = à vista)

    // Gateway Response
    asaas_charge_id: model.text().nullable(),  // ID da cobrança no Asaas
    asaas_status: model.text().nullable(),  // pending, confirmed, received, etc.
    payment_url: model.text().nullable(),  // URL de pagamento (boleto/PIX)
    qr_code: model.text().nullable(),  // QR Code PIX (base64)

    // Calculated Fees (Applied to Customer)
    gateway_fee_brl: model.number(),  // Taxa do gateway repassada
    notification_fee_brl: model.number().default(0),  // Taxa de notificação
    total_with_fees_brl: model.number(),  // Valor final com taxas

    // Settlement Info
    estimated_settlement_date: model.dateTime().nullable(),  // Data prevista de recebimento
    actual_settlement_date: model.dateTime().nullable(),  // Data real de recebimento
    settlement_amount_brl: model.number().nullable(),  // Valor líquido recebido

    // Advance Payment (Antecipação)
    advance_requested: model.boolean().default(false),
    advance_type: model.enum(AdvanceType).nullable(),
    advance_fee_brl: model.number().nullable(),
    advance_settlement_date: model.dateTime().nullable(),

    // Notifications Sent
    notifications_sent: model.json().nullable(),  // Array: [{type, sent_at, cost_brl}]

    // Status
    status: model.enum(["pending", "processing", "confirmed", "cancelled", "refunded"]).default("pending"),

    // Metadata
    metadata: model.json().nullable(),

    created_at: model.dateTime().default(() => new Date()),
    updated_at: model.dateTime().default(() => new Date()),
})

export default [PaymentGateway, PaymentTransaction]
