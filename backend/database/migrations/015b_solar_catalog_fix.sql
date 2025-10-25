-- =============================================================================
-- Migration 015b: Solar Catalog Optimization - Complementary Tables
-- =============================================================================
-- Purpose: Adicionar tabelas complementares sem conflitos com estrutura existente
-- Note: solar_product_metadata já existe com estrutura diferente
-- =============================================================================

-- Adicionar campos necessários à tabela solar_product_metadata existente
ALTER TABLE solar_product_metadata 
ADD COLUMN
IF NOT EXISTS category VARCHAR
(50),
ADD COLUMN
IF NOT EXISTS subcategory VARCHAR
(50),
ADD COLUMN
IF NOT EXISTS cached_price DECIMAL
(12,2),
ADD COLUMN
IF NOT EXISTS cached_availability VARCHAR
(50),
ADD COLUMN
IF NOT EXISTS cached_qty_available INTEGER,
ADD COLUMN
IF NOT EXISTS price_last_updated TIMESTAMP,
ADD COLUMN
IF NOT EXISTS compatible_with JSONB,
ADD COLUMN
IF NOT EXISTS incompatible_with JSONB,
ADD COLUMN
IF NOT EXISTS recommended_accessories JSONB,
ADD COLUMN
IF NOT EXISTS search_tags JSONB,
ADD COLUMN
IF NOT EXISTS filter_attributes JSONB,
ADD COLUMN
IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN
IF NOT EXISTS cart_add_count INTEGER DEFAULT 0,
ADD COLUMN
IF NOT EXISTS purchase_count INTEGER DEFAULT 0,
ADD COLUMN
IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN
IF NOT EXISTS is_certified BOOLEAN DEFAULT false,
ADD COLUMN
IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;

-- Atualizar categorias baseado em solar_type
UPDATE solar_product_metadata SET category = 
    CASE 
        WHEN solar_type LIKE '%painel%' OR solar_type LIKE '%panel%' OR solar_type LIKE '%module%' THEN 'panel'
        WHEN solar_type LIKE '%inversor%' OR solar_type LIKE '%inverter%' THEN 'inverter'
        WHEN solar_type LIKE '%bateria%' OR solar_type LIKE '%battery%' THEN 'battery'
        WHEN solar_type LIKE '%estrutura%' OR solar_type LIKE '%structure%' THEN 'structure'
        WHEN solar_type LIKE '%cabo%' OR solar_type LIKE '%cable%' THEN 'cable'
        WHEN solar_type LIKE '%proteção%' OR solar_type LIKE '%protection%' THEN 'protection'
        WHEN solar_type LIKE '%kit%' THEN 'kit'
        ELSE 'accessory'
    END
WHERE category IS NULL;

-- Criar índices adicionais
CREATE INDEX
IF NOT EXISTS idx_solar_product_category ON solar_product_metadata
(category, subcategory);
CREATE INDEX
IF NOT EXISTS idx_solar_product_active ON solar_product_metadata
(is_active);
CREATE INDEX
IF NOT EXISTS idx_solar_product_price ON solar_product_metadata
(cached_price);
CREATE INDEX
IF NOT EXISTS idx_solar_product_availability ON solar_product_metadata
(cached_availability);
CREATE INDEX
IF NOT EXISTS idx_solar_product_tags ON solar_product_metadata USING gin
(search_tags);
CREATE INDEX
IF NOT EXISTS idx_solar_product_filters ON solar_product_metadata USING gin
(filter_attributes);

-- View corrigida: Produtos por Categoria
CREATE OR REPLACE VIEW v_products_by_category AS
SELECT
    spm.category,
    spm.subcategory,
    COUNT(*) as product_count,
    AVG(spm.cached_price) as avg_price,
    SUM(COALESCE(spm.cached_qty_available, 0)) as total_stock
FROM solar_product_metadata spm
WHERE spm.is_active = true
GROUP BY spm.category, spm.subcategory;

-- View corrigida: Kits Mais Populares
CREATE OR REPLACE VIEW v_popular_kits AS
SELECT
    sk.*,
    COALESCE(kva.view_count, 0) as view_count,
    COALESCE(kva.cart_add_count, 0) as cart_add_count,
    COALESCE(kva.conversion_count, 0) as conversion_count,
    CASE 
        WHEN COALESCE(kva.view_count, 0) > 0 THEN (kva.cart_add_count::DECIMAL / kva.view_count) * 100
        ELSE 0 
    END as cart_add_rate,
    CASE 
        WHEN COALESCE(kva.cart_add_count, 0) > 0 THEN (kva.conversion_count::DECIMAL / kva.cart_add_count) * 100
        ELSE 0 
    END as purchase_conversion_rate
FROM solar_kits sk
    LEFT JOIN (
    SELECT
        kit_id,
        COUNT(*) as view_count,
        SUM(CASE WHEN added_to_cart THEN 1 ELSE 0 END) as cart_add_count,
        SUM(CASE WHEN converted_to_order THEN 1 ELSE 0 END) as conversion_count
    FROM kit_view_analytics
    WHERE viewed_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    GROUP BY kit_id
) kva ON kva.kit_id = sk.id
WHERE sk.is_active = true
ORDER BY COALESCE(kva.view_count, 0) DESC;

-- =============================================================================
-- Status Report
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Migration 015b concluída!';
    RAISE NOTICE '✓ Campos adicionados à solar_product_metadata';
    RAISE NOTICE '✓ Views corrigidas: v_products_by_category, v_popular_kits';
    RAISE NOTICE '✓ Índices adicionais criados';
END $$;
