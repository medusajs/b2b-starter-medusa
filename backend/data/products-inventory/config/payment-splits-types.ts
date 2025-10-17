/**
 * Payment Splits Configuration Types
 * 
 * Definições TypeScript para integração com sistema de pagamentos Asaas
 * baseadas na estrutura de custos detalhada de projetos solares
 * 
 * @version 1.0.0
 * @date 2025-10-14
 */

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export enum PaymentMethodCode {
    PIX = "PIX",
    PIX_DYNAMIC = "PIX_DYNAMIC",
    BOLETO = "BOLETO",
    CREDIT_CARD_1X = "CREDIT_CARD_1X",
    CREDIT_CARD_2_6X = "CREDIT_CARD_2_6X",
    CREDIT_CARD_7_12X = "CREDIT_CARD_7_12X",
    CREDIT_CARD_13_21X = "CREDIT_CARD_13_21X",
    DEBIT_CARD = "DEBIT_CARD",
}

export interface PaymentMethodFees {
    fixed_brl: number;
    percentage: number;
    description: string;
}

export interface PaymentMethod {
    code: PaymentMethodCode;
    name: string;
    gateway: "asaas";
    fees: PaymentMethodFees;
    processing_time: string;
    recommended_for: ProjectSize[];
    installments?: number | number[];
}

// ============================================================================
// NOTIFICATION FEES
// ============================================================================

export enum NotificationMethod {
    EMAIL_SMS = "EMAIL_SMS",
    WHATSAPP = "WHATSAPP",
    VOICE_ROBOT = "VOICE_ROBOT",
    MAIL = "MAIL",
}

export interface NotificationFee {
    code: NotificationMethod;
    name: string;
    fee_brl: number;
    description: string;
}

// ============================================================================
// ADVANCE & TRANSFER FEES
// ============================================================================

export interface AdvanceFees {
    boleto: {
        monthly_percentage: number;
        description: string;
    };
    credit_single: {
        monthly_percentage: number;
        description: string;
    };
    credit_installments: {
        monthly_percentage: number;
        description: string;
    };
}

export interface TransferFees {
    platform_main_account: {
        fee_brl: number;
        description: string;
    };
    third_party: {
        fee_brl: number;
        description: string;
    };
    subaccount_monthly: {
        fee_brl: number;
        description: string;
    };
}

// ============================================================================
// COST BREAKDOWN
// ============================================================================

export enum CostComponentCode {
    EQUIPMENTS = "EQUIPMENTS",
    LABOR = "LABOR",
    TECHNICAL_PROJECT = "TECHNICAL_PROJECT",
    ART_TRT = "ART_TRT",
    HOMOLOGATION = "HOMOLOGATION",
    SALES_COMMISSION = "SALES_COMMISSION",
    LOGISTICS = "LOGISTICS",
    CONTINGENCY = "CONTINGENCY",
}

export enum RecipientType {
    DISTRIBUTOR = "DISTRIBUTOR",
    MANUFACTURER = "MANUFACTURER",
    PLATFORM = "PLATFORM",
    LABOR = "LABOR",
    TECHNICAL_DOSSIER = "TECHNICAL_DOSSIER",
    BOS = "BOS",
    LOGISTICS = "LOGISTICS",
    PARTNER = "PARTNER",
}

export interface CostComponent {
    code: CostComponentCode;
    name: string;
    description: string;
    base_percentage: number;
    range: {
        min: number;
        max: number;
    };
    recipient_type: RecipientType;
    cost_fields: string[];
}

export interface CostBreakdownStructure {
    description: string;
    components: Record<string, CostComponent>;
}

// ============================================================================
// REGIONAL SCENARIOS
// ============================================================================

export enum RegionCode {
    SE = "SE", // Sudeste
    S = "S",   // Sul
    CO = "CO", // Centro-Oeste
    NE = "NE", // Nordeste
    N = "N",   // Norte
}

export enum ScenarioType {
    PESSIMISTA = "pessimista",
    NEUTRO = "neutro",
    OTIMISTA = "otimista",
}

export interface ScenarioSplits {
    equipamentos: number;
    mao_de_obra: number;
    projeto_tecnico: number;
    art_trt: number;
    homologacao: number;
    comissao_vendas: number;
    logistica: number;
    contingencia: number;
    margem_bruta_min: number;
    margem_bruta_max: number;
}

export interface RegionalScenario {
    region_code: RegionCode;
    name: string;
    characteristics: string;
    scenarios: {
        pessimista: ScenarioSplits;
        neutro: ScenarioSplits;
        otimista: ScenarioSplits;
    };
}

export type RegionalScenarios = Record<string, RegionalScenario>;

// ============================================================================
// PROJECT SIZES
// ============================================================================

export enum ProjectSize {
    XPP = "XPP",   // 1.2-2.0 kWp
    PP = "PP",     // 2.1-4.0 kWp
    P = "P",       // 4.1-10.0 kWp
    M = "M",       // 10.1-25.0 kWp
    G = "G",       // 25.1-75.0 kWp
    XG = "XG",     // 76-500 kWp
    XXG = "XXG",   // 501-3000 kWp
}

// ============================================================================
// SPLIT CALCULATION
// ============================================================================

export interface SplitRecipient {
    percentage: number;
    amount_brl: number;
    recipient_type: RecipientType;
    transfer_fee: number;
    net_amount: number;
    note?: string;
}

export interface SplitCalculation {
    subtotal_brl: number;
    payment_gateway_fee?: number;
    payment_gateway_fee_percentage?: number;
    notification_fee: number;
    total_amount: number;
    installments?: number;
    installment_value?: number;
    splits: Record<string, SplitRecipient>;
    summary: {
        total_splits_before_fees: number;
        total_transfer_fees: number;
        total_gateway_fees: number;
        platform_net_revenue: number;
        margin_percentage: number;
    };
}

export interface SplitExample {
    description: string;
    project_size: ProjectSize;
    region: string;
    scenario: ScenarioType;
    payment_method: string;
    calculation: SplitCalculation;
}

// ============================================================================
// MAIN CONFIG INTERFACE
// ============================================================================

export interface PaymentSplitsConfig {
    version: string;
    generated_at: string;
    description: string;
    payment_methods: Record<string, PaymentMethod>;
    notification_fees: Record<string, NotificationFee>;
    advance_fees: AdvanceFees;
    transfer_fees: TransferFees;
    cost_breakdown_structure: CostBreakdownStructure;
    regional_scenarios: RegionalScenarios;
    split_calculation_examples: Record<string, SplitExample>;
    integration_notes: {
        workflow_steps: string[];
        important_rules: string[];
        api_endpoints: string[];
    };
    metadata: {
        source: string;
        asaas_pricing_date: string;
        regions_covered: number;
        scenarios_per_region: number;
        payment_methods: number;
        cost_components: number;
        last_updated: string;
        version_history: Array<{
            version: string;
            date: string;
            changes: string;
        }>;
    };
}

// ============================================================================
// CALCULATION INPUT/OUTPUT INTERFACES
// ============================================================================

export interface CalculatePaymentInput {
    product_id: string;
    distributor_code?: string;
    quantity: number;
    payment_method: PaymentMethodCode;
    installments?: number;
    region: RegionCode;
    scenario?: ScenarioType;
    notifications?: NotificationMethod[];
    advance_payment?: boolean;
    cost_breakdown?: {
        custo_kit_reais: number;
        custo_mao_de_obra_reais: number;
        custo_dossie_tecnico_homologacao_reais: number;
        valor_total_projeto_reais: number;
    };
}

export interface CalculatePaymentOutput {
    calculation_id: string;
    timestamp: string;
    input: CalculatePaymentInput;
    pricing: {
        base_price_brl: number;
        quantity: number;
        subtotal_brl: number;
    };
    fees: {
        gateway: {
            method: PaymentMethodCode;
            percentage?: number;
            fixed?: number;
            total_brl: number;
        };
        notifications: Array<{
            method: NotificationMethod;
            fee_brl: number;
        }>;
        total_fees_brl: number;
    };
    total: {
        total_amount_brl: number;
        installments?: number;
        installment_value_brl?: number;
    };
    splits: Array<{
        component: CostComponentCode;
        recipient_type: RecipientType;
        recipient_id?: string;
        percentage: number;
        gross_amount_brl: number;
        transfer_fee_brl: number;
        net_amount_brl: number;
    }>;
    summary: {
        total_to_recipients_brl: number;
        total_transfer_fees_brl: number;
        platform_revenue_brl: number;
        margin_percentage: number;
    };
}

// ============================================================================
// SPLIT EXECUTION INTERFACES
// ============================================================================

export interface CreateSplitExecutionInput {
    payment_transaction_id: string;
    product_id: string;
    calculation_id?: string;
    total_amount_brl: number;
    net_amount_brl: number;
    cost_breakdown: {
        custo_kit_reais: number;
        custo_mao_de_obra_reais: number;
        custo_dossie_tecnico_homologacao_reais: number;
        valor_total_projeto_reais: number;
    };
    region: RegionCode;
    scenario: ScenarioType;
    recipients: Array<{
        recipient_id: string;
        recipient_type: RecipientType;
        asaas_account_id?: string;
    }>;
}

export interface SplitExecutionOutput {
    split_execution_id: string;
    payment_transaction_id: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    executed_at: string;
    splits: Array<{
        split_id: string;
        recipient_id: string;
        recipient_type: RecipientType;
        amount_brl: number;
        transfer_fee_brl: number;
        net_amount_brl: number;
        asaas_transfer_id?: string;
        status: "PENDING" | "SCHEDULED" | "TRANSFERRED" | "FAILED";
        transferred_at?: string;
        error_message?: string;
    }>;
    total_splits_brl: number;
    total_transfer_fees_brl: number;
    errors?: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PaymentMethodsMap = Record<PaymentMethodCode, PaymentMethod>;
export type NotificationFeesMap = Record<NotificationMethod, NotificationFee>;
export type CostComponentsMap = Record<CostComponentCode, CostComponent>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_TRANSFER_FEE_BRL = 3.49;
export const PLATFORM_TRANSFER_FEE_BRL = 0.00;
export const SUBACCOUNT_MONTHLY_FEE_BRL = 12.90;

export const DEFAULT_SCENARIO: ScenarioType = ScenarioType.NEUTRO;
export const DEFAULT_REGION: RegionCode = RegionCode.SE;

export const COST_COMPONENT_PERCENTAGES = {
    [ScenarioType.NEUTRO]: {
        equipamentos: 60,
        mao_de_obra: 13,
        projeto_tecnico: 8,
        art_trt: 2,
        homologacao: 3,
        comissao_vendas: 5,
        logistica: 4,
        contingencia: 5,
    },
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function isValidPaymentMethod(method: string): method is PaymentMethodCode {
    return Object.values(PaymentMethodCode).includes(method as PaymentMethodCode);
}

export function isValidRegion(region: string): region is RegionCode {
    return Object.values(RegionCode).includes(region as RegionCode);
}

export function isValidScenario(scenario: string): scenario is ScenarioType {
    return Object.values(ScenarioType).includes(scenario as ScenarioType);
}

export function isValidProjectSize(size: string): size is ProjectSize {
    return Object.values(ProjectSize).includes(size as ProjectSize);
}

export function getInstallmentsForMethod(method: PaymentMethodCode): number[] {
    switch (method) {
        case PaymentMethodCode.CREDIT_CARD_1X:
            return [1];
        case PaymentMethodCode.CREDIT_CARD_2_6X:
            return [2, 3, 4, 5, 6];
        case PaymentMethodCode.CREDIT_CARD_7_12X:
            return [7, 8, 9, 10, 11, 12];
        case PaymentMethodCode.CREDIT_CARD_13_21X:
            return [13, 14, 15, 16, 17, 18, 19, 20, 21];
        default:
            return [1];
    }
}

export function calculateGatewayFee(
    amount_brl: number,
    method: PaymentMethodCode,
    config: PaymentMethod
): number {
    const fixedFee = config.fees.fixed_brl;
    const percentageFee = (amount_brl * config.fees.percentage) / 100;
    return fixedFee + percentageFee;
}

export function calculateTransferFee(
    recipient_type: RecipientType
): number {
    return recipient_type === RecipientType.PLATFORM
        ? PLATFORM_TRANSFER_FEE_BRL
        : DEFAULT_TRANSFER_FEE_BRL;
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
import type {
  CalculatePaymentInput,
  CalculatePaymentOutput,
  PaymentMethodCode,
  RegionCode,
  ScenarioType,
} from './payment-splits-types';

const input: CalculatePaymentInput = {
  product_id: "prod_12345",
  quantity: 1,
  payment_method: PaymentMethodCode.PIX,
  region: RegionCode.SE,
  scenario: ScenarioType.NEUTRO,
  notifications: [NotificationMethod.WHATSAPP],
  cost_breakdown: {
    custo_kit_reais: 30000.00,
    custo_mao_de_obra_reais: 6500.00,
    custo_dossie_tecnico_homologacao_reais: 5000.00,
    valor_total_projeto_reais: 50000.00,
  },
};

// Call API
const response = await fetch('/api/payment/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(input),
});

const output: CalculatePaymentOutput = await response.json();
console.log(output.total.total_amount_brl); // 50002.44
console.log(output.summary.platform_revenue_brl); // 4000.00
*/

// ============================================================================
// EXPORTS
// ============================================================================

export default PaymentSplitsConfig;
