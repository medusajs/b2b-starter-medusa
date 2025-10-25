-- =============================================
-- PERSONAS E BUYER JOURNEYS - YSH B2B
-- =============================================
-- Descrição: Schema para gerenciar personas, jornadas de compra e relacionamentos
-- Data: 2025-01-10
-- Versão: 1.0

-- =============================================
-- 1. TABELA DE PERSONAS
-- =============================================
-- Armazena os tipos de personas que usam a plataforma

CREATE TABLE IF NOT EXISTS personas (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code VARCHAR(50) UNIQUE NOT NULL, -- CG_PRO_INSTALLER, CG_AFFILIATE, CG_OWNER_RESIDENTIAL, etc.
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Características
    customer_group_id VARCHAR(255), -- Link para customer group do Medusa
    sales_channel_ids JSONB, -- Array de sales channels permitidos
    pricing_tier VARCHAR(50), -- installer_plus, basic, premium, etc.
    
    -- Permissões e capacidades
    capabilities JSONB, -- { can_buy_bulk: true, can_request_quotes: true, has_credit_limit: true, etc. }
    default_payment_terms VARCHAR(50), -- net_30, net_60, upfront, etc.
    
    -- Categorização
    persona_type VARCHAR(50) NOT NULL, -- B2B_PROFESSIONAL, AFFILIATE, DTC_OWNER, ADMIN
    target_market VARCHAR(50), -- residential, commercial, rural, industrial
    
    -- Business rules
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    max_credit_limit NUMERIC(10, 2),
    requires_approval BOOLEAN DEFAULT false,
    approval_threshold NUMERIC(10, 2), -- Valor acima do qual precisa aprovação
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- Menor = maior prioridade
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_personas_code ON personas(code);
CREATE INDEX idx_personas_type ON personas(persona_type);
CREATE INDEX idx_personas_active ON personas(is_active);

-- =============================================
-- 2. TABELA DE BUYER JOURNEYS
-- =============================================
-- Armazena as jornadas de compra disponíveis

CREATE TABLE IF NOT EXISTS buyer_journeys (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code VARCHAR(50) UNIQUE NOT NULL, -- DISCOVERY_TO_PURCHASE, SOLAR_ANALYSIS_TO_KIT, etc.
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Características da jornada
    objective TEXT, -- O que o usuário quer alcançar
    duration_minutes_min INTEGER, -- Duração estimada mínima
    duration_minutes_max INTEGER, -- Duração estimada máxima
    complexity VARCHAR(50), -- low, medium, high
    
    -- Métricas alvo
    target_conversion_rate NUMERIC(5, 2), -- Ex: 70.00 para 70%
    target_time_to_purchase INTEGER, -- Minutos
    target_satisfaction_score NUMERIC(3, 2), -- Ex: 4.50 para 4.5/5
    
    -- Personas associadas
    primary_persona_ids JSONB, -- Array de persona IDs principais
    secondary_persona_ids JSONB, -- Array de persona IDs secundárias
    
    -- Classificação
    journey_category VARCHAR(50), -- sales, support, onboarding, retention
    difficulty_level VARCHAR(50), -- beginner, intermediate, advanced
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    completion_status VARCHAR(50) DEFAULT 'not_started', -- not_started, partial, complete
    completion_percentage INTEGER DEFAULT 0,
    
    -- Análise
    friction_points JSONB, -- Array de pontos de atrito identificados
    success_factors JSONB, -- Array de fatores de sucesso
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_journeys_code ON buyer_journeys(code);
CREATE INDEX idx_journeys_category ON buyer_journeys(journey_category);
CREATE INDEX idx_journeys_active ON buyer_journeys(is_active);

-- =============================================
-- 3. TABELA DE JOURNEY STEPS
-- =============================================
-- Armazena os passos/etapas de cada jornada

CREATE TABLE IF NOT EXISTS journey_steps (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    journey_id VARCHAR(36) NOT NULL REFERENCES buyer_journeys(id) ON DELETE CASCADE,
    
    -- Identificação do passo
    step_number INTEGER NOT NULL,
    code VARCHAR(50) NOT NULL, -- homepage, products, category, product_detail, cart, checkout, etc.
    name VARCHAR(255) NOT NULL,
    route_path VARCHAR(255), -- /[countryCode]/produtos, /[countryCode]/cart, etc.
    
    -- Descrição
    objective TEXT, -- O que o usuário deve fazer neste passo
    description TEXT,
    
    -- Componentes envolvidos
    components JSONB, -- Array de componentes React usados
    integrations JSONB, -- APIs, serviços externos, etc.
    
    -- Ações disponíveis
    available_actions JSONB, -- { add_to_cart, request_quote, compare, etc. }
    cta_buttons JSONB, -- Array de CTAs principais
    
    -- Próximos passos possíveis
    next_step_ids JSONB, -- Array de IDs dos próximos passos possíveis
    alternative_paths JSONB, -- Caminhos alternativos possíveis
    
    -- Métricas
    avg_time_spent_seconds INTEGER,
    dropout_rate NUMERIC(5, 2), -- Taxa de abandono neste passo
    conversion_rate NUMERIC(5, 2), -- Taxa de conversão para próximo passo
    
    -- Validações e requisitos
    required_fields JSONB, -- Campos obrigatórios
    validation_rules JSONB, -- Regras de validação
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_optional BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(journey_id, step_number)
);

-- Índices
CREATE INDEX idx_journey_steps_journey ON journey_steps(journey_id);
CREATE INDEX idx_journey_steps_route ON journey_steps(route_path);
CREATE INDEX idx_journey_steps_active ON journey_steps(is_active);

-- =============================================
-- 4. TABELA DE FERRAMENTAS (TOOLS)
-- =============================================
-- Armazena as ferramentas disponíveis na plataforma

CREATE TABLE IF NOT EXISTS persona_tools (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code VARCHAR(50) UNIQUE NOT NULL, -- solar_calculator, viability_analyzer, cv_analyzer, credit_analysis, etc.
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Tipo de ferramenta
    tool_type VARCHAR(50) NOT NULL, -- calculator, analyzer, generator, validator, simulator
    category VARCHAR(50), -- solar, financial, technical, business, etc.
    
    -- Disponibilidade
    available_for_personas JSONB, -- Array de persona codes
    requires_authentication BOOLEAN DEFAULT false,
    requires_b2b_account BOOLEAN DEFAULT false,
    
    -- Integração
    api_endpoint VARCHAR(255), -- /api/solar/dimensionamento, /api/solar/viability, etc.
    http_method VARCHAR(10) DEFAULT 'POST',
    
    -- Schema de dados
    input_schema JSONB, -- JSON Schema dos inputs esperados
    output_schema JSONB, -- JSON Schema do output gerado
    
    -- UI
    icon_name VARCHAR(100), -- Nome do ícone (Lucide, etc.)
    route_path VARCHAR(255), -- Rota na UI
    component_path VARCHAR(255), -- Caminho do componente React
    
    -- Configuração
    max_executions_per_day INTEGER,
    execution_timeout_seconds INTEGER DEFAULT 30,
    cache_results_seconds INTEGER DEFAULT 0, -- 0 = não cachear
    
    -- Pricing (se aplicável)
    is_free BOOLEAN DEFAULT true,
    cost_per_execution NUMERIC(10, 2) DEFAULT 0,
    
    -- Métricas
    total_executions INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER,
    success_rate NUMERIC(5, 2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_beta BOOLEAN DEFAULT false,
    
    -- Documentation
    documentation_url VARCHAR(500),
    tutorial_url VARCHAR(500),
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tools_code ON persona_tools(code);
CREATE INDEX idx_tools_type ON persona_tools(tool_type);
CREATE INDEX idx_tools_category ON persona_tools(category);
CREATE INDEX idx_tools_active ON persona_tools(is_active);

-- =============================================
-- 5. TABELA DE TOOL USAGE TRACKING
-- =============================================
-- Rastreia o uso de ferramentas por usuários

CREATE TABLE IF NOT EXISTS tool_usage_tracking (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    tool_id VARCHAR(36) NOT NULL REFERENCES persona_tools(id) ON DELETE CASCADE,
    customer_id VARCHAR(255), -- Medusa customer ID (pode ser null para usuários não autenticados)
    persona_code VARCHAR(50),
    
    -- Sessão
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Execução
    input_data JSONB, -- Dados de entrada (sem informações sensíveis)
    output_data JSONB, -- Dados de saída
    
    -- Métricas
    execution_time_ms INTEGER,
    status VARCHAR(50) NOT NULL, -- success, error, timeout, cancelled
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Contexto
    referrer_url VARCHAR(500),
    journey_id VARCHAR(36), -- Se faz parte de uma jornada específica
    step_id VARCHAR(36), -- Se faz parte de um passo específico
    
    -- Resultado
    led_to_conversion BOOLEAN DEFAULT false,
    conversion_value NUMERIC(10, 2), -- Valor monetário se gerou conversão
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    executed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tool_usage_tool ON tool_usage_tracking(tool_id);
CREATE INDEX idx_tool_usage_customer ON tool_usage_tracking(customer_id);
CREATE INDEX idx_tool_usage_session ON tool_usage_tracking(session_id);
CREATE INDEX idx_tool_usage_status ON tool_usage_tracking(status);
CREATE INDEX idx_tool_usage_date ON tool_usage_tracking(executed_at);
CREATE INDEX idx_tool_usage_conversion ON tool_usage_tracking(led_to_conversion);

-- =============================================
-- 6. TABELA DE JOURNEY ANALYTICS
-- =============================================
-- Armazena analytics agregados de jornadas

CREATE TABLE IF NOT EXISTS journey_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    journey_id VARCHAR(36) NOT NULL REFERENCES buyer_journeys(id) ON DELETE CASCADE,
    persona_code VARCHAR(50),
    
    -- Período de análise
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    -- Métricas de volume
    total_starts INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    total_abandonments INTEGER DEFAULT 0,
    
    -- Taxas
    completion_rate NUMERIC(5, 2),
    abandonment_rate NUMERIC(5, 2),
    conversion_rate NUMERIC(5, 2),
    
    -- Tempo
    avg_duration_minutes NUMERIC(10, 2),
    median_duration_minutes NUMERIC(10, 2),
    
    -- Valor
    total_conversion_value NUMERIC(12, 2),
    avg_conversion_value NUMERIC(10, 2),
    
    -- Fricção
    top_dropout_steps JSONB, -- Array com step_id e taxa de dropout
    friction_points JSONB, -- Pontos de maior atrito identificados
    
    -- Satisfação
    avg_satisfaction_score NUMERIC(3, 2),
    nps_score INTEGER,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(journey_id, period_start, period_end, persona_code)
);

-- Índices
CREATE INDEX idx_journey_analytics_journey ON journey_analytics(journey_id);
CREATE INDEX idx_journey_analytics_period ON journey_analytics(period_start, period_end);
CREATE INDEX idx_journey_analytics_persona ON journey_analytics(persona_code);

-- =============================================
-- 7. TABELA DE PERSONA ASSIGNMENTS
-- =============================================
-- Relacionamento muitos-para-muitos entre customers e personas

CREATE TABLE IF NOT EXISTS customer_persona_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    customer_id VARCHAR(255) NOT NULL, -- Medusa customer ID
    persona_id VARCHAR(36) NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    
    -- Status
    is_primary BOOLEAN DEFAULT false, -- Persona principal do usuário
    is_active BOOLEAN DEFAULT true,
    
    -- Evidências
    assignment_reason VARCHAR(255), -- manual, signup_flow, behavior_analysis, purchase_history
    confidence_score NUMERIC(5, 2), -- 0-100, confiança na atribuição
    
    -- Validação
    validated_by VARCHAR(255), -- ID do admin que validou
    validated_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    assigned_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- Pode expirar e precisar revalidação
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(customer_id, persona_id)
);

-- Índices
CREATE INDEX idx_persona_assignments_customer ON customer_persona_assignments(customer_id);
CREATE INDEX idx_persona_assignments_persona ON customer_persona_assignments(persona_id);
CREATE INDEX idx_persona_assignments_primary ON customer_persona_assignments(is_primary);
CREATE INDEX idx_persona_assignments_active ON customer_persona_assignments(is_active);

-- =============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON TABLE personas IS 'Armazena os tipos de personas que usam a plataforma (CG_PRO_INSTALLER, CG_AFFILIATE, CG_OWNER_*, etc.)';
COMMENT ON TABLE buyer_journeys IS 'Define as jornadas de compra disponíveis (descoberta, análise solar, B2B, etc.)';
COMMENT ON TABLE journey_steps IS 'Passos individuais de cada jornada com rotas, componentes e métricas';
COMMENT ON TABLE persona_tools IS 'Ferramentas disponíveis (calculadoras, analisadores, geradores, etc.)';
COMMENT ON TABLE tool_usage_tracking IS 'Rastreia cada execução de ferramenta com inputs, outputs e métricas';
COMMENT ON TABLE journey_analytics IS 'Analytics agregados de jornadas por período e persona';
COMMENT ON TABLE customer_persona_assignments IS 'Relacionamento N:N entre customers e personas';

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_journeys_updated_at BEFORE UPDATE ON buyer_journeys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_steps_updated_at BEFORE UPDATE ON journey_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_tools_updated_at BEFORE UPDATE ON persona_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_analytics_updated_at BEFORE UPDATE ON journey_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_persona_assignments_updated_at BEFORE UPDATE ON customer_persona_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
