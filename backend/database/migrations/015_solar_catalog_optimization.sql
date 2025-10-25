-- =====================================================
-- Migration 015: Solar Catalog Optimization
-- Tabelas para armazenamento otimizado de kits e equipamentos solares
-- Cobertura 360º para máxima performance no storefront
-- =====================================================
-- Data: 2025-10-08
-- Autor: GitHub Copilot
-- Objetivo: Cache inteligente, indexação semântica, recuperação rápida
-- =====================================================

-- =====================================================
-- 1. CATALOG CACHE - Cache multi-camadas para performance
-- =====================================================

CREATE TABLE IF NOT EXISTS catalog_cache (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Identificação
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_type VARCHAR(50) NOT NULL, -- products, kits, panels, inverters, batteries, structures, filters, search
    entity_type VARCHAR(50), -- specific entity: kit, panel, inverter, battery, structure, accessory
    entity_id TEXT, -- FK to product.id or external ID
    
    -- Cache Data
    cached_data JSONB NOT NULL,
    cached_html TEXT, -- pre-rendered HTML for ultra-fast loading
    cached_metadata JSONB, -- additional metadata for smart invalidation
    
    -- Compression & Size
    is_compressed BOOLEAN DEFAULT false,
    uncompressed_size_bytes INTEGER,
    compressed_size_bytes INTEGER,
    compression_ratio NUMERIC(5,2),
    
    -- Lifecycle
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    is_stale BOOLEAN DEFAULT false,
    invalidation_reason TEXT,
    
    -- Performance Metrics
    generation_time_ms INTEGER, -- time to generate cache
    avg_retrieval_time_ms NUMERIC(10,2),
    hit_ratio NUMERIC(5,2),
    
    -- Smart Invalidation
    dependencies JSONB, -- {product_ids: [], category_ids: [], tag_ids: []}
    invalidate_on_events JSONB, -- [product_update, price_change, stock_change]
    priority INTEGER DEFAULT 5, -- 1-10, cache priority for cleanup
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for catalog_cache
CREATE INDEX IF NOT EXISTS idx_catalog_cache_key ON catalog_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_catalog_cache_type ON catalog_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_catalog_cache_entity ON catalog_cache(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_catalog_cache_expires ON catalog_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_catalog_cache_stale ON catalog_cache(is_stale) WHERE is_stale = true;
CREATE INDEX IF NOT EXISTS idx_catalog_cache_priority ON catalog_cache(priority, last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_catalog_cache_dependencies ON catalog_cache USING gin(dependencies);
CREATE INDEX IF NOT EXISTS idx_catalog_cache_metadata ON catalog_cache USING gin(cached_metadata);

COMMENT ON TABLE catalog_cache IS 'Multi-layer cache for solar catalog with smart invalidation';
COMMENT ON COLUMN catalog_cache.cached_html IS 'Pre-rendered HTML for zero-latency page loads';
COMMENT ON COLUMN catalog_cache.dependencies IS 'Product/category/tag IDs for cascade invalidation';

-- =====================================================
-- 2. SOLAR PRODUCT METADATA - Extended metadata for solar products
-- =====================================================

CREATE TABLE IF NOT EXISTS solar_product_metadata (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Product Reference (Medusa)
    product_id TEXT NOT NULL UNIQUE, -- FK to product.id
    variant_id TEXT, -- FK to product_variant.id
    external_id TEXT, -- original catalog ID (FOTUS-KP04, ODEX-PAINEL-585W, etc.)
    
    -- Solar-Specific Type
    solar_type VARCHAR(50) NOT NULL, -- kit, panel, inverter, battery, structure, accessory, cable, controller, stringbox, ev_charger
    solar_subtype VARCHAR(100), -- kit_complete, kit_basic, microinversor, string_inverter, hybrid_inverter, etc.
    
    -- Technical Specifications (JSONB for flexibility)
    technical_specs JSONB, -- {power_w, voltage_v, current_a, efficiency, technology, phases, etc.}
    performance_data JSONB, -- {rated_power, max_power, efficiency_curve, temperature_coef, degradation_rate}
    dimensional_data JSONB, -- {length_mm, width_mm, height_mm, weight_kg, area_m2}
    electrical_data JSONB, -- {voc, isc, vmp, imp, mppt_range, max_input_current}
    
    -- Certifications & Standards
    certifications JSONB, -- [INMETRO, IEC, CE, UL, TUV]
    compliance_standards JSONB, -- [NBR 16274, NBR 16690, IEC 61215, IEC 61730]
    warranty_years INTEGER,
    warranty_terms JSONB,
    
    -- Manufacturer Data
    manufacturer VARCHAR(100),
    manufacturer_code VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(200),
    manufacturer_data JSONB, -- {country, tier, certifications, website}
    
    -- Kit Composition (for kits)
    kit_components JSONB, -- {panels: [{brand, model, qty, power_w}], inverters: [...], batteries: [...]}
    total_power_w INTEGER,
    total_panels INTEGER,
    total_inverters INTEGER,
    total_batteries INTEGER,
    recommended_structure VARCHAR(100), -- Cerâmico, Metálico, Fibrocimento, Solo, Laje
    
    -- Distributor Data
    distributor VARCHAR(100), -- FOTUS, NEOSOLAR, ODEX, etc.
    distributor_sku VARCHAR(200),
    distribution_center VARCHAR(100),
    
    -- Images & Media (extended)
    image_urls JSONB, -- {original, thumb, medium, large, webp, avif}
    datasheet_url TEXT,
    manual_url TEXT,
    video_url TEXT,
    cad_files JSONB,
    
    -- Search & Discovery
    search_keywords TEXT[], -- extracted keywords for full-text search
    -- semantic_embedding VECTOR(768), -- vector embedding for semantic search (requires pgvector extension)
    semantic_embedding_json JSONB, -- JSON representation of vector until pgvector is installed
    tags VARCHAR(50)[],
    
    -- Quality & Enrichment
    data_completeness_score NUMERIC(5,2), -- 0-100
    quality_score NUMERIC(5,2), -- 0-100
    is_verified BOOLEAN DEFAULT false,
    verified_by TEXT,
    verified_at TIMESTAMP,
    enrichment_level VARCHAR(20), -- basic, standard, premium, complete
    enriched_at TIMESTAMP,
    
    -- Source Tracking
    source_file VARCHAR(255),
    source_system VARCHAR(50),
    import_batch_id TEXT,
    last_sync_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for solar_product_metadata
CREATE INDEX IF NOT EXISTS idx_solar_metadata_product ON solar_product_metadata(product_id);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_variant ON solar_product_metadata(variant_id);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_external ON solar_product_metadata(external_id);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_type ON solar_product_metadata(solar_type);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_subtype ON solar_product_metadata(solar_subtype);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_manufacturer ON solar_product_metadata(manufacturer);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_brand ON solar_product_metadata(brand);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_distributor ON solar_product_metadata(distributor);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_power ON solar_product_metadata(total_power_w);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_verified ON solar_product_metadata(is_verified);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_quality ON solar_product_metadata(quality_score);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_tags ON solar_product_metadata USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_keywords ON solar_product_metadata USING gin(search_keywords);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_specs ON solar_product_metadata USING gin(technical_specs);
CREATE INDEX IF NOT EXISTS idx_solar_metadata_components ON solar_product_metadata USING gin(kit_components);

COMMENT ON TABLE solar_product_metadata IS 'Extended metadata for solar products with technical specs, certifications, and enrichment';
COMMENT ON COLUMN solar_product_metadata.semantic_embedding IS 'Vector embedding for semantic similarity search (requires pgvector extension)';
COMMENT ON COLUMN solar_product_metadata.kit_components IS 'Complete composition for kits including panels, inverters, batteries';

-- =====================================================
-- 3. PRODUCT SEARCH INDEX - Optimized full-text search
-- =====================================================

CREATE TABLE IF NOT EXISTS product_search_index (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Product Reference
    product_id TEXT NOT NULL,
    variant_id TEXT,
    
    -- Search Fields (denormalized for performance)
    search_title TEXT NOT NULL,
    search_description TEXT,
    search_brand VARCHAR(100),
    search_manufacturer VARCHAR(100),
    search_model VARCHAR(200),
    search_sku VARCHAR(200),
    
    -- Full-text Search Vector
    search_vector tsvector,
    
    -- Faceted Search Data
    facets JSONB, -- {category, type, brand, power_range, price_range, voltage, phases}
    filters JSONB, -- {min_power_w, max_power_w, min_price, max_price, in_stock, verified}
    
    -- Ranking & Relevance
    relevance_score NUMERIC(10,4) DEFAULT 0,
    popularity_score NUMERIC(10,4) DEFAULT 0,
    recency_score NUMERIC(10,4) DEFAULT 0,
    quality_score NUMERIC(10,4) DEFAULT 0,
    combined_score NUMERIC(10,4) GENERATED ALWAYS AS (
        (relevance_score * 0.4) + 
        (popularity_score * 0.3) + 
        (recency_score * 0.2) + 
        (quality_score * 0.1)
    ) STORED,
    
    -- Availability & Stock
    is_available BOOLEAN DEFAULT true,
    stock_status VARCHAR(20), -- in_stock, low_stock, out_of_stock, pre_order
    
    -- Pricing (for filtering)
    price_brl NUMERIC(12,2),
    price_tier VARCHAR(20), -- economy, standard, premium, professional
    
    -- Performance Tracking
    view_count INTEGER DEFAULT 0,
    search_hit_count INTEGER DEFAULT 0,
    click_through_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    
    last_indexed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for product_search_index
CREATE INDEX IF NOT EXISTS idx_search_product ON product_search_index(product_id);
CREATE INDEX IF NOT EXISTS idx_search_variant ON product_search_index(variant_id);
CREATE INDEX IF NOT EXISTS idx_search_vector ON product_search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_brand ON product_search_index(search_brand);
CREATE INDEX IF NOT EXISTS idx_search_manufacturer ON product_search_index(search_manufacturer);
CREATE INDEX IF NOT EXISTS idx_search_available ON product_search_index(is_available);
CREATE INDEX IF NOT EXISTS idx_search_stock ON product_search_index(stock_status);
CREATE INDEX IF NOT EXISTS idx_search_price ON product_search_index(price_brl);
CREATE INDEX IF NOT EXISTS idx_search_combined_score ON product_search_index(combined_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_facets ON product_search_index USING gin(facets);
CREATE INDEX IF NOT EXISTS idx_search_filters ON product_search_index USING gin(filters);

COMMENT ON TABLE product_search_index IS 'Optimized search index with full-text, facets, and ranking';
COMMENT ON COLUMN product_search_index.search_vector IS 'PostgreSQL tsvector for full-text search';
COMMENT ON COLUMN product_search_index.combined_score IS 'Weighted score for ranking search results';

-- =====================================================
-- 4. KIT COMPATIBILITY MATRIX - Compatibility between components
-- =====================================================

CREATE TABLE IF NOT EXISTS kit_compatibility_matrix (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Component A (e.g., Panel)
    component_a_id TEXT NOT NULL,
    component_a_type VARCHAR(50) NOT NULL, -- panel, inverter, battery, structure
    component_a_specs JSONB,
    
    -- Component B (e.g., Inverter)
    component_b_id TEXT NOT NULL,
    component_b_type VARCHAR(50) NOT NULL,
    component_b_specs JSONB,
    
    -- Compatibility Analysis
    is_compatible BOOLEAN NOT NULL,
    compatibility_score NUMERIC(5,2), -- 0-100
    compatibility_level VARCHAR(20), -- perfect, good, acceptable, marginal, incompatible
    
    -- Technical Validation
    voltage_compatible BOOLEAN,
    current_compatible BOOLEAN,
    power_compatible BOOLEAN,
    mppt_compatible BOOLEAN,
    phase_compatible BOOLEAN,
    
    -- Constraints & Limits
    min_quantity INTEGER,
    max_quantity INTEGER,
    recommended_quantity INTEGER,
    configuration_notes TEXT,
    
    -- Validation Details
    validation_rules JSONB, -- {mppt_range, voltage_window, current_limit, power_ratio}
    validation_errors JSONB,
    validation_warnings JSONB,
    
    -- Performance Impact
    efficiency_impact_percent NUMERIC(5,2),
    performance_notes TEXT,
    
    -- Source & Verification
    validated_by VARCHAR(50), -- pvlib, manual, distributor, manufacturer
    validated_at TIMESTAMP,
    validation_method VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(component_a_id, component_b_id)
);

-- Indexes for kit_compatibility_matrix
CREATE INDEX IF NOT EXISTS idx_compat_a ON kit_compatibility_matrix(component_a_id, component_a_type);
CREATE INDEX IF NOT EXISTS idx_compat_b ON kit_compatibility_matrix(component_b_id, component_b_type);
CREATE INDEX IF NOT EXISTS idx_compat_pair ON kit_compatibility_matrix(component_a_id, component_b_id);
CREATE INDEX IF NOT EXISTS idx_compat_score ON kit_compatibility_matrix(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_compat_level ON kit_compatibility_matrix(compatibility_level);
CREATE INDEX IF NOT EXISTS idx_compat_compatible ON kit_compatibility_matrix(is_compatible);

COMMENT ON TABLE kit_compatibility_matrix IS 'Technical compatibility validation between solar components';
COMMENT ON COLUMN kit_compatibility_matrix.compatibility_score IS 'Calculated score based on electrical and mechanical compatibility';

-- =====================================================
-- 5. PRODUCT IMAGES CACHE - Optimized image serving
-- =====================================================

CREATE TABLE IF NOT EXISTS product_images_cache (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Product Reference
    product_id TEXT NOT NULL,
    variant_id TEXT,
    image_type VARCHAR(50), -- product, kit, component, lifestyle, technical, installation
    
    -- Original Image
    original_url TEXT NOT NULL,
    original_width INTEGER,
    original_height INTEGER,
    original_size_bytes INTEGER,
    original_format VARCHAR(10), -- jpg, png, webp, avif
    
    -- Optimized Versions
    thumb_url TEXT,
    thumb_width INTEGER DEFAULT 150,
    thumb_height INTEGER DEFAULT 150,
    
    medium_url TEXT,
    medium_width INTEGER DEFAULT 400,
    medium_height INTEGER DEFAULT 400,
    
    large_url TEXT,
    large_width INTEGER DEFAULT 1000,
    large_height INTEGER DEFAULT 1000,
    
    webp_url TEXT,
    avif_url TEXT,
    
    -- CDN & Storage
    cdn_url TEXT,
    storage_provider VARCHAR(50), -- local, s3, cloudflare, cloudinary
    storage_path TEXT,
    is_cached BOOLEAN DEFAULT false,
    
    -- Image Quality
    quality_score NUMERIC(5,2), -- 0-100 based on resolution, format, compression
    is_placeholder BOOLEAN DEFAULT false,
    needs_optimization BOOLEAN DEFAULT false,
    
    -- Metadata
    alt_text TEXT,
    title TEXT,
    caption TEXT,
    image_metadata JSONB, -- {photographer, license, date_taken, camera, exif}
    
    -- Performance
    load_time_ms INTEGER,
    total_size_bytes INTEGER,
    compression_ratio NUMERIC(5,2),
    
    -- Processing
    processed_at TIMESTAMP,
    processing_status VARCHAR(20), -- pending, processing, completed, failed
    processing_error TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for product_images_cache
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images_cache(product_id);
CREATE INDEX IF NOT EXISTS idx_images_variant ON product_images_cache(variant_id);
CREATE INDEX IF NOT EXISTS idx_images_type ON product_images_cache(image_type);
CREATE INDEX IF NOT EXISTS idx_images_cached ON product_images_cache(is_cached);
CREATE INDEX IF NOT EXISTS idx_images_placeholder ON product_images_cache(is_placeholder);
CREATE INDEX IF NOT EXISTS idx_images_optimization ON product_images_cache(needs_optimization) WHERE needs_optimization = true;
CREATE INDEX IF NOT EXISTS idx_images_status ON product_images_cache(processing_status);

COMMENT ON TABLE product_images_cache IS 'Optimized image cache with multiple formats and sizes for fast serving';
COMMENT ON COLUMN product_images_cache.webp_url IS 'WebP format for modern browsers (~30% smaller)';
COMMENT ON COLUMN product_images_cache.avif_url IS 'AVIF format for cutting-edge browsers (~50% smaller)';

-- =====================================================
-- 6. CATALOG ANALYTICS - Real-time catalog performance
-- =====================================================

CREATE TABLE IF NOT EXISTS catalog_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Product Reference
    product_id TEXT NOT NULL,
    variant_id TEXT,
    
    -- Time Period
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    period_type VARCHAR(20), -- hour, day, week, month
    
    -- View Metrics
    total_views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    avg_time_on_page_seconds NUMERIC(10,2),
    bounce_rate NUMERIC(5,2),
    
    -- Search Metrics
    search_appearances INTEGER DEFAULT 0,
    search_clicks INTEGER DEFAULT 0,
    search_ctr NUMERIC(5,4) GENERATED ALWAYS AS (
        CASE 
            WHEN search_appearances > 0 THEN (search_clicks::numeric / search_appearances)
            ELSE 0
        END
    ) STORED,
    avg_search_position NUMERIC(5,2),
    
    -- Engagement Metrics
    add_to_cart_count INTEGER DEFAULT 0,
    add_to_quote_count INTEGER DEFAULT 0,
    add_to_favorite_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Conversion Metrics
    quote_conversion_count INTEGER DEFAULT 0,
    order_conversion_count INTEGER DEFAULT 0,
    total_revenue_brl NUMERIC(12,2) DEFAULT 0,
    avg_order_value_brl NUMERIC(12,2),
    
    -- Performance Indicators
    conversion_rate NUMERIC(5,4) GENERATED ALWAYS AS (
        CASE 
            WHEN total_views > 0 THEN (order_conversion_count::numeric / total_views)
            ELSE 0
        END
    ) STORED,
    revenue_per_view NUMERIC(12,4),
    
    -- Stock Impact
    stock_outs INTEGER DEFAULT 0,
    low_stock_hours INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(product_id, period_start, period_type)
);

-- Indexes for catalog_analytics
CREATE INDEX IF NOT EXISTS idx_analytics_product ON catalog_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_variant ON catalog_analytics(variant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON catalog_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON catalog_analytics(period_type);
CREATE INDEX IF NOT EXISTS idx_analytics_views ON catalog_analytics(total_views DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions ON catalog_analytics(order_conversion_count DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_revenue ON catalog_analytics(total_revenue_brl DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_ctr ON catalog_analytics(search_ctr DESC);

COMMENT ON TABLE catalog_analytics IS 'Real-time analytics for catalog performance and conversions';
COMMENT ON COLUMN catalog_analytics.search_ctr IS 'Click-through rate for search results (auto-calculated)';
COMMENT ON COLUMN catalog_analytics.conversion_rate IS 'View-to-order conversion rate (auto-calculated)';

-- =====================================================
-- 7. AUTO-UPDATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_catalog_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER catalog_cache_updated_at
    BEFORE UPDATE ON catalog_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_cache_timestamp();

CREATE TRIGGER solar_product_metadata_updated_at
    BEFORE UPDATE ON solar_product_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_cache_timestamp();

CREATE TRIGGER product_search_index_updated_at
    BEFORE UPDATE ON product_search_index
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_cache_timestamp();

CREATE TRIGGER kit_compatibility_matrix_updated_at
    BEFORE UPDATE ON kit_compatibility_matrix
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_cache_timestamp();

CREATE TRIGGER product_images_cache_updated_at
    BEFORE UPDATE ON product_images_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_cache_timestamp();

CREATE TRIGGER catalog_analytics_updated_at
    BEFORE UPDATE ON catalog_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_cache_timestamp();

-- =====================================================
-- 8. SUMMARY & VERIFICATION
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Count tables created
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
          'catalog_cache',
          'solar_product_metadata',
          'product_search_index',
          'kit_compatibility_matrix',
          'product_images_cache',
          'catalog_analytics'
      );
    
    -- Count indexes created
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN (
          'catalog_cache',
          'solar_product_metadata',
          'product_search_index',
          'kit_compatibility_matrix',
          'product_images_cache',
          'catalog_analytics'
      );
    
    -- Count triggers created
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgname IN (
        'catalog_cache_updated_at',
        'solar_product_metadata_updated_at',
        'product_search_index_updated_at',
        'kit_compatibility_matrix_updated_at',
        'product_images_cache_updated_at',
        'catalog_analytics_updated_at'
    );
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration 015: Solar Catalog Optimization';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Triggers created: %', trigger_count;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Status: COMPLETED SUCCESSFULLY';
    RAISE NOTICE '==============================================';
END;
$$;
