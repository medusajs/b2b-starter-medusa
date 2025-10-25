-- Migração: Tabela de Catálogo de Produtos Solares
-- Criado: 2025-10-21
-- Descrição: Schema completo para catálogo AWS CDN integrado com widgets ChatKit

-- ============================================================================
-- TABELA PRINCIPAL: catalog
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalog (
  -- IDENTIFICADORES
  sku VARCHAR(255) PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- URLS E PUBLICAÇÃO
  image_url TEXT NOT NULL,
  cdn_published BOOLEAN DEFAULT false,
  
  -- PRICING
  price_brl DECIMAL(12,2) NOT NULL CHECK (price_brl > 0),
  price_source VARCHAR(50) DEFAULT 'estimated' CHECK (price_source IN ('direct', 'similar', 'estimated')),
  price_confidence DECIMAL(3,2) DEFAULT 0.4 CHECK (price_confidence BETWEEN 0 AND 1),
  
  -- IDENTIFICAÇÃO DO PRODUTO
  manufacturer VARCHAR(200),
  model VARCHAR(200),
  distributor VARCHAR(200),
  
  -- POTÊNCIA (múltiplos formatos)
  power_w INTEGER CHECK (power_w > 0),
  power_kw DECIMAL(8,2) CHECK (power_kw > 0),
  power_kwp DECIMAL(8,2) CHECK (power_kwp > 0),
  
  -- ESPECIFICAÇÕES ELÉTRICAS
  voltage_v INTEGER CHECK (voltage_v > 0),
  phase VARCHAR(50) CHECK (phase IN ('monofásico', 'bifásico', 'trifásico')),
  current_a DECIMAL(8,2) CHECK (current_a > 0),
  mppt_count INTEGER CHECK (mppt_count > 0),
  efficiency_percent DECIMAL(5,2) CHECK (efficiency_percent BETWEEN 0 AND 100),
  
  -- KITS SOLARES
  structure_type VARCHAR(100) CHECK (structure_type IN ('ceramico', 'fibrocimento', 'metalico', 'solo', 'laje')),
  system_type VARCHAR(100) CHECK (system_type IN ('grid-tie', 'off-grid', 'hybrid', 'on-grid', 'hibrido')),
  price_per_kwp DECIMAL(10,2),
  price_per_wp DECIMAL(10,4),
  estimated_generation_kwh_month INTEGER,
  
  -- PAINÉIS SOLARES
  cell_type VARCHAR(100) CHECK (cell_type IN ('monocrystalline', 'polycrystalline', 'thin-film', 'bifacial')),
  dimensions_mm VARCHAR(100),
  weight_kg DECIMAL(8,2) CHECK (weight_kg > 0),
  
  -- BATERIAS
  technology VARCHAR(100) CHECK (technology IN ('LFP', 'Li-Ion', 'Lead-Acid', 'NMC', 'LTO')),
  capacity_kwh DECIMAL(8,2) CHECK (capacity_kwh > 0),
  capacity_ah DECIMAL(8,2) CHECK (capacity_ah > 0),
  cycle_life INTEGER CHECK (cycle_life > 0),
  dod_percent DECIMAL(5,2) CHECK (dod_percent BETWEEN 0 AND 100),
  form_factor VARCHAR(100),
  
  -- ESTRUTURAS
  roof_type VARCHAR(100),
  size VARCHAR(50) CHECK (size IN ('pequeno', 'medio', 'grande', 'extra-grande')),
  material VARCHAR(100),
  max_panels INTEGER CHECK (max_panels > 0),
  inclination_angle INTEGER CHECK (inclination_angle BETWEEN 0 AND 90),
  load_capacity_kg DECIMAL(10,2) CHECK (load_capacity_kg > 0),
  
  -- STRING BOXES
  input_count INTEGER CHECK (input_count > 0),
  output_count INTEGER CHECK (output_count > 0),
  voltage_rating VARCHAR(50),
  current_rating VARCHAR(50),
  protection_type VARCHAR(200),
  ip_rating VARCHAR(10),
  certifications TEXT,
  
  -- CABOS
  gauge_mm2 DECIMAL(6,2) CHECK (gauge_mm2 > 0),
  cable_color VARCHAR(50),
  cable_length_m DECIMAL(8,2) CHECK (cable_length_m > 0),
  temperature_rating VARCHAR(50),
  cable_type VARCHAR(100),
  
  -- CONTROLADORES
  controller_type VARCHAR(50) CHECK (controller_type IN ('MPPT', 'PWM')),
  max_pv_voltage INTEGER CHECK (max_pv_voltage > 0),
  voltage_system VARCHAR(50),
  
  -- CARREGADORES VE
  connector_type VARCHAR(100),
  smart_features TEXT,
  
  -- METADADOS
  warranty_years INTEGER CHECK (warranty_years > 0),
  size_bytes INTEGER CHECK (size_bytes > 0),
  description TEXT,
  features TEXT,
  
  -- BUSCA FULL-TEXT
  search_vector tsvector,
  
  -- AUDITORIA
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_verified_at TIMESTAMP,
  
  -- STATUS
  is_active BOOLEAN DEFAULT true,
  out_of_stock BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- ANALYTICS
  view_count INTEGER DEFAULT 0,
  widget_render_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Busca por categoria (mais comum)
CREATE INDEX idx_catalog_category ON catalog(category) WHERE cdn_published = true;

-- Busca por fabricante
CREATE INDEX idx_catalog_manufacturer ON catalog(manufacturer) WHERE manufacturer IS NOT NULL;

-- Ordenação por preço
CREATE INDEX idx_catalog_price ON catalog(price_brl) WHERE cdn_published = true;

-- Filtros de potência
CREATE INDEX idx_catalog_power_kw ON catalog(power_kw) WHERE power_kw IS NOT NULL;
CREATE INDEX idx_catalog_power_kwp ON catalog(power_kwp) WHERE power_kwp IS NOT NULL;
CREATE INDEX idx_catalog_power_w ON catalog(power_w) WHERE power_w IS NOT NULL;

-- Status de publicação
CREATE INDEX idx_catalog_published ON catalog(cdn_published);

-- Produtos ativos
CREATE INDEX idx_catalog_active ON catalog(is_active) WHERE is_active = true;

-- Produtos em destaque
CREATE INDEX idx_catalog_featured ON catalog(featured) WHERE featured = true;

-- Busca full-text (PostgreSQL)
CREATE INDEX idx_catalog_search ON catalog USING GIN(search_vector);

-- Índice composto para queries comuns
CREATE INDEX idx_catalog_category_price ON catalog(category, price_brl) WHERE cdn_published = true;
CREATE INDEX idx_catalog_category_power ON catalog(category, power_kw, power_kwp, power_w) WHERE cdn_published = true;

-- Produtos mais vistos (analytics)
CREATE INDEX idx_catalog_view_count ON catalog(view_count DESC) WHERE cdn_published = true;

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_catalog_updated_at
  BEFORE UPDATE ON catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_catalog_updated_at();

-- ============================================================================
-- TRIGGER: Atualizar search_vector automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_catalog_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese',
    COALESCE(NEW.manufacturer, '') || ' ' ||
    COALESCE(NEW.model, '') || ' ' ||
    COALESCE(NEW.category, '') || ' ' ||
    COALESCE(NEW.distributor, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_catalog_search_vector
  BEFORE INSERT OR UPDATE OF manufacturer, model, category, distributor, description
  ON catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_catalog_search_vector();

-- ============================================================================
-- VIEWS: Consultas comuns pré-otimizadas
-- ============================================================================

-- View: Produtos publicados e ativos
CREATE OR REPLACE VIEW catalog_available AS
SELECT *
FROM catalog
WHERE cdn_published = true
  AND is_active = true
  AND out_of_stock = false;

-- View: Inversores com campos essenciais
CREATE OR REPLACE VIEW catalog_inversores AS
SELECT 
  sku,
  manufacturer,
  model,
  power_kw,
  power_w,
  voltage_v,
  phase,
  mppt_count,
  efficiency_percent,
  price_brl,
  image_url,
  warranty_years
FROM catalog
WHERE category = 'inversores'
  AND cdn_published = true
  AND is_active = true;

-- View: Kits solares completos
CREATE OR REPLACE VIEW catalog_kits AS
SELECT 
  sku,
  manufacturer,
  power_kwp,
  structure_type,
  system_type,
  price_brl,
  price_per_kwp,
  estimated_generation_kwh_month,
  image_url,
  warranty_years
FROM catalog
WHERE category = 'kits'
  AND cdn_published = true
  AND is_active = true
  AND power_kwp IS NOT NULL;

-- View: Painéis solares
CREATE OR REPLACE VIEW catalog_paineis AS
SELECT 
  sku,
  manufacturer,
  model,
  power_w,
  cell_type,
  efficiency_percent,
  dimensions_mm,
  weight_kg,
  price_brl,
  price_per_wp,
  image_url,
  warranty_years
FROM catalog
WHERE category = 'paineis'
  AND cdn_published = true
  AND is_active = true
  AND power_w IS NOT NULL;

-- View: Baterias
CREATE OR REPLACE VIEW catalog_baterias AS
SELECT 
  sku,
  manufacturer,
  model,
  technology,
  capacity_kwh,
  capacity_ah,
  voltage_v,
  cycle_life,
  dod_percent,
  price_brl,
  image_url,
  warranty_years
FROM catalog
WHERE category = 'baterias'
  AND cdn_published = true
  AND is_active = true
  AND (capacity_kwh IS NOT NULL OR capacity_ah IS NOT NULL);

-- ============================================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função: Buscar produtos similares por potência
CREATE OR REPLACE FUNCTION find_similar_by_power(
  target_sku VARCHAR(255),
  tolerance_percent DECIMAL DEFAULT 10,
  max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  sku VARCHAR(255),
  manufacturer VARCHAR(200),
  model VARCHAR(200),
  power_value DECIMAL,
  price_brl DECIMAL,
  image_url TEXT,
  similarity_score DECIMAL
) AS $$
DECLARE
  target_power DECIMAL;
  target_category VARCHAR(100);
BEGIN
  -- Obter potência e categoria do produto alvo
  SELECT 
    COALESCE(c.power_kw, c.power_kwp, c.power_w / 1000.0),
    c.category
  INTO target_power, target_category
  FROM catalog c
  WHERE c.sku = target_sku;
  
  IF target_power IS NULL THEN
    RAISE EXCEPTION 'Produto % não encontrado ou sem potência definida', target_sku;
  END IF;
  
  -- Buscar produtos similares
  RETURN QUERY
  SELECT 
    c.sku,
    c.manufacturer,
    c.model,
    COALESCE(c.power_kw, c.power_kwp, c.power_w / 1000.0) AS power_value,
    c.price_brl,
    c.image_url,
    (1 - ABS(COALESCE(c.power_kw, c.power_kwp, c.power_w / 1000.0) - target_power) / target_power) AS similarity_score
  FROM catalog c
  WHERE c.category = target_category
    AND c.sku != target_sku
    AND c.cdn_published = true
    AND c.is_active = true
    AND COALESCE(c.power_kw, c.power_kwp, c.power_w / 1000.0) 
        BETWEEN target_power * (1 - tolerance_percent / 100.0) 
        AND target_power * (1 + tolerance_percent / 100.0)
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Função: Incrementar view count
CREATE OR REPLACE FUNCTION increment_view_count(product_sku VARCHAR(255))
RETURNS VOID AS $$
BEGIN
  UPDATE catalog
  SET 
    view_count = view_count + 1,
    last_viewed_at = CURRENT_TIMESTAMP
  WHERE sku = product_sku;
END;
$$ LANGUAGE plpgsql;

-- Função: Incrementar widget render count
CREATE OR REPLACE FUNCTION increment_widget_count(product_sku VARCHAR(255))
RETURNS VOID AS $$
BEGIN
  UPDATE catalog
  SET widget_render_count = widget_render_count + 1
  WHERE sku = product_sku;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE catalog IS 'Catálogo completo de produtos solares publicados na AWS CloudFront CDN';
COMMENT ON COLUMN catalog.price_source IS 'Origem do preço: direct (fornecedor), similar (produto similar), estimated (algoritmo)';
COMMENT ON COLUMN catalog.price_confidence IS 'Confiança no preço: 1.0 (direct), 0.7 (similar), 0.4 (estimated)';
COMMENT ON COLUMN catalog.search_vector IS 'Vetor de busca full-text atualizado automaticamente por trigger';
COMMENT ON COLUMN catalog.view_count IS 'Número de visualizações do produto (analytics)';
COMMENT ON COLUMN catalog.widget_render_count IS 'Número de vezes que produto foi renderizado em widget';

-- ============================================================================
-- CONSTRAINTS ADICIONAIS
-- ============================================================================

-- Ao menos um campo de potência deve estar preenchido para inversores/kits/painéis
ALTER TABLE catalog ADD CONSTRAINT check_power_required
  CHECK (
    category NOT IN ('inversores', 'kits', 'paineis') OR
    power_w IS NOT NULL OR power_kw IS NOT NULL OR power_kwp IS NOT NULL
  );

-- Baterias devem ter capacidade
ALTER TABLE catalog ADD CONSTRAINT check_battery_capacity
  CHECK (
    category != 'baterias' OR
    capacity_kwh IS NOT NULL OR capacity_ah IS NOT NULL
  );

-- Kits devem ter tipo de estrutura
ALTER TABLE catalog ADD CONSTRAINT check_kit_structure
  CHECK (
    category != 'kits' OR
    structure_type IS NOT NULL
  );

-- ============================================================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================================================

-- Inserir categorias conhecidas (para referência)
CREATE TABLE IF NOT EXISTS catalog_categories (
  name VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  required_fields TEXT[],
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0
);

INSERT INTO catalog_categories (name, display_name, description, required_fields, sort_order) VALUES
  ('inversores', 'Inversores Solares', 'Inversores para conversão DC→AC', ARRAY['power_kw', 'voltage_v'], 1),
  ('kits', 'Kits Solares Completos', 'Kits prontos para instalação', ARRAY['power_kwp', 'structure_type'], 2),
  ('paineis', 'Painéis Fotovoltaicos', 'Módulos solares', ARRAY['power_w', 'cell_type'], 3),
  ('baterias', 'Baterias', 'Armazenamento de energia', ARRAY['capacity_kwh', 'technology'], 4),
  ('estruturas', 'Estruturas de Fixação', 'Suportes para painéis', ARRAY['roof_type'], 5),
  ('stringboxes', 'String Boxes', 'Caixas de junção e proteção', ARRAY['input_count'], 6),
  ('cabos', 'Cabos Elétricos', 'Cabos solares', ARRAY['gauge_mm2'], 7),
  ('carregadores', 'Carregadores VE', 'Carregadores para veículos elétricos', ARRAY['power_kw'], 8),
  ('controladores', 'Controladores de Carga', 'Controladores MPPT/PWM', ARRAY['controller_type'], 9),
  ('estacoes', 'Estações de Energia', 'Sistemas portáteis', ARRAY['capacity_kwh'], 10),
  ('postes', 'Postes Solares', 'Iluminação pública solar', ARRAY['height_m'], 11),
  ('acessorios', 'Acessórios', 'Componentes diversos', ARRAY[]::TEXT[], 12)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS (ajustar conforme necessário)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE ON catalog TO app_user;
-- GRANT SELECT ON catalog_available TO app_user;
-- GRANT EXECUTE ON FUNCTION find_similar_by_power TO app_user;
-- GRANT EXECUTE ON FUNCTION increment_view_count TO app_user;
-- GRANT EXECUTE ON FUNCTION increment_widget_count TO app_user;
