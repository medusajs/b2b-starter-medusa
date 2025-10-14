/**
 * PAYMENT SPLIT MODEL
 * Divisão de pagamentos entre múltiplas partes interessadas
 * 
 * Features:
 * - Split entre distribuidores, fornecedores, plataforma, mão de obra
 * - Taxas dinâmicas por tipo de parte
 * - Suporte a subcontas Asaas (R$ 12,90/mês cada)
 * - Rastreamento de repasses e liquidações
 */

import { model } from "@medusajs/framework/utils"

/**
 * ENUM: Split Recipient Types
 */
export enum SplitRecipientType {
    DISTRIBUTOR = "distributor",           // Distribuidor (FortLev, NeoSolar, FOTUS)
    MANUFACTURER = "manufacturer",         // Fabricante (Jinko, Growatt, etc.)
    PLATFORM = "platform",                 // Plataforma YSH
    LABOR = "labor",                       // Mão de obra (instalação)
    TECHNICAL_DOSSIER = "technical_dossier",  // Dossiê técnico + homologação
    BOS = "bos",                           // Balance of System (estrutura, cabos, etc.)
    LOGISTICS = "logistics",               // Logística e frete
    PARTNER = "partner",                   // Parceiros comerciais
}

/**
 * ENUM: Split Calculation Method
 */
export enum SplitCalculationMethod {
    PERCENTAGE = "percentage",             // % do valor total
    FIXED_AMOUNT = "fixed_amount",         // Valor fixo em BRL
    COST_BASED = "cost_based",             // Baseado em custos reais (JSON)
    DYNAMIC = "dynamic",                   // Calculado dinamicamente
}

/**
 * MODEL: PaymentSplitRecipient
 * Define os destinatários de splits e suas configurações
 */
const PaymentSplitRecipient = model.define("payment_split_recipient", {
    id: model.id().primaryKey(),

    // Recipient Identity
    recipient_type: model.enum(SplitRecipientType),
    recipient_code: model.text(),  // FLV, NEO, FTS, JINKO, GROWATT, YSH-PLATFORM, etc.
    recipient_name: model.text(),

    // Asaas Integration
    asaas_account_id: model.text().nullable(),  // ID da subconta no Asaas
    asaas_wallet_id: model.text().nullable(),  // ID da wallet (PIX key, etc.)
    subaccount_monthly_fee_brl: model.number().default(12.90),  // R$ 12,90/mês

    // Bank Information
    bank_code: model.text().nullable(),
    bank_agency: model.text().nullable(),
    bank_account: model.text().nullable(),
    bank_account_type: model.enum(["checking", "savings"]).nullable(),
    pix_key: model.text().nullable(),
    pix_key_type: model.enum(["cpf", "cnpj", "email", "phone", "random"]).nullable(),

    // Tax Information
    cpf_cnpj: model.text().nullable(),
    legal_name: model.text().nullable(),
    address: model.json().nullable(),

    // Default Split Configuration
    default_split_percentage: model.number().nullable(),  // % padrão (ex: 10%)
    default_split_fixed_brl: model.number().nullable(),  // Valor fixo padrão
    calculation_method: model.enum(SplitCalculationMethod).default("percentage"),

    // Commission & Fees
    commission_percentage: model.number().default(0),  // Comissão da plataforma sobre este recipient
    transfer_fee_brl: model.number().default(3.49),  // Taxa de transferência

    // Status
    active: model.boolean().default(true),
    verified: model.boolean().default(false),  // KYC verificado

    // Metadata
    metadata: model.json().nullable(),

    created_at: model.dateTime(),
    updated_at: model.dateTime(),
})

/**
 * MODEL: PaymentSplitRule
 * Define regras de split por produto/categoria/distribuidor
 */
const PaymentSplitRule = model.define("payment_split_rule", {
    id: model.id().primaryKey(),

    // Rule Identification
    rule_name: model.text(),
    rule_code: model.text().unique(),  // Ex: "SPLIT_KIT_FOTOVOLTAICO"

    // Aplicability
    distributor_codes: model.json().nullable(),  // Array: ["FLV", "NEO"] ou null = todos
    product_types: model.json().nullable(),  // Array: ["KIT", "PNL"] ou null = todos
    power_range_min_kwp: model.number().nullable(),  // Potência mínima
    power_range_max_kwp: model.number().nullable(),  // Potência máxima

    // Split Configuration
    split_recipients: model.json(),  // Array of objects:
    // [
    //   {
    //     recipient_id: "recip_001",
    //     recipient_type: "distributor",
    //     split_method: "cost_based",
    //     split_percentage: null,
    //     split_fixed_brl: null,
    //     split_cost_key: "custo_kit_reais",  // Campo do custos_pagamento
    //     priority: 1
    //   },
    //   {
    //     recipient_id: "recip_002",
    //     recipient_type: "labor",
    //     split_method: "cost_based",
    //     split_cost_key: "custo_mao_de_obra_reais",
    //     priority: 2
    //   },
    //   {
    //     recipient_id: "recip_003",
    //     recipient_type: "platform",
    //     split_method: "percentage",
    //     split_percentage: 5.0,  // 5% do valor total
    //     priority: 3
    //   }
    // ]

    // Fees Distribution
    gateway_fees_bearer: model.enum(["customer", "platform", "split_proportional"]).default("customer"),
    // customer: Cliente paga taxas adicionais
    // platform: Plataforma absorve taxas
    // split_proportional: Taxas divididas proporcionalmente entre recipients

    // Priority & Status
    priority: model.number().default(1),  // Maior valor = maior prioridade
    active: model.boolean().default(true),

    // Validation
    total_split_percentage: model.number().nullable(),  // Validação: soma deve ser <= 100%

    // Metadata
    metadata: model.json().nullable(),

    created_at: model.dateTime(),
    updated_at: model.dateTime(),
})

/**
 * MODEL: PaymentSplitExecution
 * Registra a execução de splits para cada transação
 */
const PaymentSplitExecution = model.define("payment_split_execution", {
    id: model.id().primaryKey(),

    // Relacionamentos
    payment_transaction_id: model.text(),  // Link para PaymentTransaction
    order_id: model.text().nullable(),
    split_rule_id: model.text().nullable(),  // Regra aplicada

    // Transaction Info
    total_amount_brl: model.number(),  // Valor total da transação
    gateway_fee_brl: model.number(),  // Taxa do gateway
    net_amount_brl: model.number(),  // Valor líquido para split

    // Split Breakdown
    splits: model.json(),  // Array of split details:
    // [
    //   {
    //     recipient_id: "recip_001",
    //     recipient_type: "distributor",
    //     recipient_name: "FortLev Solar",
    //     split_amount_brl: 7006.00,
    //     split_percentage: 60.0,
    //     calculation_method: "cost_based",
    //     cost_key: "custo_kit_reais",
    //     transfer_fee_brl: 3.49,
    //     net_amount_brl: 7002.51,
    //     status: "pending",
    //     scheduled_transfer_date: "2025-10-20",
    //     actual_transfer_date: null,
    //     asaas_transfer_id: null
    //   },
    //   {
    //     recipient_id: "recip_002",
    //     recipient_type: "labor",
    //     recipient_name: "Instaladora XYZ",
    //     split_amount_brl: 2335.33,
    //     split_percentage: 20.0,
    //     calculation_method: "cost_based",
    //     cost_key: "custo_mao_de_obra_reais",
    //     transfer_fee_brl: 3.49,
    //     net_amount_brl: 2331.84,
    //     status: "pending",
    //     scheduled_transfer_date: "2025-10-20",
    //     actual_transfer_date: null,
    //     asaas_transfer_id: null
    //   },
    //   {
    //     recipient_id: "recip_003",
    //     recipient_type: "platform",
    //     recipient_name: "YSH Platform",
    //     split_amount_brl: 583.83,
    //     split_percentage: 5.0,
    //     calculation_method: "percentage",
    //     transfer_fee_brl: 0.00,  // Conta principal, grátis
    //     net_amount_brl: 583.83,
    //     status: "pending",
    //     scheduled_transfer_date: "2025-10-20",
    //     actual_transfer_date: null,
    //     asaas_transfer_id: null
    //   }
    // ]

    // Totals Validation
    total_splits_amount_brl: model.number(),  // Soma de todos os splits
    total_transfer_fees_brl: model.number(),  // Soma das taxas de transferência
    remaining_balance_brl: model.number(),  // Saldo remanescente (deve ser ~0)

    // Status
    status: model.enum(["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),

    // Settlement Tracking
    all_transfers_completed: model.boolean().default(false),
    completed_transfers_count: model.number().default(0),
    failed_transfers_count: model.number().default(0),

    // Metadata
    metadata: model.json().nullable(),

    created_at: model.dateTime(),
    updated_at: model.dateTime(),
})

/**
 * MODEL: CostBreakdown
 * Extensão para armazenar custos detalhados do JSON (custos_pagamento)
 */
const CostBreakdown = model.define("cost_breakdown", {
    id: model.id().primaryKey(),

    // Relacionamentos
    product_id: model.text(),  // Link para Medusa Product
    distributor_code: model.text(),

    // Custos do JSON
    custo_kit_reais: model.number(),  // Kit completo (painéis + inversor + BOS)
    custo_dossie_tecnico_homologacao_reais: model.number(),  // Dossiê + homologação
    custo_mao_de_obra_reais: model.number(),  // Instalação
    valor_total_projeto_reais: model.number(),  // Total geral

    // Breakdown Detalhado (do fabricacao_detalhada)
    modulos_solares: model.json().nullable(),  // Array de módulos com preços
    inversor_solar: model.json().nullable(),  // Dados do inversor
    componentes_balance_of_system: model.json().nullable(),  // Estrutura, cabos, proteções
    custo_total_do_kit_reais: model.number().nullable(),  // Total fabricacao_detalhada

    // Metadata
    metadata: model.json().nullable(),

    created_at: model.dateTime(),
    updated_at: model.dateTime(),
})

export default [
    PaymentSplitRecipient,
    PaymentSplitRule,
    PaymentSplitExecution,
    CostBreakdown,
]
