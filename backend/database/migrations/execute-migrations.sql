-- Executar migrações customizadas
-- 1. Unified Catalog Tables

CREATE TABLE IF NOT EXISTS "manufacturer" (
  "id" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "tier" VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
  "country" VARCHAR(100),
  "product_count" INTEGER NOT NULL DEFAULT 0,
  "aliases" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "manufacturer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sku" (
  "id" VARCHAR(255) NOT NULL,
  "sku_code" VARCHAR(255) NOT NULL UNIQUE,
  "manufacturer_id" VARCHAR(255) NOT NULL,
  "name" VARCHAR(500) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100) NOT NULL,
  "technical_specs" JSONB NOT NULL,
  "lowest_price" DECIMAL(12,2),
  "highest_price" DECIMAL(12,2),
  "average_price" DECIMAL(12,2),
  "total_offers" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "sku_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sku_manufacturer_fk" FOREIGN KEY ("manufacturer_id") 
    REFERENCES "manufacturer"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "distributor_offer" (
  "id" VARCHAR(255) NOT NULL,
  "sku_id" VARCHAR(255) NOT NULL,
  "distributor_name" VARCHAR(255) NOT NULL,
  "distributor_id" VARCHAR(255),
  "price" DECIMAL(12,2) NOT NULL,
  "stock_status" VARCHAR(50) NOT NULL DEFAULT 'unknown',
  "stock_quantity" INTEGER,
  "lead_time_days" INTEGER,
  "shipping_cost" DECIMAL(12,2),
  "last_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "distributor_offer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "distributor_offer_sku_fk" FOREIGN KEY ("sku_id") 
    REFERENCES "sku"("id") ON DELETE CASCADE
);

-- 2. Solar Journey Tables

CREATE TABLE IF NOT EXISTS solar_calculation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  quote_id UUID,
  
  -- Input Data
  consumo_kwh_mes DECIMAL(10, 2) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  cep VARCHAR(10),
  tipo_telhado VARCHAR(50) NOT NULL,
  oversizing_target DECIMAL(5, 2) DEFAULT 1.2 NOT NULL,
  
  -- Results
  potencia_instalada_kwp DECIMAL(10, 2) NOT NULL,
  numero_modulos INTEGER NOT NULL,
  numero_inversores INTEGER NOT NULL,
  area_necessaria_m2 DECIMAL(10, 2) NOT NULL,
  geracao_anual_kwh DECIMAL(10, 2) NOT NULL,
  
  -- Financial
  investimento_total DECIMAL(12, 2) NOT NULL,
  economia_mensal DECIMAL(12, 2) NOT NULL,
  payback_anos DECIMAL(5, 2) NOT NULL,
  
  -- Metadata
  calculation_metadata JSONB,
  status VARCHAR(50) DEFAULT 'completed' NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  quote_id UUID,
  
  -- Request Data
  requested_amount DECIMAL(12, 2) NOT NULL,
  requested_term_months INTEGER NOT NULL,
  monthly_income DECIMAL(12, 2) NOT NULL,
  
  -- Score
  total_score DECIMAL(5, 2) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  approved BOOLEAN NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS "idx_manufacturer_slug" ON "manufacturer"("slug");
CREATE INDEX IF NOT EXISTS "idx_sku_code" ON "sku"("sku_code");
CREATE INDEX IF NOT EXISTS "idx_solar_calculation_customer_id" ON solar_calculation(customer_id);
CREATE INDEX IF NOT EXISTS "idx_credit_analysis_customer_id" ON credit_analysis(customer_id);