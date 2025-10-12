import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';

/**
 * CreditAnalysis Entity
 * 
 * Análise de crédito com scoring multi-fator:
 * - Income (30 pontos)
 * - Employment stability (15 pontos)
 * - Credit history (35 pontos)
 * - Debt ratio (20 pontos)
 * 
 * Relacionamentos:
 * - RemoteLink → customer (Medusa Customer)
 * - RemoteLink → quote (Quote Module)
 * - OneToMany → financing_offers
 */
@Entity({ tableName: 'credit_analysis' })
export class CreditAnalysis {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    // Customer Reference (RemoteLink)
    @Property({ type: 'uuid' })
    customer_id!: string;

    // Quote Reference (Optional, RemoteLink)
    @Property({ type: 'uuid', nullable: true })
    quote_id?: string;

    // Solar Calculation Reference (Optional, RemoteLink)
    @Property({ type: 'uuid', nullable: true })
    solar_calculation_id?: string;

    // Request Data
    @Property({ type: 'decimal', precision: 12, scale: 2 })
    requested_amount!: number;

    @Property({ type: 'integer' })
    requested_term_months!: number;

    @Property({ type: 'string', length: 50 })
    modality!: string; // CDC, LEASING, EAAS

    // Customer Financial Data
    @Property({ type: 'decimal', precision: 12, scale: 2 })
    monthly_income!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    total_monthly_debts?: number;

    @Property({ type: 'string', length: 50, nullable: true })
    employment_status?: string; // employed, self_employed, retired, unemployed

    @Property({ type: 'integer', nullable: true })
    employment_months?: number;

    // Credit Bureau Data
    @Property({ type: 'integer', nullable: true })
    credit_score?: number; // 0-1000 (Serasa, Boa Vista)

    @Property({ type: 'integer', default: 0 })
    negative_records!: number;

    @Property({ type: 'boolean', default: false })
    has_active_restrictions!: boolean;

    // Score Calculation (0-100)
    @Property({ type: 'decimal', precision: 5, scale: 2 })
    income_score!: number; // 0-30

    @Property({ type: 'decimal', precision: 5, scale: 2 })
    employment_score!: number; // 0-15

    @Property({ type: 'decimal', precision: 5, scale: 2 })
    credit_history_score!: number; // 0-35

    @Property({ type: 'decimal', precision: 5, scale: 2 })
    debt_ratio_score!: number; // 0-20

    @Property({ type: 'decimal', precision: 5, scale: 2 })
    total_score!: number; // 0-100

    // Risk Assessment
    @Property({ type: 'string', length: 20 })
    risk_level!: string; // low (>=75), medium (>=50), high (<50)

    @Property({ type: 'decimal', precision: 5, scale: 2 })
    approval_probability!: number; // 0-100%

    @Property({ type: 'boolean' })
    approved!: boolean;

    @Property({ type: 'text', nullable: true })
    rejection_reason?: string;

    // Analysis Details
    @Property({ type: 'jsonb', nullable: true })
    analysis_details?: {
        loan_to_income_ratio: number;
        debt_to_income_ratio: number;
        recommended_max_amount: number;
        risk_factors: string[];
        strengths: string[];
    };

    // Metadata
    @Property({ type: 'jsonb', nullable: true })
    analysis_metadata?: {
        version: string;
        service: string;
        duration_ms: number;
        credit_bureau: string;
    };

    // Timestamps
    @Property({ type: 'datetime', onCreate: () => new Date() })
    created_at!: Date;

    @Property({ type: 'datetime', onUpdate: () => new Date() })
    updated_at!: Date;

    // Financing Offers (OneToMany)
    @OneToMany(() => FinancingOffer, offer => offer.credit_analysis)
    financing_offers = new Collection<FinancingOffer>(this);
}

/**
 * FinancingOffer Entity
 * 
 * Ofertas de financiamento baseadas na análise de crédito
 */
@Entity({ tableName: 'financing_offer' })
export class FinancingOffer {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    @ManyToOne(() => CreditAnalysis)
    credit_analysis!: CreditAnalysis;

    @Property({ type: 'uuid' })
    credit_analysis_id!: string;    // Offer Details
    @Property({ type: 'string', length: 50 })
    modality!: string; // CDC, LEASING, EAAS

    @Property({ type: 'string', length: 100, nullable: true })
    institution!: string; // Banco/Financeira

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    max_amount!: number;

    @Property({ type: 'integer' })
    term_months!: number;

    // Interest Rates
    @Property({ type: 'decimal', precision: 5, scale: 4 })
    interest_rate_monthly!: number; // Taxa mensal

    @Property({ type: 'decimal', precision: 5, scale: 4 })
    interest_rate_annual!: number; // Taxa anual

    @Property({ type: 'decimal', precision: 5, scale: 4 })
    cet!: number; // Custo Efetivo Total

    // Payment Details
    @Property({ type: 'decimal', precision: 12, scale: 2 })
    monthly_payment!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    total_amount!: number; // Total a pagar

    @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    down_payment_required?: number;

    // Ranking
    @Property({ type: 'integer', default: 0 })
    rank!: number; // Melhor oferta = 1

    @Property({ type: 'boolean', default: false })
    is_recommended!: boolean;

    // Additional Info
    @Property({ type: 'jsonb', nullable: true })
    offer_details?: {
        features: string[];
        requirements: string[];
        restrictions: string[];
        advantages: string[];
    };

    // Timestamps
    @Property({ type: 'datetime', onCreate: () => new Date() })
    created_at!: Date;
}
