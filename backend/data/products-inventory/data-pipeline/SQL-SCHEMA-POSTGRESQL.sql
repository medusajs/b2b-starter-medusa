-- ============================================================================
-- YSH Data Pipeline - PostgreSQL Database Schema
-- ============================================================================
-- Version: 1.0.0
-- Date: October 14, 2025
-- Purpose: Complete DDL for all tables, indexes, constraints, partitions
-- Database: PostgreSQL 14+
-- Performance: Optimized for high-volume reads/writes with partitioning
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE SETUP
-- ============================================================================

-- Create database (run as superuser)
-- CREATE DATABASE ysh_pipeline
--     WITH 
--     OWNER = ysh_admin
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'pt_BR.UTF-8'
--     LC_CTYPE = 'pt_BR.UTF-8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     TEMPLATE = template0;

-- Connect to database
\c ysh_pipeline;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram similarity search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN indexes for arrays
CREATE EXTENSION IF NOT EXISTS "postgis";        -- Geospatial data (optional)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring

-- ============================================================================
-- SECTION 2: SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS aneel;        -- ANEEL data tables
CREATE SCHEMA IF NOT EXISTS products;     -- Product catalog tables
CREATE SCHEMA IF NOT EXISTS pipeline;     -- Pipeline metadata tables
CREATE SCHEMA IF NOT EXISTS audit;        -- Audit logs

-- Set search path
SET search_path TO aneel, products, pipeline, public;

-- ============================================================================
-- SECTION 3: CUSTOM TYPES
-- ============================================================================

-- Consumer class enum
CREATE TYPE aneel.consumer_class_type AS ENUM (
    'RESIDENCIAL',
    'COMERCIAL',
    'INDUSTRIAL',
    'RURAL',
    'PODER_PUBLICO',
    'ILUMINACAO_PUBLICA',
    'SERVICO_PUBLICO'
);

-- Source type enum
CREATE TYPE aneel.source_type AS ENUM (
    'SOLAR_FOTOVOLTAICA',
    'EOLICA',
    'BIOMASSA',
    'HIDRAULICA',
    'GAS_NATURAL',
    'HIBRIDA',
    'OUTRAS'
);

-- Compensation modality enum
CREATE TYPE aneel.compensation_modality_type AS ENUM (
    'AUTOCONSUMO_LOCAL',
    'AUTOCONSUMO_REMOTO',
    'GERACAO_COMPARTILHADA',
    'EMUC',
    'COOPERATIVA'
);

-- Certification status enum
CREATE TYPE aneel.certification_status_type AS ENUM (
    'VALID',
    'EXPIRED',
    'SUSPENDED',
    'REVOKED',
    'PENDING'
);

-- System type enum (products)
CREATE TYPE products.system_type AS ENUM (
    'ON_GRID',
    'OFF_GRID',
    'HYBRID'
);

-- Product status enum
CREATE TYPE products.product_status_type AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'OUT_OF_STOCK',
    'DISCONTINUED',
    'DRAFT'
);

-- Pipeline status enum
CREATE TYPE pipeline.ingestion_status_type AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'SUCCESS',
    'FAILED',
    'PARTIAL',
    'SKIPPED'
);

-- ============================================================================
-- SECTION 4: ANEEL SCHEMA TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1: ANEEL Datasets (Raw metadata from ANEEL APIs)
-- ----------------------------------------------------------------------------

CREATE TABLE aneel.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aneel_id VARCHAR(100) NOT NULL UNIQUE,  -- GUID from ANEEL
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    modified TIMESTAMPTZ NOT NULL,
    published TIMESTAMPTZ,
    format VARCHAR(50),
    category VARCHAR(100),
    keywords TEXT[],
    license TEXT,
    spatial VARCHAR(10),  -- BR-XX state code
    temporal_start DATE,
    temporal_end DATE,
    update_frequency VARCHAR(50),
    access_level VARCHAR(20) DEFAULT 'public',
    publisher_name TEXT,
    publisher_email VARCHAR(255),
    contact_name TEXT,
    contact_email VARCHAR(255),
    theme TEXT[],
    
    -- Metadata
    data_quality_score NUMERIC(3,2),  -- 0.00 to 1.00
    source_api VARCHAR(50),  -- 'RSS', 'DCAT_US', 'DCAT_AP', etc.
    raw_metadata JSONB,  -- Full API response
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for datasets
CREATE INDEX idx_datasets_aneel_id ON aneel.datasets(aneel_id);
CREATE INDEX idx_datasets_category ON aneel.datasets(category);
CREATE INDEX idx_datasets_modified ON aneel.datasets(modified DESC);
CREATE INDEX idx_datasets_spatial ON aneel.datasets(spatial);
CREATE INDEX idx_datasets_keywords_gin ON aneel.datasets USING GIN(keywords);
CREATE INDEX idx_datasets_title_trgm ON aneel.datasets USING GIN(title gin_trgm_ops);
CREATE INDEX idx_datasets_description_trgm ON aneel.datasets USING GIN(description gin_trgm_ops);

-- Full-text search index
CREATE INDEX idx_datasets_fts ON aneel.datasets USING GIN(
    to_tsvector('portuguese', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

COMMENT ON TABLE aneel.datasets IS 'ANEEL open data catalog metadata from RSS/DCAT APIs';

-- ----------------------------------------------------------------------------
-- 4.2: Generation Units (Geração Distribuída)
-- ----------------------------------------------------------------------------

CREATE TABLE aneel.generation_units (
    id BIGSERIAL PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL UNIQUE,  -- ANEEL unit identifier
    
    -- Consumer information
    consumer_class aneel.consumer_class_type NOT NULL,
    consumer_name TEXT,
    cpf_cnpj VARCHAR(18),
    
    -- Utility information
    utility_company VARCHAR(255) NOT NULL,
    utility_code CHAR(4) NOT NULL,  -- 4-digit utility code
    
    -- Location
    municipality VARCHAR(255) NOT NULL,
    state CHAR(5) NOT NULL CHECK (state ~ '^BR-[A-Z]{2}$'),  -- BR-MG, BR-SP, etc.
    cep VARCHAR(9),
    latitude NUMERIC(10, 7) CHECK (latitude BETWEEN -33.75 AND 5.27),
    longitude NUMERIC(10, 7) CHECK (longitude BETWEEN -73.99 AND -34.79),
    geolocation GEOGRAPHY(POINT, 4326),  -- PostGIS point
    
    -- Technical specifications
    installed_power_kw NUMERIC(10, 3) NOT NULL CHECK (installed_power_kw > 0 AND installed_power_kw <= 5000),
    source_type aneel.source_type NOT NULL,
    compensation_modality aneel.compensation_modality_type NOT NULL,
    
    -- Connection dates
    connection_date DATE,
    commercial_operation_date DATE,
    registration_date DATE NOT NULL,
    
    -- Equipment details
    panel_count INTEGER,
    panel_power_wp INTEGER,
    panel_manufacturer VARCHAR(255),
    panel_model VARCHAR(255),
    inverter_power_kw NUMERIC(10, 3),
    inverter_manufacturer VARCHAR(255),
    inverter_model VARCHAR(255),
    
    -- Generation data (monthly averages)
    avg_monthly_generation_kwh NUMERIC(12, 2),
    capacity_factor NUMERIC(5, 2),  -- Percentage 0-100
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    deactivation_date DATE,
    
    -- Metadata
    dataset_id UUID REFERENCES aneel.datasets(id),
    raw_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for generation_units
CREATE INDEX idx_gen_units_unit_id ON aneel.generation_units(unit_id);
CREATE INDEX idx_gen_units_state ON aneel.generation_units(state);
CREATE INDEX idx_gen_units_municipality ON aneel.generation_units(municipality);
CREATE INDEX idx_gen_units_utility_code ON aneel.generation_units(utility_code);
CREATE INDEX idx_gen_units_consumer_class ON aneel.generation_units(consumer_class);
CREATE INDEX idx_gen_units_source_type ON aneel.generation_units(source_type);
CREATE INDEX idx_gen_units_power ON aneel.generation_units(installed_power_kw);
CREATE INDEX idx_gen_units_connection_date ON aneel.generation_units(connection_date DESC);
CREATE INDEX idx_gen_units_geolocation ON aneel.generation_units USING GIST(geolocation);

-- Composite index for common queries
CREATE INDEX idx_gen_units_state_source ON aneel.generation_units(state, source_type);

COMMENT ON TABLE aneel.generation_units IS 'Distributed generation units registered with ANEEL';

-- ----------------------------------------------------------------------------
-- 4.3: Tariffs (Tarifas de Energia)
-- ----------------------------------------------------------------------------

CREATE TABLE aneel.tariffs (
    id BIGSERIAL PRIMARY KEY,
    tariff_id VARCHAR(100) NOT NULL UNIQUE,  -- Composite: utility_code + class + year
    
    -- Utility information
    utility_code CHAR(4) NOT NULL,
    utility_name VARCHAR(255) NOT NULL,
    utility_cnpj VARCHAR(18),
    
    -- Tariff components (R$/kWh)
    te_value NUMERIC(10, 5) NOT NULL CHECK (te_value >= 0),  -- Tarifa de Energia
    tusd_value NUMERIC(10, 5) NOT NULL CHECK (tusd_value >= 0),  -- Tarifa de Uso do Sistema de Distribuição
    total_tariff NUMERIC(10, 5) GENERATED ALWAYS AS (te_value + tusd_value) STORED,
    
    -- Classification
    consumer_class aneel.consumer_class_type NOT NULL,
    subclass VARCHAR(10),  -- B1, B2, B3, A1, A2, A3, A4, AS
    voltage_level VARCHAR(50),  -- Baixa Tensão, Média Tensão, Alta Tensão
    modality VARCHAR(50),  -- Convencional, Horária Verde, Azul, Branca
    
    -- Validity period
    validity_start DATE NOT NULL,
    validity_end DATE,
    
    -- Regulatory information
    resolution_number VARCHAR(50),  -- REH nº 3.059/2023
    approval_date DATE,
    publication_date DATE,
    
    -- Tax flags
    includes_icms BOOLEAN DEFAULT true,
    includes_pis_cofins BOOLEAN DEFAULT true,
    
    -- Metadata
    dataset_id UUID REFERENCES aneel.datasets(id),
    raw_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for tariffs
CREATE INDEX idx_tariffs_utility_code ON aneel.tariffs(utility_code);
CREATE INDEX idx_tariffs_consumer_class ON aneel.tariffs(consumer_class);
CREATE INDEX idx_tariffs_validity_start ON aneel.tariffs(validity_start DESC);
CREATE INDEX idx_tariffs_validity_end ON aneel.tariffs(validity_end) WHERE validity_end IS NOT NULL;

-- Composite index for active tariff lookup
CREATE INDEX idx_tariffs_active ON aneel.tariffs(utility_code, consumer_class, validity_start DESC)
    WHERE validity_end IS NULL OR validity_end > CURRENT_DATE;

COMMENT ON TABLE aneel.tariffs IS 'Electricity tariff data from Brazilian utilities';

-- ----------------------------------------------------------------------------
-- 4.4: Certifications (INMETRO/ANEEL/IEC)
-- ----------------------------------------------------------------------------

CREATE TABLE aneel.certifications (
    id BIGSERIAL PRIMARY KEY,
    certificate_id VARCHAR(100) NOT NULL UNIQUE,
    certificate_number VARCHAR(100) NOT NULL,
    
    -- Certificate type
    certificate_type VARCHAR(50) NOT NULL,  -- INMETRO, ANEEL, IEC, UL, TUV, CE
    
    -- Equipment information
    equipment_type VARCHAR(50) NOT NULL,  -- modulo_fotovoltaico, inversor, stringbox, etc.
    manufacturer VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    
    -- Technical specifications
    power_rating_w NUMERIC(10, 2),
    efficiency_percent NUMERIC(5, 2) CHECK (efficiency_percent BETWEEN 0 AND 100),
    voltage_input_min_v NUMERIC(8, 2),
    voltage_input_max_v NUMERIC(8, 2),
    voltage_output_v NUMERIC(8, 2),
    current_max_a NUMERIC(8, 2),
    
    -- Standards compliance
    standards_compliance TEXT[],  -- ['NBR 16690', 'IEC 61215', 'IEC 61730']
    
    -- Certificate dates
    issue_date DATE NOT NULL,
    expiry_date DATE,
    last_inspection_date DATE,
    
    -- Status
    status aneel.certification_status_type NOT NULL DEFAULT 'VALID',
    revocation_reason TEXT,
    
    -- Documents
    certificate_url TEXT,
    test_report_url TEXT,
    
    -- Metadata
    dataset_id UUID REFERENCES aneel.datasets(id),
    raw_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_expiry_after_issue CHECK (expiry_date IS NULL OR expiry_date > issue_date)
);

-- Indexes for certifications
CREATE INDEX idx_cert_certificate_number ON aneel.certifications(certificate_number);
CREATE INDEX idx_cert_type ON aneel.certifications(certificate_type);
CREATE INDEX idx_cert_equipment_type ON aneel.certifications(equipment_type);
CREATE INDEX idx_cert_manufacturer ON aneel.certifications(manufacturer);
CREATE INDEX idx_cert_model ON aneel.certifications(model);
CREATE INDEX idx_cert_status ON aneel.certifications(status);
CREATE INDEX idx_cert_expiry_date ON aneel.certifications(expiry_date) WHERE expiry_date IS NOT NULL;

-- Composite index for equipment lookup
CREATE INDEX idx_cert_equipment_lookup ON aneel.certifications(equipment_type, manufacturer, model, status);

COMMENT ON TABLE aneel.certifications IS 'Equipment certifications from INMETRO, ANEEL, and international bodies';

-- ============================================================================
-- SECTION 5: PRODUCTS SCHEMA TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1: Products (All solar equipment)
-- ----------------------------------------------------------------------------

CREATE TABLE products.products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    
    -- Product information
    name TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- paineis, inversores, baterias, estruturas, acessorios
    subcategory VARCHAR(50),
    
    -- Manufacturer
    manufacturer VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    
    -- Technical specifications (JSONB for flexibility)
    specifications JSONB NOT NULL,  -- Power, voltage, efficiency, dimensions, weight, etc.
    
    -- Pricing (R$)
    cost_price NUMERIC(12, 2) CHECK (cost_price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price >= 0),
    markup_percent NUMERIC(5, 2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    reorder_point INTEGER,
    
    -- Status
    status products.product_status_type NOT NULL DEFAULT 'ACTIVE',
    
    -- Certifications
    inmetro_certified BOOLEAN DEFAULT false,
    inmetro_certificate_number VARCHAR(100),
    certification_id BIGINT REFERENCES aneel.certifications(id),
    
    -- Images & documents
    image_urls TEXT[],
    datasheet_url TEXT,
    manual_url TEXT,
    
    -- SEO
    seo_slug VARCHAR(255) UNIQUE,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    
    -- E-commerce (Medusa.js integration)
    medusa_product_id VARCHAR(100) UNIQUE,
    
    -- Metadata
    raw_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_sku ON products.products(sku);
CREATE INDEX idx_products_category ON products.products(category);
CREATE INDEX idx_products_manufacturer ON products.products(manufacturer);
CREATE INDEX idx_products_status ON products.products(status);
CREATE INDEX idx_products_medusa_id ON products.products(medusa_product_id) WHERE medusa_product_id IS NOT NULL;
CREATE INDEX idx_products_seo_slug ON products.products(seo_slug) WHERE seo_slug IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_products_fts ON products.products USING GIN(
    to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(manufacturer, '') || ' ' || COALESCE(model, ''))
);

-- GIN index for specifications JSONB
CREATE INDEX idx_products_specs_gin ON products.products USING GIN(specifications);

COMMENT ON TABLE products.products IS 'Solar equipment product catalog';

-- ----------------------------------------------------------------------------
-- 5.2: Solar Kits (Complete systems)
-- ----------------------------------------------------------------------------

CREATE TABLE products.solar_kits (
    id BIGSERIAL PRIMARY KEY,
    kit_id VARCHAR(100) NOT NULL UNIQUE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    
    -- Kit information
    name TEXT NOT NULL,
    description TEXT,
    system_type products.system_type NOT NULL,
    
    -- Power specifications
    power_kwp NUMERIC(10, 3) NOT NULL CHECK (power_kwp > 0),
    voltage_phase VARCHAR(50) NOT NULL,  -- 110V Mono, 220V Bi, 380V Tri
    
    -- Generation estimates
    avg_monthly_generation_kwh NUMERIC(10, 2),
    estimated_coverage_percent NUMERIC(5, 2),  -- % of consumption covered
    
    -- Components (references to products table)
    components JSONB NOT NULL,  -- Array of {product_id, quantity, component_type}
    
    -- Pricing (R$)
    kit_cost NUMERIC(12, 2) NOT NULL CHECK (kit_cost >= 0),
    installation_cost NUMERIC(12, 2),
    documentation_cost NUMERIC(12, 2),
    total_price NUMERIC(12, 2) GENERATED ALWAYS AS (
        kit_cost + COALESCE(installation_cost, 0) + COALESCE(documentation_cost, 0)
    ) STORED,
    
    -- Regional pricing variations
    regional_adjustments JSONB,  -- {state: adjustment_percent}
    
    -- Target consumer
    target_consumer_class aneel.consumer_class_type,
    recommended_consumption_min_kwh INTEGER,
    recommended_consumption_max_kwh INTEGER,
    
    -- Warranty & support
    warranty_years INTEGER DEFAULT 5,
    support_level VARCHAR(50),
    
    -- Status
    status products.product_status_type NOT NULL DEFAULT 'ACTIVE',
    
    -- E-commerce (Medusa.js integration)
    medusa_product_id VARCHAR(100) UNIQUE,
    
    -- Images & documents
    image_urls TEXT[],
    technical_sheet_url TEXT,
    installation_guide_url TEXT,
    
    -- SEO
    seo_slug VARCHAR(255) UNIQUE,
    seo_title TEXT,
    seo_description TEXT,
    
    -- Metadata
    raw_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for solar_kits
CREATE INDEX idx_kits_kit_id ON products.solar_kits(kit_id);
CREATE INDEX idx_kits_system_type ON products.solar_kits(system_type);
CREATE INDEX idx_kits_power ON products.solar_kits(power_kwp);
CREATE INDEX idx_kits_consumer_class ON products.solar_kits(target_consumer_class);
CREATE INDEX idx_kits_status ON products.solar_kits(status);
CREATE INDEX idx_kits_medusa_id ON products.solar_kits(medusa_product_id) WHERE medusa_product_id IS NOT NULL;

-- GIN index for components JSONB
CREATE INDEX idx_kits_components_gin ON products.solar_kits USING GIN(components);

COMMENT ON TABLE products.solar_kits IS 'Pre-configured solar energy system kits';

-- ----------------------------------------------------------------------------
-- 5.3: Kit Components (Junction table with additional data)
-- ----------------------------------------------------------------------------

CREATE TABLE products.kit_components (
    id BIGSERIAL PRIMARY KEY,
    kit_id BIGINT NOT NULL REFERENCES products.solar_kits(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products.products(id) ON DELETE RESTRICT,
    
    -- Component details
    component_type VARCHAR(50) NOT NULL,  -- panel, inverter, battery, structure, cable, etc.
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Position in kit (for ordering display)
    display_order INTEGER DEFAULT 0,
    is_optional BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(kit_id, product_id, component_type)
);

-- Indexes for kit_components
CREATE INDEX idx_kit_comp_kit_id ON products.kit_components(kit_id);
CREATE INDEX idx_kit_comp_product_id ON products.kit_components(product_id);
CREATE INDEX idx_kit_comp_type ON products.kit_components(component_type);

COMMENT ON TABLE products.kit_components IS 'Components that make up each solar kit';

-- ============================================================================
-- SECTION 6: PIPELINE SCHEMA TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1: Ingestion Log (Track all data ingestion runs)
-- ----------------------------------------------------------------------------

CREATE TABLE pipeline.ingestion_log (
    id BIGSERIAL PRIMARY KEY,
    run_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Run information
    workflow_name VARCHAR(100) NOT NULL,  -- daily_full_ingestion, hourly_incremental, fallback_recovery
    trigger_type VARCHAR(50) NOT NULL,  -- scheduled, manual, webhook, fallback
    
    -- Execution
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
    ) STORED,
    
    -- Status
    status pipeline.ingestion_status_type NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    error_stack TEXT,
    
    -- Metrics
    datasets_fetched INTEGER DEFAULT 0,
    datasets_processed INTEGER DEFAULT 0,
    datasets_inserted INTEGER DEFAULT 0,
    datasets_updated INTEGER DEFAULT 0,
    datasets_failed INTEGER DEFAULT 0,
    
    -- Data sources
    sources_attempted TEXT[],
    sources_succeeded TEXT[],
    sources_failed TEXT[],
    
    -- Performance metrics
    api_calls_count INTEGER DEFAULT 0,
    cache_hit_count INTEGER DEFAULT 0,
    cache_miss_count INTEGER DEFAULT 0,
    
    -- Airflow/orchestration metadata
    airflow_dag_id VARCHAR(255),
    airflow_run_id VARCHAR(255),
    airflow_task_id VARCHAR(255),
    
    -- Metadata
    execution_metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (started_at);

-- Create partitions for ingestion_log (monthly)
CREATE TABLE pipeline.ingestion_log_2025_10 PARTITION OF pipeline.ingestion_log
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE pipeline.ingestion_log_2025_11 PARTITION OF pipeline.ingestion_log
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE pipeline.ingestion_log_2025_12 PARTITION OF pipeline.ingestion_log
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Indexes for ingestion_log
CREATE INDEX idx_ingestion_log_run_id ON pipeline.ingestion_log(run_id);
CREATE INDEX idx_ingestion_log_workflow ON pipeline.ingestion_log(workflow_name);
CREATE INDEX idx_ingestion_log_status ON pipeline.ingestion_log(status);
CREATE INDEX idx_ingestion_log_started_at ON pipeline.ingestion_log(started_at DESC);

COMMENT ON TABLE pipeline.ingestion_log IS 'Audit log for all data ingestion workflows';

-- ----------------------------------------------------------------------------
-- 6.2: Data Quality Checks
-- ----------------------------------------------------------------------------

CREATE TABLE pipeline.data_quality_checks (
    id BIGSERIAL PRIMARY KEY,
    check_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Run reference
    ingestion_run_id UUID REFERENCES pipeline.ingestion_log(run_id),
    
    -- Check information
    check_name VARCHAR(100) NOT NULL,
    check_type VARCHAR(50) NOT NULL,  -- completeness, accuracy, consistency, validity, uniqueness
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100),
    
    -- Results
    check_passed BOOLEAN NOT NULL,
    records_checked INTEGER NOT NULL,
    records_passed INTEGER NOT NULL,
    records_failed INTEGER NOT NULL,
    failure_rate NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE WHEN records_checked > 0 
        THEN (records_failed::NUMERIC / records_checked * 100)::NUMERIC(5, 2)
        ELSE 0 END
    ) STORED,
    
    -- Details
    check_query TEXT,
    failure_examples JSONB,  -- Sample of failed records
    
    -- Timestamps
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (executed_at);

-- Create partitions for data_quality_checks (monthly)
CREATE TABLE pipeline.data_quality_checks_2025_10 PARTITION OF pipeline.data_quality_checks
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE pipeline.data_quality_checks_2025_11 PARTITION OF pipeline.data_quality_checks
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE pipeline.data_quality_checks_2025_12 PARTITION OF pipeline.data_quality_checks
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Indexes
CREATE INDEX idx_dq_checks_run_id ON pipeline.data_quality_checks(ingestion_run_id);
CREATE INDEX idx_dq_checks_table ON pipeline.data_quality_checks(table_name);
CREATE INDEX idx_dq_checks_passed ON pipeline.data_quality_checks(check_passed);

COMMENT ON TABLE pipeline.data_quality_checks IS 'Data quality validation results';

-- ============================================================================
-- SECTION 7: AUDIT SCHEMA TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1: Change Audit Log (Track all data changes)
-- ----------------------------------------------------------------------------

CREATE TABLE audit.change_log (
    id BIGSERIAL PRIMARY KEY,
    
    -- Table reference
    table_schema VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    
    -- Change information
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_fields TEXT[],
    old_values JSONB,
    new_values JSONB,
    
    -- User/system information
    changed_by VARCHAR(255),
    change_source VARCHAR(100),  -- airflow, api, manual, system
    
    -- Timestamps
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (changed_at);

-- Create partitions for change_log (monthly)
CREATE TABLE audit.change_log_2025_10 PARTITION OF audit.change_log
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE audit.change_log_2025_11 PARTITION OF audit.change_log
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE audit.change_log_2025_12 PARTITION OF audit.change_log
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Indexes
CREATE INDEX idx_change_log_table ON audit.change_log(table_schema, table_name);
CREATE INDEX idx_change_log_record_id ON audit.change_log(record_id);
CREATE INDEX idx_change_log_operation ON audit.change_log(operation);
CREATE INDEX idx_change_log_changed_at ON audit.change_log(changed_at DESC);

COMMENT ON TABLE audit.change_log IS 'Complete audit trail of all data changes';

-- ============================================================================
-- SECTION 8: FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 8.1: Update timestamp trigger function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER trigger_update_datasets_timestamp
    BEFORE UPDATE ON aneel.datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_gen_units_timestamp
    BEFORE UPDATE ON aneel.generation_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tariffs_timestamp
    BEFORE UPDATE ON aneel.tariffs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_certifications_timestamp
    BEFORE UPDATE ON aneel.certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_products_timestamp
    BEFORE UPDATE ON products.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_kits_timestamp
    BEFORE UPDATE ON products.solar_kits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_kit_comp_timestamp
    BEFORE UPDATE ON products.kit_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ingestion_log_timestamp
    BEFORE UPDATE ON pipeline.ingestion_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 8.2: Audit log trigger function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[];
    old_vals JSONB;
    new_vals JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.change_log (
            table_schema, table_name, record_id, operation, 
            changed_fields, old_values, new_values, change_source
        ) VALUES (
            TG_TABLE_SCHEMA, TG_TABLE_NAME, NEW.id, 'INSERT',
            NULL, NULL, row_to_json(NEW)::JSONB, 'system'
        );
        RETURN NEW;
    
    ELSIF TG_OP = 'UPDATE' THEN
        -- Detect changed fields
        SELECT ARRAY_AGG(key)
        INTO changed_fields
        FROM jsonb_each(row_to_json(OLD)::JSONB)
        WHERE row_to_json(NEW)::JSONB->key IS DISTINCT FROM row_to_json(OLD)::JSONB->key;
        
        IF changed_fields IS NOT NULL THEN
            INSERT INTO audit.change_log (
                table_schema, table_name, record_id, operation,
                changed_fields, old_values, new_values, change_source
            ) VALUES (
                TG_TABLE_SCHEMA, TG_TABLE_NAME, NEW.id, 'UPDATE',
                changed_fields, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, 'system'
            );
        END IF;
        RETURN NEW;
    
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.change_log (
            table_schema, table_name, record_id, operation,
            changed_fields, old_values, new_values, change_source
        ) VALUES (
            TG_TABLE_SCHEMA, TG_TABLE_NAME, OLD.id, 'DELETE',
            NULL, row_to_json(OLD)::JSONB, NULL, 'system'
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers (optional - can be enabled per table as needed)
-- CREATE TRIGGER trigger_audit_datasets
--     AFTER INSERT OR UPDATE OR DELETE ON aneel.datasets
--     FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

-- ----------------------------------------------------------------------------
-- 8.3: PostGIS geography update trigger
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_geolocation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geolocation = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gen_units_geolocation
    BEFORE INSERT OR UPDATE OF latitude, longitude ON aneel.generation_units
    FOR EACH ROW EXECUTE FUNCTION update_geolocation();

-- ============================================================================
-- SECTION 9: VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 9.1: Active generation units by state
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW aneel.v_gen_units_by_state AS
SELECT 
    state,
    source_type,
    COUNT(*) as unit_count,
    SUM(installed_power_kw) as total_power_kw,
    AVG(installed_power_kw) as avg_power_kw,
    SUM(avg_monthly_generation_kwh) as total_monthly_gen_kwh
FROM aneel.generation_units
WHERE status = 'ACTIVE'
GROUP BY state, source_type
ORDER BY state, total_power_kw DESC;

COMMENT ON VIEW aneel.v_gen_units_by_state IS 'Summary of active generation units grouped by state and source type';

-- ----------------------------------------------------------------------------
-- 9.2: Latest tariffs by utility
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW aneel.v_latest_tariffs AS
SELECT DISTINCT ON (utility_code, consumer_class)
    utility_code,
    utility_name,
    consumer_class,
    subclass,
    te_value,
    tusd_value,
    total_tariff,
    validity_start,
    validity_end,
    resolution_number
FROM aneel.tariffs
WHERE validity_end IS NULL OR validity_end > CURRENT_DATE
ORDER BY utility_code, consumer_class, validity_start DESC;

COMMENT ON VIEW aneel.v_latest_tariffs IS 'Most recent active tariffs for each utility and consumer class';

-- ----------------------------------------------------------------------------
-- 9.3: Product catalog with stock status
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW products.v_product_catalog AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.category,
    p.manufacturer,
    p.model,
    p.sale_price,
    p.stock_quantity,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'LOW_STOCK'
        WHEN p.stock_quantity >= p.max_stock_level THEN 'OVERSTOCKED'
        ELSE 'IN_STOCK'
    END as stock_status,
    p.inmetro_certified,
    p.status,
    p.created_at,
    p.updated_at
FROM products.products p
WHERE p.status IN ('ACTIVE', 'OUT_OF_STOCK')
ORDER BY p.category, p.manufacturer, p.name;

COMMENT ON VIEW products.v_product_catalog IS 'Active products with computed stock status';

-- ----------------------------------------------------------------------------
-- 9.4: Solar kits with component details
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW products.v_kits_detailed AS
SELECT 
    k.id,
    k.kit_id,
    k.sku,
    k.name,
    k.system_type,
    k.power_kwp,
    k.voltage_phase,
    k.kit_cost,
    k.total_price,
    k.status,
    COUNT(kc.id) as component_count,
    SUM(kc.quantity) as total_parts,
    jsonb_agg(
        jsonb_build_object(
            'type', kc.component_type,
            'product_name', p.name,
            'manufacturer', p.manufacturer,
            'model', p.model,
            'quantity', kc.quantity,
            'unit_price', kc.unit_price,
            'total_price', kc.total_price
        ) ORDER BY kc.display_order
    ) as components_detail
FROM products.solar_kits k
LEFT JOIN products.kit_components kc ON k.id = kc.kit_id
LEFT JOIN products.products p ON kc.product_id = p.id
WHERE k.status = 'ACTIVE'
GROUP BY k.id, k.kit_id, k.sku, k.name, k.system_type, k.power_kwp, 
         k.voltage_phase, k.kit_cost, k.total_price, k.status;

COMMENT ON VIEW products.v_kits_detailed IS 'Solar kits with full component breakdown';

-- ----------------------------------------------------------------------------
-- 9.5: Pipeline execution summary
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW pipeline.v_ingestion_summary AS
SELECT 
    workflow_name,
    status,
    DATE(started_at) as execution_date,
    COUNT(*) as run_count,
    AVG(duration_seconds) as avg_duration_seconds,
    SUM(datasets_fetched) as total_fetched,
    SUM(datasets_processed) as total_processed,
    SUM(datasets_inserted) as total_inserted,
    SUM(datasets_updated) as total_updated,
    SUM(datasets_failed) as total_failed,
    MAX(started_at) as last_run_at
FROM pipeline.ingestion_log
WHERE started_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY workflow_name, status, DATE(started_at)
ORDER BY execution_date DESC, workflow_name;

COMMENT ON VIEW pipeline.v_ingestion_summary IS 'Daily summary of pipeline executions (last 30 days)';

-- ============================================================================
-- SECTION 10: MATERIALIZED VIEWS (For Performance)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 10.1: Generation units statistics (refresh daily)
-- ----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW aneel.mv_gen_units_statistics AS
SELECT 
    state,
    consumer_class,
    source_type,
    COUNT(*) as unit_count,
    SUM(installed_power_kw) as total_power_kw,
    AVG(installed_power_kw) as avg_power_kw,
    MIN(installed_power_kw) as min_power_kw,
    MAX(installed_power_kw) as max_power_kw,
    SUM(avg_monthly_generation_kwh) as total_monthly_gen_kwh,
    AVG(capacity_factor) as avg_capacity_factor,
    CURRENT_TIMESTAMP as refreshed_at
FROM aneel.generation_units
WHERE status = 'ACTIVE'
GROUP BY state, consumer_class, source_type;

CREATE UNIQUE INDEX idx_mv_gen_stats_unique ON aneel.mv_gen_units_statistics(state, consumer_class, source_type);
CREATE INDEX idx_mv_gen_stats_state ON aneel.mv_gen_units_statistics(state);

COMMENT ON MATERIALIZED VIEW aneel.mv_gen_units_statistics IS 'Pre-aggregated generation units statistics (refresh daily)';

-- Refresh schedule (add to cron or Airflow):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY aneel.mv_gen_units_statistics;

-- ============================================================================
-- SECTION 11: UTILITY FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 11.1: Calculate distance between two generation units
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION aneel.calculate_distance_km(
    unit1_id BIGINT,
    unit2_id BIGINT
)
RETURNS NUMERIC AS $$
DECLARE
    distance NUMERIC;
BEGIN
    SELECT ST_Distance(g1.geolocation, g2.geolocation) / 1000 INTO distance
    FROM aneel.generation_units g1, aneel.generation_units g2
    WHERE g1.id = unit1_id AND g2.id = unit2_id;
    
    RETURN ROUND(distance, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION aneel.calculate_distance_km IS 'Calculate distance in km between two generation units';

-- ----------------------------------------------------------------------------
-- 11.2: Find nearest generation units
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION aneel.find_nearest_units(
    ref_latitude NUMERIC,
    ref_longitude NUMERIC,
    limit_count INTEGER DEFAULT 10,
    max_distance_km NUMERIC DEFAULT 100
)
RETURNS TABLE (
    id BIGINT,
    unit_id VARCHAR,
    municipality VARCHAR,
    state CHAR,
    installed_power_kw NUMERIC,
    distance_km NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gu.id,
        gu.unit_id,
        gu.municipality,
        gu.state,
        gu.installed_power_kw,
        ROUND((ST_Distance(
            gu.geolocation,
            ST_SetSRID(ST_MakePoint(ref_longitude, ref_latitude), 4326)::GEOGRAPHY
        ) / 1000)::NUMERIC, 2) as distance_km
    FROM aneel.generation_units gu
    WHERE ST_DWithin(
        gu.geolocation,
        ST_SetSRID(ST_MakePoint(ref_longitude, ref_latitude), 4326)::GEOGRAPHY,
        max_distance_km * 1000
    )
    AND gu.status = 'ACTIVE'
    ORDER BY gu.geolocation <-> ST_SetSRID(ST_MakePoint(ref_longitude, ref_latitude), 4326)::GEOGRAPHY
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION aneel.find_nearest_units IS 'Find nearest active generation units within specified radius';

-- ----------------------------------------------------------------------------
-- 11.3: Get kit total cost breakdown
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION products.get_kit_cost_breakdown(kit_id_param BIGINT)
RETURNS TABLE (
    kit_name TEXT,
    component_type VARCHAR,
    component_name TEXT,
    quantity INTEGER,
    unit_price NUMERIC,
    total_price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.name,
        kc.component_type,
        p.name,
        kc.quantity,
        kc.unit_price,
        kc.total_price
    FROM products.solar_kits k
    JOIN products.kit_components kc ON k.id = kc.kit_id
    JOIN products.products p ON kc.product_id = p.id
    WHERE k.id = kit_id_param
    ORDER BY kc.display_order;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION products.get_kit_cost_breakdown IS 'Get detailed cost breakdown for a solar kit';

-- ============================================================================
-- SECTION 12: PERFORMANCE TUNING
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 12.1: Analyze all tables (update statistics)
-- ----------------------------------------------------------------------------

ANALYZE aneel.datasets;
ANALYZE aneel.generation_units;
ANALYZE aneel.tariffs;
ANALYZE aneel.certifications;
ANALYZE products.products;
ANALYZE products.solar_kits;
ANALYZE products.kit_components;
ANALYZE pipeline.ingestion_log;
ANALYZE pipeline.data_quality_checks;
ANALYZE audit.change_log;

-- ----------------------------------------------------------------------------
-- 12.2: Vacuum all tables
-- ----------------------------------------------------------------------------

VACUUM ANALYZE aneel.datasets;
VACUUM ANALYZE aneel.generation_units;
VACUUM ANALYZE aneel.tariffs;
VACUUM ANALYZE aneel.certifications;
VACUUM ANALYZE products.products;
VACUUM ANALYZE products.solar_kits;
VACUUM ANALYZE products.kit_components;

-- ============================================================================
-- SECTION 13: GRANTS & PERMISSIONS
-- ============================================================================

-- Create roles
CREATE ROLE ysh_admin WITH LOGIN PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE ROLE ysh_api WITH LOGIN PASSWORD 'CHANGE_ME_API_PASSWORD';
CREATE ROLE ysh_readonly WITH LOGIN PASSWORD 'CHANGE_ME_READONLY_PASSWORD';

-- Admin: Full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA aneel TO ysh_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA products TO ysh_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA pipeline TO ysh_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO ysh_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA aneel TO ysh_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA products TO ysh_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA pipeline TO ysh_admin;
GRANT USAGE ON SCHEMA aneel, products, pipeline, audit TO ysh_admin;

-- API: Read/write on data tables, read-only on audit
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA aneel TO ysh_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA products TO ysh_api;
GRANT SELECT, INSERT, UPDATE ON pipeline.ingestion_log TO ysh_api;
GRANT SELECT ON audit.change_log TO ysh_api;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA aneel TO ysh_api;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA products TO ysh_api;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA pipeline TO ysh_api;
GRANT USAGE ON SCHEMA aneel, products, pipeline, audit TO ysh_api;

-- Read-only: SELECT on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA aneel TO ysh_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA products TO ysh_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA pipeline TO ysh_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO ysh_readonly;
GRANT USAGE ON SCHEMA aneel, products, pipeline, audit TO ysh_readonly;

-- ============================================================================
-- SECTION 14: MONITORING QUERIES
-- ============================================================================

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('aneel', 'products', 'pipeline', 'audit')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname IN ('aneel', 'products', 'pipeline', 'audit')
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- Slow queries (requires pg_stat_statements)
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Verification
SELECT 'PostgreSQL schema created successfully!' AS status;
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema IN ('aneel', 'products', 'pipeline', 'audit');
