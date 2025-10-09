// @ts-nocheck - Medusa types import issue
/**
 * Account Module Types
 * 
 * Definições TypeScript para todo o módulo de conta
 */

import { Customer as MedusaCustomer, Order as MedusaOrder } from '@medusajs/medusa'
import { PricedProduct } from '@medusajs/medusa/dist/types/pricing'

// Re-export Medusa types
export type Customer = MedusaCustomer
export type Order = MedusaOrder

// User Types
export interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    phone?: string
    avatar_url?: string
    customer_id: string
    created_at: string
    updated_at: string
}

// Address Types
export interface Address {
    id: string
    customer_id: string
    first_name: string
    last_name: string
    phone?: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    province: string
    postal_code: string
    country_code: string
    is_default_shipping: boolean
    is_default_billing: boolean
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

// Company Types
export interface Company {
    id: string
    customer_id: string
    name: string
    cnpj: string
    state_registration?: string
    municipal_registration?: string
    phone: string
    email: string
    website?: string
    address: {
        street: string
        number: string
        complement?: string
        neighborhood: string
        city: string
        state: string
        postal_code: string
        country: string
    }
    billing_address?: Address
    shipping_address?: Address
    contact_person: {
        name: string
        email: string
        phone: string
        position?: string
    }
    credit_limit?: number
    credit_available?: number
    payment_terms?: string
    discount_tier?: string
    is_active: boolean
    verified: boolean
    verification_date?: string
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

// Approval Types
export interface Approval {
    id: string
    customer_id: string
    company_id?: string
    type: 'order' | 'quote' | 'credit' | 'return' | 'custom'
    entity_id: string // ID do pedido, cotação, etc
    entity_type: string
    amount?: number
    currency?: string
    status: 'pending' | 'approved' | 'rejected' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    requested_by: {
        id: string
        name: string
        email: string
    }
    approver_id?: string
    approver_name?: string
    approval_level: number
    approval_chain?: string[]
    description?: string
    reason?: string
    rejection_reason?: string
    attachments?: string[]
    expires_at?: string
    approved_at?: string
    rejected_at?: string
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

// Return Types
export interface Return {
    id: string
    order_id: string
    customer_id: string
    status: 'requested' | 'received' | 'inspecting' | 'approved' | 'rejected' | 'refunded'
    reason: 'damaged' | 'defective' | 'wrong_item' | 'not_as_described' | 'other'
    items: ReturnItem[]
    shipping_method?: string
    tracking_number?: string
    refund_amount?: number
    refund_method?: 'original' | 'credit' | 'exchange'
    notes?: string
    images?: string[]
    inspection_notes?: string
    admin_notes?: string
    requested_at: string
    received_at?: string
    approved_at?: string
    refunded_at?: string
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface ReturnItem {
    id: string
    return_id: string
    item_id: string
    product_id: string
    variant_id: string
    product_title: string
    variant_title?: string
    quantity: number
    unit_price: number
    total_price: number
    reason?: string
    condition?: 'new' | 'used' | 'damaged'
    images?: string[]
}

// Financing Types
export interface Financing {
    id: string
    customer_id: string
    company_id?: string
    order_id?: string
    type: 'personal' | 'business' | 'solar' | 'equipment'
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'paid' | 'defaulted'
    amount: number
    currency: string
    term_months: number
    interest_rate: number
    monthly_payment: number
    total_payment: number
    down_payment?: number
    down_payment_date?: string
    first_payment_date?: string
    last_payment_date?: string
    payments_made: number
    balance_remaining: number
    provider: string
    contract_number?: string
    contract_url?: string
    installments: FinancingInstallment[]
    collateral?: string
    guarantors?: Guarantor[]
    documents?: FinancingDocument[]
    approved_by?: string
    approved_at?: string
    rejected_reason?: string
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface FinancingInstallment {
    number: number
    due_date: string
    amount: number
    principal: number
    interest: number
    status: 'pending' | 'paid' | 'late' | 'defaulted'
    paid_date?: string
    paid_amount?: number
}

export interface Guarantor {
    name: string
    cpf_cnpj: string
    phone: string
    email: string
    address: string
}

export interface FinancingDocument {
    type: string
    name: string
    url: string
    uploaded_at: string
}

// Notification Types
export interface Notification {
    id: string
    customer_id: string
    type: 'order' | 'quote' | 'approval' | 'return' | 'financing' | 'solar' | 'system' | 'marketing'
    title: string
    message: string
    data?: Record<string, any>
    link?: string
    icon?: string
    priority: 'low' | 'medium' | 'high'
    is_read: boolean
    read_at?: string
    expires_at?: string
    created_at: string
}

// Solar Project Types
export interface SolarProject {
    id: string
    customer_id: string
    company_id?: string
    name: string
    status: 'planning' | 'design' | 'approval' | 'installation' | 'commission' | 'active' | 'maintenance' | 'decommissioned'
    type: 'residential' | 'commercial' | 'industrial' | 'rural'
    location: {
        address: string
        city: string
        state: string
        postal_code: string
        coordinates?: {
            lat: number
            lng: number
        }
    }
    system: {
        capacity_kwp: number
        panel_count: number
        panel_model: string
        inverter_count: number
        inverter_model: string
        battery_count?: number
        battery_model?: string
        total_battery_kwh?: number
    }
    financial: {
        total_cost: number
        currency: string
        financing_id?: string
        payment_status: 'pending' | 'partial' | 'paid'
        amount_paid: number
        balance_remaining: number
    }
    energy: {
        estimated_generation_kwh_month: number
        estimated_generation_kwh_year: number
        actual_generation_kwh_month?: number
        actual_generation_kwh_year?: number
        grid_connection_date?: string
        last_reading_date?: string
    }
    timeline: {
        created_at: string
        design_completed_at?: string
        approval_submitted_at?: string
        approval_received_at?: string
        installation_started_at?: string
        installation_completed_at?: string
        commissioned_at?: string
    }
    documents?: ProjectDocument[]
    contacts?: ProjectContact[]
    metadata?: Record<string, any>
}

export interface ProjectDocument {
    type: 'contract' | 'technical' | 'approval' | 'invoice' | 'warranty' | 'other'
    name: string
    url: string
    uploaded_at: string
}

export interface ProjectContact {
    role: 'engineer' | 'installer' | 'inspector' | 'distributor' | 'other'
    name: string
    company?: string
    phone: string
    email: string
}

// Energy Bill Types
export interface EnergyBill {
    id: string
    customer_id: string
    solar_project_id?: string
    distributor: string
    account_number: string
    reference_month: string // YYYY-MM
    due_date: string
    amount: number
    currency: string
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    paid_date?: string
    consumption_kwh: number
    generation_kwh?: number
    net_consumption_kwh: number
    credits_kwh?: number
    tariff_kwh: number
    taxes: {
        icms: number
        pis: number
        cofins: number
        other?: number
    }
    file_url?: string
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

// Solar Calculation Types
export interface SolarCalculation {
    id: string
    customer_id: string
    name: string
    status: 'draft' | 'completed' | 'converted'
    location: {
        address: string
        city: string
        state: string
        coordinates?: {
            lat: number
            lng: number
        }
    }
    consumption: {
        avg_monthly_kwh: number
        avg_monthly_cost: number
        tariff_kwh: number
        distributor: string
    }
    system: {
        recommended_capacity_kwp: number
        panel_count: number
        inverter_capacity_kw: number
        estimated_generation_kwh_month: number
        estimated_generation_kwh_year: number
    }
    financial: {
        estimated_cost: number
        currency: string
        payback_years: number
        roi_percent: number
        savings_25_years: number
    }
    created_at: string
    updated_at: string
}

// Settings Types
export interface AccountSettings {
    customer_id: string
    language: string
    timezone: string
    currency: string
    date_format: string
    notification_preferences: NotificationPreferences
    privacy_settings: PrivacySettings
    security_settings: SecuritySettings
    updated_at: string
}

export interface NotificationPreferences {
    email_enabled: boolean
    sms_enabled: boolean
    push_enabled: boolean
    notifications: {
        order_updates: boolean
        quote_updates: boolean
        approval_requests: boolean
        return_updates: boolean
        financing_updates: boolean
        solar_updates: boolean
        marketing: boolean
        newsletter: boolean
    }
}

export interface PrivacySettings {
    profile_visibility: 'public' | 'private' | 'contacts_only'
    show_email: boolean
    show_phone: boolean
    allow_data_collection: boolean
    allow_marketing: boolean
    allow_third_party_sharing: boolean
}

export interface SecuritySettings {
    two_factor_enabled: boolean
    two_factor_method?: 'sms' | 'email' | 'authenticator'
    session_timeout_minutes: number
    password_last_changed: string
    active_sessions: ActiveSession[]
}

export interface ActiveSession {
    id: string
    device: string
    browser: string
    location?: string
    ip_address: string
    last_active: string
    is_current: boolean
}
