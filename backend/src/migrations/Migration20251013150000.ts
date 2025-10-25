import { Migration } from '@mikro-orm/migrations'

/**
 * Migration: Create Phase 2 Tables for Complete API Coverage
 *
 * Adiciona tabelas para:
 * - Financing proposals (propostas de financiamento)
 * - Quotes (cotações)
 * - Solar calculations (cálculos solares)
 * - Approvals (aprovações)
 * - Catalog access logs (logs de acesso ao catálogo)
 *
 * IMPACTO:
 * - Cobertura completa das APIs críticas
 * - Rastreamento de propostas e aprovações
 * - Histórico de cálculos solares
 * - Analytics de acesso ao catálogo
 */
export class Migration20251013150000 extends Migration {
    async up(): Promise<void> {
        // ==========================================
        // 1. FINANCING_PROPOSAL TABLE
        // ==========================================
        this.addSql(`
            CREATE TABLE financing_proposal (
                id VARCHAR(255) PRIMARY KEY,

                -- Relacionamentos
                customer_id VARCHAR(255) NOT NULL,
                quote_id VARCHAR(255),
                credit_analysis_id VARCHAR(255),

                -- Dados da proposta
                modality VARCHAR(50) NOT NULL,
                requested_amount DECIMAL(15,2) NOT NULL,
                approved_amount DECIMAL(15,2),
                down_payment_amount DECIMAL(15,2) DEFAULT 0,
                requested_term_months INTEGER NOT NULL,
                approved_term_months INTEGER,
                amortization_system VARCHAR(20) DEFAULT 'PRICE',

                -- Taxas e custos
                interest_rate_monthly DECIMAL(5,4),
                cet_monthly DECIMAL(5,4),
                cet_annual DECIMAL(5,4),
                iof_total DECIMAL(10,2),
                tac DECIMAL(10,2),
                insurance_monthly DECIMAL(10,2),

                -- Status e workflow
                status VARCHAR(50) DEFAULT 'draft' NOT NULL,
                status_reason TEXT,
                submitted_at TIMESTAMP,
                approved_at TIMESTAMP,
                rejected_at TIMESTAMP,
                expires_at TIMESTAMP,

                -- Instituição financeira
                institution VARCHAR(255),
                institution_contact VARCHAR(255),
                institution_email VARCHAR(255),

                -- Documentação
                required_documents JSONB,
                submitted_documents JSONB,
                pending_documents JSONB,

                -- Notas e observações
                notes TEXT,
                internal_notes TEXT,
                risk_assessment TEXT,

                -- Metadata
                ip_hash VARCHAR(64),
                user_agent TEXT,
                created_by VARCHAR(255),
                updated_by VARCHAR(255),

                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP
            );
        `)

        this.addSql(`
            CREATE INDEX idx_financing_customer ON financing_proposal(customer_id);
            CREATE INDEX idx_financing_quote ON financing_proposal(quote_id);
            CREATE INDEX idx_financing_status ON financing_proposal(status);
            CREATE INDEX idx_financing_created ON financing_proposal(created_at);
            CREATE INDEX idx_financing_expires ON financing_proposal(expires_at);
        `)

        // ==========================================
        // 2. QUOTE TABLE
        // ==========================================
        this.addSql(`
            CREATE TABLE quote (
                id VARCHAR(255) PRIMARY KEY,

                -- Relacionamentos
                customer_id VARCHAR(255) NOT NULL,
                cart_id VARCHAR(255),
                order_id VARCHAR(255),

                -- Dados da cotação
                status VARCHAR(50) DEFAULT 'draft' NOT NULL,
                type VARCHAR(50) DEFAULT 'solar_system',

                -- Itens da cotação
                items JSONB NOT NULL,

                -- Totais
                subtotal DECIMAL(15,2) DEFAULT 0,
                tax_total DECIMAL(15,2) DEFAULT 0,
                discount_total DECIMAL(15,2) DEFAULT 0,
                total DECIMAL(15,2) DEFAULT 0,

                -- Sistema solar (se aplicável)
                solar_system_config JSONB,

                -- Endereço de instalação
                installation_address JSONB,

                -- Prazo de validade
                expires_at TIMESTAMP,
                expired_at TIMESTAMP,

                -- Notas
                customer_notes TEXT,
                internal_notes TEXT,

                -- Metadata
                ip_hash VARCHAR(64),
                user_agent TEXT,
                utm_source VARCHAR(255),
                utm_medium VARCHAR(255),
                utm_campaign VARCHAR(255),

                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP,
                submitted_at TIMESTAMP,
                approved_at TIMESTAMP
            );
        `)

        this.addSql(`
            CREATE INDEX idx_quote_customer ON quote(customer_id);
            CREATE INDEX idx_quote_cart ON quote(cart_id);
            CREATE INDEX idx_quote_status ON quote(status);
            CREATE INDEX idx_quote_created ON quote(created_at);
            CREATE INDEX idx_quote_expires ON quote(expires_at);
        `)

        // ==========================================
        // 3. SOLAR_CALCULATION TABLE
        // ==========================================
        this.addSql(`
            CREATE TABLE solar_calculation (
                id VARCHAR(255) PRIMARY KEY,

                -- Relacionamentos
                customer_id VARCHAR(255),
                quote_id VARCHAR(255),

                -- Input parameters
                consumo_kwh_mes DECIMAL(10,2) NOT NULL,
                uf VARCHAR(2) NOT NULL,
                cep VARCHAR(10),
                municipio VARCHAR(255),
                latitude DECIMAL(10,7),
                longitude DECIMAL(10,7),

                -- System configuration
                tipo_sistema VARCHAR(20) DEFAULT 'on-grid',
                fase VARCHAR(20) DEFAULT 'monofasico',
                oversizing_target INTEGER DEFAULT 130,
                tipo_telhado VARCHAR(50),
                area_disponivel_m2 DECIMAL(8,2),
                orientacao VARCHAR(10),
                inclinacao_graus DECIMAL(5,2),

                -- Results
                potencia_sistema_kwp DECIMAL(8,2),
                area_necessaria_m2 DECIMAL(8,2),
                quantidade_paineis INTEGER,
                quantidade_inversores INTEGER,
                quantidade_baterias INTEGER,
                quantidade_controladores INTEGER,

                -- Financial results
                custo_total_sistema DECIMAL(15,2),
                custo_instalacao DECIMAL(15,2),
                tarifa_energia_kwh DECIMAL(6,4),
                economia_mensal DECIMAL(10,2),
                payback_meses DECIMAL(8,2),
                roi_percentual DECIMAL(6,2),
                lcoe DECIMAL(6,4),

                -- Environmental impact
                co2_evitado_kg_ano DECIMAL(12,2),
                arvores_equivalentes INTEGER,

                -- Compliance
                mmgd_compliant BOOLEAN DEFAULT FALSE,
                mmgd_requirements JSONB,

                -- Cache
                cache_key VARCHAR(255),
                cached_at TIMESTAMP,
                cache_ttl_hours INTEGER DEFAULT 24,

                -- Metadata
                ip_hash VARCHAR(64),
                user_agent TEXT,
                calculation_version VARCHAR(20),

                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP
            );
        `)

        this.addSql(`
            CREATE INDEX idx_solar_customer ON solar_calculation(customer_id);
            CREATE INDEX idx_solar_quote ON solar_calculation(quote_id);
            CREATE INDEX idx_solar_uf ON solar_calculation(uf);
            CREATE INDEX idx_solar_created ON solar_calculation(created_at);
            CREATE INDEX idx_solar_cache ON solar_calculation(cache_key);
        `)

        // ==========================================
        // 4. APPROVAL TABLE
        // ==========================================
        this.addSql(`
            CREATE TABLE approval (
                id VARCHAR(255) PRIMARY KEY,

                -- Relacionamentos
                cart_id VARCHAR(255) NOT NULL,
                order_id VARCHAR(255),
                customer_id VARCHAR(255) NOT NULL,
                approver_id VARCHAR(255),

                -- Tipo e status
                type VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending' NOT NULL,

                -- Dados da aprovação
                amount DECIMAL(15,2) NOT NULL,
                currency_code VARCHAR(3) DEFAULT 'BRL',
                description TEXT,

                -- Regras de aprovação
                rules JSONB,
                required_approvals INTEGER DEFAULT 1,
                current_approvals INTEGER DEFAULT 0,

                -- Workflow
                requested_at TIMESTAMP DEFAULT NOW(),
                approved_at TIMESTAMP,
                rejected_at TIMESTAMP,
                expires_at TIMESTAMP,

                -- Motivos
                approval_reason TEXT,
                rejection_reason TEXT,

                -- Metadata
                metadata JSONB,
                ip_hash VARCHAR(64),
                user_agent TEXT,

                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP
            );
        `)

        this.addSql(`
            CREATE INDEX idx_approval_cart ON approval(cart_id);
            CREATE INDEX idx_approval_customer ON approval(customer_id);
            CREATE INDEX idx_approval_status ON approval(status);
            CREATE INDEX idx_approval_type ON approval(type);
            CREATE INDEX idx_approval_created ON approval(created_at);
        `)

        // ==========================================
        // 5. CATALOG_ACCESS_LOG TABLE
        // ==========================================
        this.addSql(`
            CREATE TABLE catalog_access_log (
                id VARCHAR(255) PRIMARY KEY,

                -- Relacionamentos
                customer_id VARCHAR(255),
                session_id VARCHAR(255),

                -- Acesso
                endpoint VARCHAR(500) NOT NULL,
                method VARCHAR(10) DEFAULT 'GET',
                category VARCHAR(100),
                product_sku VARCHAR(255),
                search_term VARCHAR(500),

                -- Resultados
                results_count INTEGER DEFAULT 0,
                response_time_ms INTEGER,
                cache_hit BOOLEAN DEFAULT FALSE,

                -- Filtros aplicados
                filters JSONB,

                -- Device info
                user_agent TEXT,
                ip_hash VARCHAR(64),
                country VARCHAR(2),
                region VARCHAR(100),
                city VARCHAR(100),

                -- Performance
                page_load_time INTEGER,
                time_to_interactive INTEGER,

                -- Business metrics
                led_to_quote BOOLEAN DEFAULT FALSE,
                led_to_cart BOOLEAN DEFAULT FALSE,
                led_to_purchase BOOLEAN DEFAULT FALSE,
                quote_id VARCHAR(255),
                cart_id VARCHAR(255),
                order_id VARCHAR(255),

                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            );
        `)

        this.addSql(`
            CREATE INDEX idx_catalog_customer ON catalog_access_log(customer_id);
            CREATE INDEX idx_catalog_session ON catalog_access_log(session_id);
            CREATE INDEX idx_catalog_endpoint ON catalog_access_log(endpoint);
            CREATE INDEX idx_catalog_category ON catalog_access_log(category);
            CREATE INDEX idx_catalog_created ON catalog_access_log(created_at);
            CREATE INDEX idx_catalog_quote ON catalog_access_log(quote_id);
            CREATE INDEX idx_catalog_cart ON catalog_access_log(cart_id);
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS catalog_access_log CASCADE;')
        this.addSql('DROP TABLE IF EXISTS approval CASCADE;')
        this.addSql('DROP TABLE IF EXISTS solar_calculation CASCADE;')
        this.addSql('DROP TABLE IF EXISTS quote CASCADE;')
        this.addSql('DROP TABLE IF EXISTS financing_proposal CASCADE;')
    }
}