/**
 * Quotes Module Types
 * 
 * TypeScript definitions for quotes, proposals, and approvals
 */

// ============================================================================
// Quote Status
// ============================================================================

export type QuoteStatus =
    | 'draft'           // Em elaboração
    | 'pending'         // Aguardando aprovação
    | 'approved'        // Aprovado
    | 'rejected'        // Rejeitado
    | 'expired'         // Expirado
    | 'converted'       // Convertido em pedido

export type QuoteType =
    | 'standard'        // Cotação padrão
    | 'custom'          // Cotação personalizada
    | 'pre_approved'    // Pré-aprovada (calculadora)

// ============================================================================
// Quote Item
// ============================================================================

export interface QuoteItem {
    id: string
    quote_id: string
    product_id: string
    variant_id?: string

    // Product details
    title: string
    description?: string
    sku: string
    thumbnail?: string

    // Pricing
    quantity: number
    unit_price: number        // Preço unitário
    subtotal: number          // quantity * unit_price
    discount: number          // Desconto em %
    discount_amount: number   // Valor do desconto
    tax_rate: number          // Alíquota de imposto
    tax_amount: number        // Valor do imposto
    total: number             // Total com desconto e imposto

    // Technical specs (solar specific)
    specs?: {
        power_wp?: number       // Potência do módulo/inversor
        efficiency?: number     // Eficiência
        warranty_years?: number // Garantia
        manufacturer?: string   // Fabricante
        model?: string          // Modelo
    }

    // Metadata
    notes?: string
    created_at: Date
    updated_at: Date
}

// ============================================================================
// Quote Financial
// ============================================================================

export interface QuoteFinancial {
    // Subtotals
    subtotal: number              // Soma dos itens
    discount_total: number        // Total de descontos
    tax_total: number             // Total de impostos
    shipping_total: number        // Frete
    installation_total: number    // Instalação

    // Grand total
    total: number                 // Total geral

    // Payment options
    payment_terms?: string        // Condições de pagamento
    installments?: {
        count: number               // Número de parcelas
        amount: number              // Valor da parcela
        interest_rate: number       // Taxa de juros
        total_with_interest: number // Total com juros
    }

    // Financing
    financing_available?: boolean
    financing_options?: {
        provider: string
        max_installments: number
        interest_rate: number
        approval_required: boolean
    }[]
}

// ============================================================================
// Quote System (Solar specific)
// ============================================================================

export interface QuoteSystem {
    // System sizing
    capacity_kwp: number          // Capacidade do sistema
    panel_count: number           // Número de painéis
    panel_power_wp: number        // Potência do painel
    inverter_count: number        // Número de inversores
    inverter_power_kw: number     // Potência do inversor

    // Generation estimates
    estimated_generation_monthly: number   // kWh/mês
    estimated_generation_annual: number    // kWh/ano
    estimated_savings_monthly: number      // R$/mês
    estimated_savings_annual: number       // R$/ano

    // ROI
    payback_years: number         // Anos para retorno
    roi_25_years: number          // ROI em 25 anos

    // Technical
    system_voltage_v: number      // Tensão do sistema
    connection_type: 'monofasico' | 'bifasico' | 'trifasico'
    installation_type: 'telhado' | 'solo' | 'carport'

    // Location
    location: {
        latitude: number
        longitude: number
        city: string
        state: string
        irradiation_kwh_m2_day: number
    }
}

// ============================================================================
// Quote Approval
// ============================================================================

export interface QuoteApproval {
    id: string
    quote_id: string

    // Approver
    approver_id: string
    approver_name: string
    approver_role: string

    // Status
    status: 'pending' | 'approved' | 'rejected'
    decision_date?: Date

    // Feedback
    comments?: string
    requested_changes?: string[]

    // Conditions
    conditions?: string[]         // Condições para aprovação
    expires_at?: Date             // Prazo para decisão

    // Metadata
    created_at: Date
    updated_at: Date
}

// ============================================================================
// Quote Revision
// ============================================================================

export interface QuoteRevision {
    id: string
    quote_id: string
    version: number

    // Changes
    changed_by: string
    change_summary: string
    changes: {
        field: string
        old_value: any
        new_value: any
    }[]

    // Snapshot
    snapshot: Partial<Quote>      // State da cotação nesta revisão

    // Metadata
    created_at: Date
}

// ============================================================================
// Main Quote
// ============================================================================

export interface Quote {
    id: string
    quote_number: string          // Número da cotação (QT-2024-001)

    // Customer
    customer_id: string
    customer_name: string
    customer_email: string
    customer_phone?: string
    company_id?: string           // Para B2B
    company_name?: string

    // Status
    status: QuoteStatus
    type: QuoteType

    // Validity
    created_at: Date
    updated_at: Date
    expires_at: Date              // Data de validade
    valid_days: number            // Dias de validade (default 15)

    // Items
    items: QuoteItem[]
    item_count: number

    // Financial
    financial: QuoteFinancial

    // System (if solar quote)
    system?: QuoteSystem

    // Approvals (for B2B)
    approvals?: QuoteApproval[]
    requires_approval: boolean
    approval_status?: 'pending' | 'approved' | 'rejected'

    // Revisions
    revisions?: QuoteRevision[]
    version: number               // Versão atual

    // Sales
    sales_rep_id?: string         // Vendedor responsável
    sales_rep_name?: string

    // Documents
    documents?: {
        id: string
        type: 'quote_pdf' | 'technical_sheet' | 'proposal' | 'contract'
        name: string
        url: string
        created_at: Date
    }[]

    // Notes
    internal_notes?: string       // Notas internas (não visível ao cliente)
    customer_notes?: string       // Notas para o cliente

    // Conversion
    converted_order_id?: string   // ID do pedido gerado
    converted_at?: Date

    // Metadata
    metadata?: Record<string, any>
}

// ============================================================================
// Quote Input (for creation)
// ============================================================================

export interface QuoteInput {
    // Customer
    customer_id: string
    company_id?: string

    // Type
    type: QuoteType

    // Items
    items: {
        product_id: string
        variant_id?: string
        quantity: number
        unit_price?: number         // Optional, will use product price
        discount?: number           // Discount %
        notes?: string
    }[]

    // System (optional, for solar quotes)
    system?: Partial<QuoteSystem>

    // Financial
    shipping_total?: number
    installation_total?: number
    payment_terms?: string

    // Validity
    valid_days?: number           // Default 15

    // Notes
    internal_notes?: string
    customer_notes?: string

    // Metadata
    metadata?: Record<string, any>
}

// ============================================================================
// Quote Update
// ============================================================================

export interface QuoteUpdate {
    // Status
    status?: QuoteStatus

    // Items
    items?: QuoteItem[]

    // Financial
    financial?: Partial<QuoteFinancial>

    // System
    system?: Partial<QuoteSystem>

    // Validity
    expires_at?: Date
    valid_days?: number

    // Notes
    internal_notes?: string
    customer_notes?: string

    // Metadata
    metadata?: Record<string, any>
}

// ============================================================================
// Quote Filters
// ============================================================================

export interface QuoteFilters {
    status?: QuoteStatus[]
    type?: QuoteType[]
    customer_id?: string
    company_id?: string
    sales_rep_id?: string
    date_from?: Date
    date_to?: Date
    min_value?: number
    max_value?: number
    search?: string               // Search in quote_number, customer_name
}

// ============================================================================
// Quote Summary (for lists)
// ============================================================================

export interface QuoteSummary {
    id: string
    quote_number: string
    customer_name: string
    company_name?: string
    status: QuoteStatus
    type: QuoteType
    total: number
    item_count: number
    system_capacity_kwp?: number
    created_at: Date
    expires_at: Date
    is_expired: boolean
}

// ============================================================================
// Quote Comparison (for comparing multiple quotes)
// ============================================================================

export interface QuoteComparison {
    quotes: Quote[]
    comparison: {
        field: string
        label: string
        values: any[]
        unit?: string
    }[]
}

// ============================================================================
// Quote Statistics
// ============================================================================

export interface QuoteStatistics {
    total_quotes: number
    quotes_by_status: Record<QuoteStatus, number>
    total_value: number
    average_value: number
    conversion_rate: number       // % de cotações convertidas
    average_days_to_convert: number
    top_products: {
        product_id: string
        product_name: string
        quantity: number
        revenue: number
    }[]
}
