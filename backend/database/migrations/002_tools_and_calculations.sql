-- =============================================
-- FERRAMENTAS E CÁLCULOS SOLARES - YSH B2B
-- =============================================
-- Descrição: Schema para armazenar resultados de ferramentas (dimensionamento, viabilidade, CV, crédito)
-- Data: 2025-01-10
-- Versão: 1.0

-- =============================================
-- 1. SOLAR CALCULATIONS (Dimensionamento)
-- =============================================
-- Já existe em src/models/solar-calculation.ts
-- Expandindo com campos adicionais

CREATE TABLE
IF NOT EXISTS solar_calculations
(
    id VARCHAR
(36) PRIMARY KEY DEFAULT gen_random_uuid
()::text,
    
    -- Relacionamentos
    customer_id VARCHAR
(255), -- Medusa customer ID (nullable para anônimos)
    persona_code VARCHAR
(50),
    
    -- Identificação
    name VARCHAR
(255), -- Nome dado pelo usuário
    calculation_hash VARCHAR
(64), -- Hash único para evitar duplicatas
    
    -- Input (JSON com todos os parâmetros)
    input JSONB NOT NULL,
    -- Estrutura esperada:
    -- {
    --   location: { lat, lng, city, state, country },
    --   consumption_profile: { jan, feb, ..., dec }, // kWh por mês
    --   roof_area: number,
    --   roof_type: "metallic" | "ceramic" | "concrete",
    --   roof_orientation: "north" | "south" | "east" | "west",
    --   roof_inclination: number, // graus
    --   voltage: "monofasico" | "bifasico" | "trifasico",
    --   tariff_modality: "convencional" | "branca" | "verde" | "azul",
    --   budget_range: { min, max },
    --   has_battery: boolean,
    --   grid_connected: boolean
    -- }
    
    -- Output (JSON com resultados)
    output JSONB NOT NULL,
    -- Estrutura esperada:
    -- {
    --   recommended_power_kw: number,
    --   estimated_generation_kwh: { jan, feb, ..., dec, annual },
    --   system_configuration: {
    --     num_panels: number,
    --     panel_power_wp: number,
    --     inverter_power_kw: number,
    --     battery_capacity_kwh: number | null
    --   },
    --   roi_analysis: {
    --     investment_brl: number,
    --     monthly_savings_brl: number,
    --     payback_years: number,
    --     roi_25_years_brl: number
    --   },
    --   irradiation_data: { /* NASA POWER ou PVGIS */ },
    --   recommended_products: { panel_ids, inverter_ids, battery_ids }
    -- }
    
    -- Metadados
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    tags VARCHAR
(255)[], -- Array de tags
    
    -- Conversão
    converted_to_cart BOOLEAN DEFAULT false,
    converted_to_quote BOOLEAN DEFAULT false,
    cart_id VARCHAR
(255),
    quote_id VARCHAR
(255),
    order_id VARCHAR
(255),
    
    -- Compartilhamento
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR
(64) UNIQUE,
    
    -- Validação
    validated_at TIMESTAMP,
    validated_by VARCHAR
(255),
    validation_notes TEXT,
    
    -- Metadata adicional
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW
(),
    updated_at TIMESTAMP DEFAULT NOW
()
);

-- Índices
CREATE INDEX idx_solar_calc_customer ON solar_calculations(customer_id);
CREATE INDEX idx_solar_calc_hash ON solar_calculations(calculation_hash);
CREATE INDEX idx_solar_calc_favorite ON solar_calculations(is_favorite);
CREATE INDEX idx_solar_calc_converted ON solar_calculations(converted_to_cart);
CREATE INDEX idx_solar_calc_date ON solar_calculations(created_at);
CREATE INDEX idx_solar_calc_share ON solar_calculations(share_token) WHERE share_token IS NOT NULL;

-- =============================================
-- 2. VIABILITY STUDIES (Análise de Viabilidade)
-- =============================================

CREATE TABLE
IF NOT EXISTS viability_studies
(
    id VARCHAR
(36) PRIMARY KEY DEFAULT gen_random_uuid
()::text,
    
    -- Relacionamentos
    customer_id VARCHAR
(255),
    solar_calculation_id VARCHAR
(36) REFERENCES solar_calculations
(id) ON
DELETE
SET NULL
,
    persona_code VARCHAR
(50),
    
    -- Identificação
    name VARCHAR
(255),
    study_hash VARCHAR
(64),
    
    -- Input
    input JSONB NOT NULL,
    -- Estrutura:
    -- {
    --   solar_calculation_result: { /* output do dimensionamento */ },
    --   project_details: {
    --     project_type: "residential" | "commercial" | "rural" | "industrial",
    --     installation_complexity: "low" | "medium" | "high",
    --     distance_to_distributor_km: number,
    --     has_three_phase: boolean
    --   },
    --   financial_parameters: {
    --     financing_type: "cash" | "financed",
    --     down_payment_percent: number,
    --     financing_term_months: number,
    --     interest_rate_annual: number
    --   },
    --   tariff_data: {
    --     distributor: string,
    --     tariff_class: string,
    --     tariff_modality: string,
    --     kwh_price: number,
    --     demand_price: number | null
    --   }
    -- }
    
    -- Output
    output JSONB NOT NULL,
    -- Estrutura:
    -- {
    --   viability_score: number, // 0-100
    --   recommendation: "highly_viable" | "viable" | "marginal" | "not_viable",
    --   financial_analysis: {
    --     total_investment: number,
    --     monthly_payment: number,
    --     total_cost_with_interest: number,
    --     monthly_savings: number,
    --     net_savings_monthly: number,
    --     payback_years: number,
    --     irr_percent: number,
    --     npv_25_years: number
    --   },
    --   technical_analysis: {
    --     generation_vs_consumption_ratio: number,
    --     system_efficiency: number,
    --     estimated_availability: number,
    --     performance_ratio: number
    --   },
    --   risk_analysis: {
    --     weather_risk: "low" | "medium" | "high",
    --     technical_risk: "low" | "medium" | "high",
    --     financial_risk: "low" | "medium" | "high",
    --     overall_risk: "low" | "medium" | "high"
    --   },
    --   regulatory_compliance: {
    --     meets_aneel_standards: boolean,
    --     meets_abnt_standards: boolean,
    --     requires_special_permits: boolean
    --   },
    --   alternative_scenarios: [ /* diferentes configurações */ ]
    -- }
    
    -- Status
    status VARCHAR
(50) DEFAULT 'draft', -- draft, final, approved, rejected
    
    -- Aprovação
    approved_by VARCHAR
(255),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Conversão
    converted_to_proposal BOOLEAN DEFAULT false,
    proposal_id VARCHAR
(255),
    
    -- Compartilhamento
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR
(64) UNIQUE,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW
(),
    updated_at TIMESTAMP DEFAULT NOW
()
);

-- Índices
CREATE INDEX idx_viability_customer ON viability_studies(customer_id);
CREATE INDEX idx_viability_solar_calc ON viability_studies(solar_calculation_id);
CREATE INDEX idx_viability_status ON viability_studies(status);
CREATE INDEX idx_viability_date ON viability_studies(created_at);

-- =============================================
-- 3. CV ANALYSES (Computer Vision - Análise de Telhados)
-- =============================================

CREATE TABLE
IF NOT EXISTS cv_analyses
(
    id VARCHAR
(36) PRIMARY KEY DEFAULT gen_random_uuid
()::text,
    
    -- Relacionamentos
    customer_id VARCHAR
(255),
    viability_study_id VARCHAR
(36) REFERENCES viability_studies
(id) ON
DELETE
SET NULL
,
    persona_code VARCHAR
(50),
    
    -- Identificação
    name VARCHAR
(255),
    project_address TEXT,
    
    -- Input (imagens e parâmetros)
    input JSONB NOT NULL,
    -- Estrutura:
    -- {
    --   image_sources: [
    --     { type: "upload" | "google_maps" | "drone", url: string, timestamp: string }
    --   ],
    --   analysis_parameters: {
    --     detect_obstacles: boolean,
    --     calculate_optimal_layout: boolean,
    --     estimate_shading: boolean,
    --     detect_roof_type: boolean
    --   },
    --   location: { lat, lng, address }
    -- }
    
    -- Output
    output JSONB NOT NULL,
    -- Estrutura:
    -- {
    --   roof_analysis: {
    --     total_area_m2: number,
    --     usable_area_m2: number,
    --     roof_type: "metallic" | "ceramic" | "concrete" | "shingle",
    --     orientation: number, // graus (0-360)
    --     inclination: number, // graus
    --     azimuth: number
    --   },
    --   obstacles_detected: [
    --     { type: "chimney" | "vent" | "antenna" | "tree", position: { x, y }, area_m2: number }
    --   ],
    --   shading_analysis: {
    --     annual_shading_loss_percent: number,
    --     critical_shading_hours: [ /* horas do dia */ ],
    --     shading_map: string // URL da imagem com mapa de sombreamento
    --   },
    --   optimal_panel_layout: {
    --     num_panels: number,
    --     panel_dimensions: { width_cm, height_cm },
    --     layout_image_url: string,
    --     layout_efficiency: number, // % da área útil ocupada
    --     estimated_power_kw: number
    --   },
    --   recommendations: [
    --     { type: "warning" | "info" | "optimization", message: string }
    --   ]
    -- }
    
    -- Imagens processadas
    original_images_urls VARCHAR
(500)[],
    processed_images_urls VARCHAR
(500)[],
    
    -- Qualidade da análise
    confidence_score NUMERIC
(5, 2), -- 0-100
    quality_issues JSONB, -- Problemas detectados na qualidade da imagem
    
    -- Status
    processing_status VARCHAR
(50) DEFAULT 'pending', -- pending, processing, completed, failed
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_error TEXT,
    
    -- Validação manual
    validated_by VARCHAR
(255),
    validated_at TIMESTAMP,
    manual_corrections JSONB,
    
    -- Conversão
    converted_to_viability BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW
(),
    updated_at TIMESTAMP DEFAULT NOW
()
);

-- Índices
CREATE INDEX idx_cv_customer ON cv_analyses(customer_id);
CREATE INDEX idx_cv_viability ON cv_analyses(viability_study_id);
CREATE INDEX idx_cv_status ON cv_analyses(processing_status);
CREATE INDEX idx_cv_date ON cv_analyses(created_at);

-- =============================================
-- 4. CREDIT ANALYSES (Análise de Crédito)
-- =============================================
-- Já existe em src/models/credit-analysis.ts
-- Expandindo

CREATE TABLE
IF NOT EXISTS credit_analyses
(
    id VARCHAR
(36) PRIMARY KEY DEFAULT gen_random_uuid
()::text,
    
    -- Relacionamentos
    customer_id VARCHAR
(255) NOT NULL,
    quote_id VARCHAR
(255),
    solar_calculation_id VARCHAR
(36) REFERENCES solar_calculations
(id) ON
DELETE
SET NULL
,
    viability_study_id VARCHAR
(36) REFERENCES viability_studies
(id) ON
DELETE
SET NULL
,
    persona_code VARCHAR
(50),
    
    -- Status
    status VARCHAR
(50) DEFAULT 'pending', -- pending, in_review, approved, rejected, conditional
    
    -- Tipo de cliente
    customer_type VARCHAR
(20) NOT NULL, -- individual (PF) | business (PJ)
    
    -- Dados pessoais/empresa
    full_name VARCHAR
(255) NOT NULL,
    cpf_cnpj VARCHAR
(20) NOT NULL,
    birth_date DATE,
    company_foundation_date DATE,
    
    -- Contato
    email VARCHAR
(255) NOT NULL,
    phone VARCHAR
(20) NOT NULL,
    mobile_phone VARCHAR
(20),
    
    -- Endereço
    address JSONB NOT NULL,
    -- { street, number, complement, neighborhood, city, state, zip, country }
    
    -- Dados financeiros
    monthly_income NUMERIC
(12, 2), -- PF: renda mensal | PJ: faturamento mensal
    annual_revenue NUMERIC
(14, 2), -- PJ: faturamento anual
    occupation VARCHAR
(255), -- PF
    employer VARCHAR
(255), -- PF
    employment_time_months INTEGER, -- PF
    
    -- Score e crédito
    credit_score INTEGER, -- 300-850
    has_negative_credit BOOLEAN DEFAULT false,
    has_bankruptcy BOOLEAN DEFAULT false,
    monthly_debts NUMERIC
(12, 2),
    debt_to_income_ratio NUMERIC
(5, 2),
    
    -- Financiamento solicitado
    requested_amount NUMERIC
(12, 2) NOT NULL,
    requested_term_months INTEGER NOT NULL,
    financing_modality VARCHAR
(50) DEFAULT 'CDC', -- CDC, LEASING, EAAS, CASH
    has_down_payment BOOLEAN DEFAULT false,
    down_payment_amount NUMERIC
(12, 2),
    
    -- Documentos (URLs)
    documents JSONB,
    -- { cpf_cnpj: url, rg: url, proof_income: url, proof_address: url, contract_social: url }
    
    -- Resultado da análise
    analysis_result JSONB,
    -- {
    --   approved_amount: number,
    --   interest_rate: number,
    --   conditions: string[],
    --   bank_partner: string,
    --   monthly_payment: number,
    --   total_amount: number
    -- }
    approved_amount NUMERIC
(12, 2),
    approved_term_months INTEGER,
    approved_interest_rate NUMERIC
(5, 2),
    approval_conditions JSONB, -- Array de condições
    
    -- Observações
    customer_notes TEXT,
    analyst_notes TEXT,
    rejection_reason TEXT,
    
    -- Metadados de submissão
    submission_source VARCHAR
(50), -- storefront, admin, api
    ip_address VARCHAR
(45),
    user_agent TEXT,
    
    -- Timestamps importantes
    submitted_at TIMESTAMP DEFAULT NOW
(),
    reviewed_at TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    expires_at TIMESTAMP, -- Validade da aprovação
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW
(),
    updated_at TIMESTAMP DEFAULT NOW
()
);

-- Índices
CREATE INDEX idx_credit_customer ON credit_analyses(customer_id);
CREATE INDEX idx_credit_cpf_cnpj ON credit_analyses(cpf_cnpj);
CREATE INDEX idx_credit_status ON credit_analyses(status);
CREATE INDEX idx_credit_quote ON credit_analyses(quote_id);
CREATE INDEX idx_credit_date ON credit_analyses(created_at);

-- =============================================
-- 5. DIMENSIONING REQUESTS (Solicitações de Dimensionamento Personalizado)
-- =============================================

CREATE TABLE
IF NOT EXISTS dimensioning_requests
(
    id VARCHAR
(36) PRIMARY KEY DEFAULT gen_random_uuid
()::text,
    
    -- Relacionamentos
    customer_id VARCHAR
(255) NOT NULL,
    solar_calculation_id VARCHAR
(36) REFERENCES solar_calculations
(id) ON
DELETE
SET NULL
,
    persona_code VARCHAR
(50),
    
    -- Tipo de solicitação
    request_type VARCHAR
(50) NOT NULL, -- basic, advanced, professional, custom
    
    -- Dados do cliente
    contact_name VARCHAR
(255) NOT NULL,
    contact_email VARCHAR
(255) NOT NULL,
    contact_phone VARCHAR
(20) NOT NULL,
    
    -- Detalhes do projeto
    project_details JSONB NOT NULL,
    -- {
    --   location: { address, city, state, lat, lng },
    --   property_type: "residential" | "commercial" | "rural" | "industrial",
    --   consumption_profile: { /* dados de consumo */ },
    --   special_requirements: string[],
    --   budget_range: { min, max },
    --   timeline: string,
    --   has_existing_system: boolean,
    --   existing_system_details: { /* se aplicável */ }
    -- }
    
    -- Arquivos anexados
    attachments JSONB, -- Array de URLs de documentos
    -- Ex: contas de energia, fotos do telhado, plantas, etc.
    
    -- Preferências
    preferences JSONB,
    -- {
    --   preferred_brands: string[],
    --   must_include_battery: boolean,
    --   off_grid: boolean,
    --   monitoring_system: boolean,
    --   warranty_preference: number // anos
    -- }
    
    -- Status da solicitação
    status VARCHAR
(50) DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
    
    -- Atribuição
    assigned_to VARCHAR
(255), -- ID do técnico/engenheiro
    assigned_at TIMESTAMP,
    
    -- Prioridade
    priority VARCHAR
(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Resultado
    result JSONB, -- Dimensionamento completo gerado pelo técnico
    result_attachments JSONB, -- PDFs, planilhas, etc.
    
    -- Comunicação
    internal_notes TEXT,
    customer_notes TEXT,
    
    -- Conversão
    converted_to_quote BOOLEAN DEFAULT false,
    quote_id VARCHAR
(255),
    
    -- Timestamps importantes
    requested_at TIMESTAMP DEFAULT NOW
(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    deadline TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW
(),
    updated_at TIMESTAMP DEFAULT NOW
()
);

-- Índices
CREATE INDEX idx_dimensioning_customer ON dimensioning_requests(customer_id);
CREATE INDEX idx_dimensioning_status ON dimensioning_requests(status);
CREATE INDEX idx_dimensioning_assigned ON dimensioning_requests(assigned_to);
CREATE INDEX idx_dimensioning_priority ON dimensioning_requests(priority);
CREATE INDEX idx_dimensioning_date ON dimensioning_requests(created_at);

-- =============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON TABLE solar_calculations IS 'Armazena cálculos de dimensionamento solar básico (NASA/PVGIS)';
COMMENT ON TABLE viability_studies IS 'Estudos completos de viabilidade técnica e financeira';
COMMENT ON TABLE cv_analyses IS 'Análises de telhado via Computer Vision (imagens de satélite ou drone)';
COMMENT ON TABLE credit_analyses IS 'Análises de crédito para financiamento de sistemas solares';
COMMENT ON TABLE dimensioning_requests IS 'Solicitações de dimensionamento personalizado por especialistas';

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_solar_calculations_updated_at BEFORE
UPDATE ON solar_calculations
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_viability_studies_updated_at BEFORE
UPDATE ON viability_studies
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_cv_analyses_updated_at BEFORE
UPDATE ON cv_analyses
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_credit_analyses_updated_at BEFORE
UPDATE ON credit_analyses
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_dimensioning_requests_updated_at BEFORE
UPDATE ON dimensioning_requests
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
