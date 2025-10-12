import { Migration } from '@mikro-orm/migrations';

/**
 * Migration: Create Solar Journey & Fulfillment Entities
 * 
 * Cria as tabelas para:
 * - SolarCalculation & SolarCalculationKit
 * - CreditAnalysis & FinancingOffer
 * - FinancingApplication
 * - OrderFulfillment & OrderShipment
 * 
 * Integração completa com Medusa Core via RemoteLink
 */
export class Migration20251012000000 extends Migration {
    async up(): Promise<void> {
        // ============================================
        // 1. SOLAR CALCULATION TABLES
        // ============================================

        this.addSql(`
      CREATE TABLE IF NOT EXISTS solar_calculation (
        id UUID PRIMARY KEY,
        customer_id UUID NOT NULL,
        quote_id UUID,
        
        -- Input Data
        consumo_kwh_mes DECIMAL(10, 2) NOT NULL,
        uf VARCHAR(2) NOT NULL,
        cep VARCHAR(10),
        tipo_telhado VARCHAR(50) NOT NULL,
        oversizing_target DECIMAL(5, 2) DEFAULT 1.2 NOT NULL,
        
        -- Geographic Data
        latitude DECIMAL(10, 6),
        longitude DECIMAL(10, 6),
        irradiacao_media_kwh_m2_dia DECIMAL(6, 2),
        concessionaria VARCHAR(100),
        
        -- Tariff Data
        tarifa_energia_kwh DECIMAL(10, 4),
        modalidade_tarifaria VARCHAR(50),
        
        -- Dimensioning Results
        potencia_instalada_kwp DECIMAL(10, 2) NOT NULL,
        numero_modulos INTEGER NOT NULL,
        numero_inversores INTEGER NOT NULL,
        area_necessaria_m2 DECIMAL(10, 2) NOT NULL,
        geracao_anual_kwh DECIMAL(10, 2) NOT NULL,
        
        -- Financial Analysis
        investimento_total DECIMAL(12, 2) NOT NULL,
        economia_mensal DECIMAL(12, 2) NOT NULL,
        economia_anual DECIMAL(12, 2) NOT NULL,
        payback_anos DECIMAL(5, 2) NOT NULL,
        economia_25_anos DECIMAL(12, 2) NOT NULL,
        tir_percent DECIMAL(8, 4) NOT NULL,
        vpl DECIMAL(12, 2) NOT NULL,
        
        -- Environmental Impact
        co2_evitado_kg_ano DECIMAL(10, 2) NOT NULL,
        arvores_equivalentes INTEGER NOT NULL,
        
        -- Metadata
        calculation_metadata JSONB,
        status VARCHAR(50) DEFAULT 'completed' NOT NULL,
        error_message TEXT,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

        this.addSql(`
      CREATE INDEX idx_solar_calculation_customer_id ON solar_calculation(customer_id);
      CREATE INDEX idx_solar_calculation_quote_id ON solar_calculation(quote_id);
      CREATE INDEX idx_solar_calculation_uf ON solar_calculation(uf);
      CREATE INDEX idx_solar_calculation_created_at ON solar_calculation(created_at DESC);
    `);

        this.addSql(`
      CREATE TABLE IF NOT EXISTS solar_calculation_kit (
        id UUID PRIMARY KEY,
        calculation_id UUID NOT NULL,
        
        -- Kit Reference (RemoteLink to Product)
        product_id UUID NOT NULL,
        kit_sku VARCHAR(100) NOT NULL,
        kit_name VARCHAR(255) NOT NULL,
        
        -- Match Score
        match_score DECIMAL(5, 2) NOT NULL,
        rank INTEGER DEFAULT 0 NOT NULL,
        
        -- Pricing
        price DECIMAL(12, 2) NOT NULL,
        currency_code VARCHAR(3) DEFAULT 'BRL' NOT NULL,
        
        -- Kit Details
        kit_details JSONB,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        
        CONSTRAINT fk_solar_calculation_kit_calculation 
          FOREIGN KEY (calculation_id) 
          REFERENCES solar_calculation(id) 
          ON DELETE CASCADE
      );
    `);

        this.addSql(`
      CREATE INDEX idx_solar_calculation_kit_calculation_id ON solar_calculation_kit(calculation_id);
      CREATE INDEX idx_solar_calculation_kit_product_id ON solar_calculation_kit(product_id);
      CREATE INDEX idx_solar_calculation_kit_rank ON solar_calculation_kit(rank);
    `);

        // ============================================
        // 2. CREDIT ANALYSIS TABLES
        // ============================================

        this.addSql(`
      CREATE TABLE IF NOT EXISTS credit_analysis (
        id UUID PRIMARY KEY,
        customer_id UUID NOT NULL,
        quote_id UUID,
        solar_calculation_id UUID,
        
        -- Request Data
        requested_amount DECIMAL(12, 2) NOT NULL,
        requested_term_months INTEGER NOT NULL,
        modality VARCHAR(50) NOT NULL,
        
        -- Customer Financial Data
        monthly_income DECIMAL(12, 2) NOT NULL,
        total_monthly_debts DECIMAL(12, 2),
        employment_status VARCHAR(50),
        employment_months INTEGER,
        
        -- Credit Bureau Data
        credit_score INTEGER,
        negative_records INTEGER DEFAULT 0 NOT NULL,
        has_active_restrictions BOOLEAN DEFAULT FALSE NOT NULL,
        
        -- Score Calculation (0-100)
        income_score DECIMAL(5, 2) NOT NULL,
        employment_score DECIMAL(5, 2) NOT NULL,
        credit_history_score DECIMAL(5, 2) NOT NULL,
        debt_ratio_score DECIMAL(5, 2) NOT NULL,
        total_score DECIMAL(5, 2) NOT NULL,
        
        -- Risk Assessment
        risk_level VARCHAR(20) NOT NULL,
        approval_probability DECIMAL(5, 2) NOT NULL,
        approved BOOLEAN NOT NULL,
        rejection_reason TEXT,
        
        -- Analysis Details
        analysis_details JSONB,
        analysis_metadata JSONB,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

        this.addSql(`
      CREATE INDEX idx_credit_analysis_customer_id ON credit_analysis(customer_id);
      CREATE INDEX idx_credit_analysis_quote_id ON credit_analysis(quote_id);
      CREATE INDEX idx_credit_analysis_solar_calculation_id ON credit_analysis(solar_calculation_id);
      CREATE INDEX idx_credit_analysis_approved ON credit_analysis(approved);
      CREATE INDEX idx_credit_analysis_risk_level ON credit_analysis(risk_level);
      CREATE INDEX idx_credit_analysis_created_at ON credit_analysis(created_at DESC);
    `);

        this.addSql(`
      CREATE TABLE IF NOT EXISTS financing_offer (
        id UUID PRIMARY KEY,
        credit_analysis_id UUID NOT NULL,
        
        -- Offer Details
        modality VARCHAR(50) NOT NULL,
        institution VARCHAR(100),
        max_amount DECIMAL(12, 2) NOT NULL,
        term_months INTEGER NOT NULL,
        
        -- Interest Rates
        interest_rate_monthly DECIMAL(5, 4) NOT NULL,
        interest_rate_annual DECIMAL(5, 4) NOT NULL,
        cet DECIMAL(5, 4) NOT NULL,
        
        -- Payment Details
        monthly_payment DECIMAL(12, 2) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        down_payment_required DECIMAL(12, 2),
        
        -- Ranking
        rank INTEGER DEFAULT 0 NOT NULL,
        is_recommended BOOLEAN DEFAULT FALSE NOT NULL,
        
        -- Additional Info
        offer_details JSONB,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        
        CONSTRAINT fk_financing_offer_credit_analysis 
          FOREIGN KEY (credit_analysis_id) 
          REFERENCES credit_analysis(id) 
          ON DELETE CASCADE
      );
    `);

        this.addSql(`
      CREATE INDEX idx_financing_offer_credit_analysis_id ON financing_offer(credit_analysis_id);
      CREATE INDEX idx_financing_offer_modality ON financing_offer(modality);
      CREATE INDEX idx_financing_offer_rank ON financing_offer(rank);
    `);

        // ============================================
        // 3. FINANCING APPLICATION TABLE
        // ============================================

        this.addSql(`
      CREATE TABLE IF NOT EXISTS financing_application (
        id UUID PRIMARY KEY,
        customer_id UUID NOT NULL,
        quote_id UUID NOT NULL,
        credit_analysis_id UUID NOT NULL,
        financing_offer_id UUID,
        order_id UUID,
        
        -- Application Data
        modality VARCHAR(50) NOT NULL,
        financed_amount DECIMAL(12, 2) NOT NULL,
        down_payment_amount DECIMAL(12, 2),
        term_months INTEGER NOT NULL,
        
        -- Interest & Rates
        interest_rate_monthly DECIMAL(5, 4) NOT NULL,
        interest_rate_annual DECIMAL(5, 4) NOT NULL,
        cet DECIMAL(5, 4) NOT NULL,
        
        -- Payment Calculation
        monthly_payment DECIMAL(12, 2) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        total_interest DECIMAL(12, 2) NOT NULL,
        
        -- BACEN Validation
        selic_rate_at_application DECIMAL(5, 4),
        cdi_rate_at_application DECIMAL(5, 4),
        bacen_validated BOOLEAN DEFAULT FALSE NOT NULL,
        bacen_validation_date TIMESTAMP,
        bacen_validation_data JSONB,
        
        -- Status & Approval
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        approved BOOLEAN DEFAULT FALSE NOT NULL,
        approved_at TIMESTAMP,
        approved_by VARCHAR(100),
        rejection_reason TEXT,
        
        -- Contract
        contract_number VARCHAR(50),
        contract_url TEXT,
        contract_signed_at TIMESTAMP,
        
        -- Institution
        institution_name VARCHAR(100),
        institution_code VARCHAR(50),
        
        -- Payment Schedule
        payment_schedule JSONB,
        application_metadata JSONB,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        submitted_at TIMESTAMP
      );
    `);

        this.addSql(`
      CREATE INDEX idx_financing_application_customer_id ON financing_application(customer_id);
      CREATE INDEX idx_financing_application_quote_id ON financing_application(quote_id);
      CREATE INDEX idx_financing_application_credit_analysis_id ON financing_application(credit_analysis_id);
      CREATE INDEX idx_financing_application_order_id ON financing_application(order_id);
      CREATE INDEX idx_financing_application_status ON financing_application(status);
      CREATE INDEX idx_financing_application_approved ON financing_application(approved);
      CREATE INDEX idx_financing_application_created_at ON financing_application(created_at DESC);
    `);

        // ============================================
        // 4. ORDER FULFILLMENT TABLES
        // ============================================

        this.addSql(`
      CREATE TABLE IF NOT EXISTS order_fulfillment (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL,
        
        -- Status
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        
        -- Picking
        picking_started_at TIMESTAMP,
        picking_completed_at TIMESTAMP,
        picked_by VARCHAR(100),
        picked_items JSONB,
        
        -- Packing
        packing_started_at TIMESTAMP,
        packing_completed_at TIMESTAMP,
        packed_by VARCHAR(100),
        number_of_packages INTEGER DEFAULT 1 NOT NULL,
        package_dimensions JSONB,
        
        -- Warehouse
        warehouse_id VARCHAR(100),
        warehouse_name VARCHAR(255),
        warehouse_notes JSONB,
        
        -- Metadata
        fulfillment_metadata JSONB,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

        this.addSql(`
      CREATE INDEX idx_order_fulfillment_order_id ON order_fulfillment(order_id);
      CREATE INDEX idx_order_fulfillment_status ON order_fulfillment(status);
      CREATE INDEX idx_order_fulfillment_created_at ON order_fulfillment(created_at DESC);
    `);

        this.addSql(`
      CREATE TABLE IF NOT EXISTS order_shipment (
        id UUID PRIMARY KEY,
        fulfillment_id UUID NOT NULL,
        
        -- Carrier
        carrier VARCHAR(100) NOT NULL,
        carrier_code VARCHAR(50),
        service_type VARCHAR(100),
        
        -- Tracking
        tracking_code VARCHAR(100) UNIQUE NOT NULL,
        tracking_url TEXT,
        shipment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        
        -- Dates
        shipped_at TIMESTAMP,
        estimated_delivery_date TIMESTAMP,
        actual_delivery_date TIMESTAMP,
        
        -- Address
        shipping_address JSONB NOT NULL,
        
        -- Tracking Events
        tracking_events JSONB,
        
        -- Delivery
        delivered_to VARCHAR(255),
        delivery_notes TEXT,
        signature_required BOOLEAN DEFAULT FALSE NOT NULL,
        signature_url TEXT,
        
        -- Cost
        shipping_cost DECIMAL(10, 2),
        currency_code VARCHAR(3) DEFAULT 'BRL' NOT NULL,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        
        CONSTRAINT fk_order_shipment_fulfillment 
          FOREIGN KEY (fulfillment_id) 
          REFERENCES order_fulfillment(id) 
          ON DELETE CASCADE
      );
    `);

        this.addSql(`
      CREATE INDEX idx_order_shipment_fulfillment_id ON order_shipment(fulfillment_id);
      CREATE INDEX idx_order_shipment_tracking_code ON order_shipment(tracking_code);
      CREATE INDEX idx_order_shipment_shipment_status ON order_shipment(shipment_status);
      CREATE INDEX idx_order_shipment_shipped_at ON order_shipment(shipped_at DESC);
    `);

        // ============================================
        // 5. TRIGGERS FOR UPDATED_AT
        // ============================================

        this.addSql(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        const tables = [
            'solar_calculation',
            'credit_analysis',
            'financing_application',
            'order_fulfillment',
            'order_shipment',
        ];

        for (const table of tables) {
            this.addSql(`
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
        }
    }

    async down(): Promise<void> {
        // Drop in reverse order due to foreign keys
        this.addSql('DROP TABLE IF EXISTS order_shipment CASCADE;');
        this.addSql('DROP TABLE IF EXISTS order_fulfillment CASCADE;');
        this.addSql('DROP TABLE IF EXISTS financing_application CASCADE;');
        this.addSql('DROP TABLE IF EXISTS financing_offer CASCADE;');
        this.addSql('DROP TABLE IF EXISTS credit_analysis CASCADE;');
        this.addSql('DROP TABLE IF EXISTS solar_calculation_kit CASCADE;');
        this.addSql('DROP TABLE IF EXISTS solar_calculation CASCADE;');
        this.addSql('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;');
    }
}
