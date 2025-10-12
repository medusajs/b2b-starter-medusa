import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

/**
 * FinancingApplication Entity
 * 
 * Aplicação de financiamento com validação BACEN
 * 
 * Relacionamentos:
 * - RemoteLink → customer (Medusa Customer)
 * - RemoteLink → quote (Quote Module)
 * - RemoteLink → credit_analysis (CreditAnalysis Entity)
 * - RemoteLink → order (Medusa Order) - após aprovação
 */
@Entity({ tableName: 'financing_application' })
export class FinancingApplication {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    // References (RemoteLinks)
    @Property({ type: 'uuid' })
    customer_id!: string;

    @Property({ type: 'uuid' })
    quote_id!: string;

    @Property({ type: 'uuid' })
    credit_analysis_id!: string;

    @Property({ type: 'uuid', nullable: true })
    financing_offer_id?: string;

    @Property({ type: 'uuid', nullable: true })
    order_id?: string; // Após aprovação

    // Application Data
    @Property({ type: 'string', length: 50 })
    modality!: string; // CDC, LEASING, EAAS

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    financed_amount!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    down_payment_amount?: number;

    @Property({ type: 'integer' })
    term_months!: number;

    // Interest & Rates
    @Property({ type: 'decimal', precision: 5, scale: 4 })
    interest_rate_monthly!: number;

    @Property({ type: 'decimal', precision: 5, scale: 4 })
    interest_rate_annual!: number;

    @Property({ type: 'decimal', precision: 5, scale: 4 })
    cet!: number; // Custo Efetivo Total

    // Payment Calculation (PRICE System)
    @Property({ type: 'decimal', precision: 12, scale: 2 })
    monthly_payment!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    total_amount!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    total_interest!: number;

    // BACEN Validation
    @Property({ type: 'decimal', precision: 5, scale: 4, nullable: true })
    selic_rate_at_application?: number;

    @Property({ type: 'decimal', precision: 5, scale: 4, nullable: true })
    cdi_rate_at_application?: number;

    @Property({ type: 'boolean', default: false })
    bacen_validated!: boolean;

    @Property({ type: 'datetime', nullable: true })
    bacen_validation_date?: Date;

    @Property({ type: 'jsonb', nullable: true })
    bacen_validation_data?: {
        selic: number;
        cdi: number;
        ipca: number;
        max_rate_allowed: number;
        compliant: boolean;
    };

    // Status & Approval
    @Property({ type: 'string', length: 50, default: 'pending' })
    status!: string; // pending, approved, rejected, cancelled

    @Property({ type: 'boolean', default: false })
    approved!: boolean;

    @Property({ type: 'datetime', nullable: true })
    approved_at?: Date;

    @Property({ type: 'string', length: 100, nullable: true })
    approved_by?: string;

    @Property({ type: 'text', nullable: true })
    rejection_reason?: string;

    // Contract
    @Property({ type: 'string', length: 50, nullable: true })
    contract_number?: string;

    @Property({ type: 'text', nullable: true })
    contract_url?: string; // S3 URL

    @Property({ type: 'datetime', nullable: true })
    contract_signed_at?: Date;

    // Institution
    @Property({ type: 'string', length: 100, nullable: true })
    institution_name?: string;

    @Property({ type: 'string', length: 50, nullable: true })
    institution_code?: string;

    // Payment Schedule
    @Property({ type: 'jsonb', nullable: true })
    payment_schedule?: {
        installment_number: number;
        due_date: string;
        principal: number;
        interest: number;
        total: number;
        balance: number;
    }[];

    // Metadata
    @Property({ type: 'jsonb', nullable: true })
    application_metadata?: {
        version: string;
        service: string;
        duration_ms: number;
        bacen_check_duration_ms: number;
    };

    // Timestamps
    @Property({ type: 'datetime', onCreate: () => new Date() })
    created_at!: Date;

    @Property({ type: 'datetime', onUpdate: () => new Date() })
    updated_at!: Date;

    @Property({ type: 'datetime', nullable: true })
    submitted_at?: Date;
}
