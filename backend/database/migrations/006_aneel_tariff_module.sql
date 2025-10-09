-- =============================================
-- MIGRATION 006: ANEEL TARIFF MODULE
-- =============================================
-- Módulo: aneel-tariff
-- Objetivo: Armazenar tarifas de energia das concessionárias brasileiras
-- Baseado em: src/modules/aneel-tariff/service.ts
-- Data: 2025-01-10

-- =============================================
-- 1. CONCESSIONARIAS (Distribuidoras de Energia)
-- =============================================

CREATE TABLE IF NOT EXISTS concessionarias (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Informações básicas
    nome VARCHAR(255) NOT NULL,
    nome_display VARCHAR(255),
    sigla VARCHAR(50) UNIQUE NOT NULL,
    
    -- Localização
    uf VARCHAR(2)[] NOT NULL, -- Array de estados atendidos: ['SP', 'RJ']
    regioes_atendidas TEXT[], -- Regiões/cidades específicas
    
    -- Contato
    website VARCHAR(500),
    telefone VARCHAR(20),
    email VARCHAR(255),
    
    -- Informações técnicas
    voltage_mono VARCHAR(50), -- Ex: "127/220V"
    voltage_bi VARCHAR(50),    -- Ex: "220/380V"
    voltage_tri VARCHAR(50),   -- Ex: "220/380V"
    
    -- ANEEL
    codigo_aneel VARCHAR(50),
    cnpj VARCHAR(18),
    grupo VARCHAR(50), -- distribuição, transmissão, geração
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_concessionarias_sigla ON concessionarias(sigla);
CREATE INDEX idx_concessionarias_uf ON concessionarias USING GIN(uf);
CREATE INDEX idx_concessionarias_active ON concessionarias(is_active);
CREATE INDEX idx_concessionarias_codigo_aneel ON concessionarias(codigo_aneel);

-- =============================================
-- 2. TARIFAS (Tarifas de Energia)
-- =============================================

CREATE TABLE IF NOT EXISTS tarifas (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamento
    concessionaria_id VARCHAR(36) NOT NULL REFERENCES concessionarias(id) ON DELETE CASCADE,
    
    -- Localização
    uf VARCHAR(2) NOT NULL,
    
    -- Classificação ANEEL
    grupo VARCHAR(10) NOT NULL, -- B1, B2, B3, B4, A1, A2, A3, A3a, A4, AS
    subgrupo VARCHAR(20), -- Detalhamento do grupo (ex: B1-residencial, B1-baixa renda)
    modalidade VARCHAR(50), -- convencional, horária_branca, etc
    
    -- Classes consumidoras
    classe VARCHAR(50), -- residencial, comercial, industrial, rural, poder_publico, iluminacao_publica
    subclasse VARCHAR(100), -- Subdivisões específicas
    
    -- Valores (R$/kWh)
    tarifa_kwh NUMERIC(10, 4) NOT NULL, -- Tarifa total
    tarifa_tusd NUMERIC(10, 4) NOT NULL, -- Tarifa de Uso do Sistema de Distribuição
    tarifa_te NUMERIC(10, 4) NOT NULL, -- Tarifa de Energia
    
    -- Bandeiras tarifárias (adicional R$/kWh)
    bandeira_verde NUMERIC(10, 4) DEFAULT 0,
    bandeira_amarela NUMERIC(10, 4) DEFAULT 0.02,
    bandeira_vermelha_1 NUMERIC(10, 4) DEFAULT 0.04,
    bandeira_vermelha_2 NUMERIC(10, 4) DEFAULT 0.06,
    
    -- Tarifa Horária Branca (se aplicável)
    tarifa_ponta NUMERIC(10, 4), -- Horário de ponta
    tarifa_intermediario NUMERIC(10, 4), -- Horário intermediário
    tarifa_fora_ponta NUMERIC(10, 4), -- Horário fora de ponta
    
    -- Horários (para tarifa branca)
    horario_ponta_inicio TIME,
    horario_ponta_fim TIME,
    horario_intermediario_inicio TIME,
    horario_intermediario_fim TIME,
    
    -- Limites MMGD (Micro e Minigeração Distribuída)
    limite_micro_kwp NUMERIC(10, 2) DEFAULT 75.00, -- Lei 14.300/2022
    limite_mini_kwp NUMERIC(10, 2) DEFAULT 5000.00,
    limite_oversizing_pct NUMERIC(5, 2) DEFAULT 160.00, -- % máximo de oversizing permitido
    
    -- Vigência
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE,
    resolucao_aneel VARCHAR(100), -- Ex: "REH 3.234/2024"
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT true, -- Tarifa atual vigente
    
    -- Fonte dos dados
    fonte VARCHAR(255), -- ANEEL, manual, scraping
    url_fonte TEXT,
    
    -- Metadata
    metadata JSONB,
    observacoes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(concessionaria_id, uf, grupo, classe, vigencia_inicio)
);

-- Índices
CREATE INDEX idx_tarifas_concessionaria ON tarifas(concessionaria_id);
CREATE INDEX idx_tarifas_uf ON tarifas(uf);
CREATE INDEX idx_tarifas_grupo ON tarifas(grupo);
CREATE INDEX idx_tarifas_classe ON tarifas(classe);
CREATE INDEX idx_tarifas_vigencia ON tarifas(vigencia_inicio, vigencia_fim);
CREATE INDEX idx_tarifas_active_current ON tarifas(is_active, is_current);
CREATE INDEX idx_tarifas_tarifa_kwh ON tarifas(tarifa_kwh);

-- =============================================
-- 3. BANDEIRAS TARIFARIAS HISTORICO
-- =============================================

CREATE TABLE IF NOT EXISTS bandeiras_historico (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Período
    mes INTEGER NOT NULL, -- 1-12
    ano INTEGER NOT NULL,
    
    -- Bandeira vigente
    bandeira VARCHAR(20) NOT NULL, -- verde, amarela, vermelha_1, vermelha_2
    
    -- Valores (R$/100kWh ou R$/kWh)
    valor_adicional NUMERIC(10, 4) NOT NULL,
    valor_100kwh NUMERIC(10, 2), -- Formato alternativo
    
    -- Justificativa
    motivo TEXT,
    
    -- Região (opcional, algumas distribuidoras podem ter bandeiras regionais)
    regiao VARCHAR(50), -- sul, sudeste, nordeste, norte, centro_oeste, nacional
    subsistema VARCHAR(50), -- S, SE/CO, NE, N
    
    -- Fonte
    fonte VARCHAR(255) DEFAULT 'ANEEL',
    url_fonte TEXT,
    resolucao VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(ano, mes, regiao)
);

-- Índices
CREATE INDEX idx_bandeiras_periodo ON bandeiras_historico(ano, mes);
CREATE INDEX idx_bandeiras_bandeira ON bandeiras_historico(bandeira);
CREATE INDEX idx_bandeiras_regiao ON bandeiras_historico(regiao);

-- =============================================
-- 4. MMGD CLASSES (Classes de Consumidor MMGD)
-- =============================================
-- Armazena as classificações da Lei 14.300/2022

CREATE TABLE IF NOT EXISTS mmgd_classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Código
    codigo VARCHAR(50) UNIQUE NOT NULL, -- CG_PRO_*, CG_OWNER_*, etc
    
    -- Informações
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Classificação MMGD
    tipo_mmgd VARCHAR(50) NOT NULL, -- microgeracao, minigeracao
    modalidade VARCHAR(100) NOT NULL, -- consumo_proprio, geracao_compartilhada, cooperativa, consorcio
    
    -- Limites
    potencia_min_kwp NUMERIC(10, 2) DEFAULT 0,
    potencia_max_kwp NUMERIC(10, 2),
    
    -- Regras de compensação
    credito_validade_meses INTEGER DEFAULT 60, -- Lei 14.300/2022: 60 meses
    transferencia_permitida BOOLEAN DEFAULT true,
    autoconsumo_remoto BOOLEAN DEFAULT false,
    
    -- Regras de oversizing
    oversizing_min_pct NUMERIC(5, 2) DEFAULT 114.00, -- Marco Legal: mínimo 114%
    oversizing_max_pct NUMERIC(5, 2) DEFAULT 160.00, -- Máximo 160%
    oversizing_recomendado_pct NUMERIC(5, 2) DEFAULT 130.00,
    
    -- Benefícios
    isencao_tusd BOOLEAN DEFAULT false,
    desconto_tusd_pct NUMERIC(5, 2),
    fio_b_aplicavel BOOLEAN DEFAULT true, -- Lei 14.300: Fio B aplicável
    
    -- Documentação necessária
    documentos_required JSONB,
    -- Exemplo: ["anuencia_locatario", "contrato_social", "anotacao_responsabilidade_tecnica"]
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_mmgd_classes_codigo ON mmgd_classes(codigo);
CREATE INDEX idx_mmgd_classes_tipo ON mmgd_classes(tipo_mmgd);
CREATE INDEX idx_mmgd_classes_modalidade ON mmgd_classes(modalidade);
CREATE INDEX idx_mmgd_classes_active ON mmgd_classes(is_active);

-- =============================================
-- 5. TARIFF CACHE (Cache de Consultas)
-- =============================================
-- Cache para otimizar consultas frequentes

CREATE TABLE IF NOT EXISTS tariff_cache (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Chave de cache
    cache_key VARCHAR(255) UNIQUE NOT NULL, -- "SP-B1-residencial"
    
    -- Dados cacheados
    concessionaria_id VARCHAR(36),
    tarifa_id VARCHAR(36),
    data JSONB NOT NULL,
    
    -- Controle de cache
    hits INTEGER DEFAULT 0,
    last_hit_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tariff_cache_key ON tariff_cache(cache_key);
CREATE INDEX idx_tariff_cache_expires ON tariff_cache(expires_at);
CREATE INDEX idx_tariff_cache_concessionaria ON tariff_cache(concessionaria_id);

-- =============================================
-- 6. TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_aneel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_concessionarias_updated_at
    BEFORE UPDATE ON concessionarias
    FOR EACH ROW
    EXECUTE FUNCTION update_aneel_updated_at();

CREATE TRIGGER trigger_tarifas_updated_at
    BEFORE UPDATE ON tarifas
    FOR EACH ROW
    EXECUTE FUNCTION update_aneel_updated_at();

CREATE TRIGGER trigger_mmgd_classes_updated_at
    BEFORE UPDATE ON mmgd_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_aneel_updated_at();

CREATE TRIGGER trigger_tariff_cache_updated_at
    BEFORE UPDATE ON tariff_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_aneel_updated_at();

-- =============================================
-- 7. COMMENTS
-- =============================================

COMMENT ON TABLE concessionarias IS 'Distribuidoras de energia elétrica brasileiras';
COMMENT ON TABLE tarifas IS 'Tarifas de energia por concessionária, grupo e classe consumidora';
COMMENT ON TABLE bandeiras_historico IS 'Histórico de bandeiras tarifárias por período';
COMMENT ON TABLE mmgd_classes IS 'Classes de consumidor MMGD conforme Lei 14.300/2022';
COMMENT ON TABLE tariff_cache IS 'Cache de consultas de tarifas para otimização';

COMMENT ON COLUMN tarifas.grupo IS 'Classificação ANEEL: B1-B4 (baixa tensão), A1-AS (alta tensão)';
COMMENT ON COLUMN tarifas.limite_oversizing_pct IS 'Percentual máximo permitido de oversizing (160% padrão ANEEL)';
COMMENT ON COLUMN mmgd_classes.credito_validade_meses IS 'Lei 14.300/2022: créditos válidos por 60 meses';
COMMENT ON COLUMN mmgd_classes.fio_b_aplicavel IS 'Lei 14.300: Fio B (TUSD) aplicável para sistemas MMGD';

-- =============================================
-- FIM DA MIGRATION 006
-- =============================================
