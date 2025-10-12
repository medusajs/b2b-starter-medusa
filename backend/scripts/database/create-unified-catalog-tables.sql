-- Create Unified Catalog Tables
-- Generated: 2025-10-09

-- Create manufacturer table
CREATE TABLE
IF NOT EXISTS "manufacturer"
(
  "id" VARCHAR
(255) NOT NULL,
  "name" VARCHAR
(255) NOT NULL,
  "slug" VARCHAR
(255) NOT NULL UNIQUE,
  "tier" VARCHAR
(50) NOT NULL DEFAULT 'UNKNOWN',
  "country" VARCHAR
(100),
  "product_count" INTEGER NOT NULL DEFAULT 0,
  "aliases" JSONB,
  "created_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "updated_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "deleted_at" TIMESTAMP
WITH TIME ZONE,
  CONSTRAINT "manufacturer_pkey" PRIMARY KEY
("id")
);

-- Create SKU table
CREATE TABLE
IF NOT EXISTS "sku"
(
  "id" VARCHAR
(255) NOT NULL,
  "sku_code" VARCHAR
(255) NOT NULL UNIQUE,
  "manufacturer_id" VARCHAR
(255) NOT NULL,
  "name" VARCHAR
(500) NOT NULL,
  "description" TEXT,
  "category" VARCHAR
(100) NOT NULL,
  "technical_specs" JSONB NOT NULL,
  "lowest_price" DECIMAL
(12,2),
  "highest_price" DECIMAL
(12,2),
  "average_price" DECIMAL
(12,2),
  "total_offers" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "updated_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "deleted_at" TIMESTAMP
WITH TIME ZONE,
  CONSTRAINT "sku_pkey" PRIMARY KEY
("id"),
  CONSTRAINT "sku_manufacturer_fk" FOREIGN KEY
("manufacturer_id") 
    REFERENCES "manufacturer"
("id") ON
DELETE CASCADE
);

-- Create distributor_offer table
CREATE TABLE
IF NOT EXISTS "distributor_offer"
(
  "id" VARCHAR
(255) NOT NULL,
  "sku_id" VARCHAR
(255) NOT NULL,
  "distributor_name" VARCHAR
(255) NOT NULL,
  "distributor_id" VARCHAR
(255),
  "price" DECIMAL
(12,2) NOT NULL,
  "stock_status" VARCHAR
(50) NOT NULL DEFAULT 'unknown',
  "stock_quantity" INTEGER,
  "lead_time_days" INTEGER,
  "shipping_cost" DECIMAL
(12,2),
  "last_updated_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "created_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "updated_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "deleted_at" TIMESTAMP
WITH TIME ZONE,
  CONSTRAINT "distributor_offer_pkey" PRIMARY KEY
("id"),
  CONSTRAINT "distributor_offer_sku_fk" FOREIGN KEY
("sku_id") 
    REFERENCES "sku"
("id") ON
DELETE CASCADE
);

-- Create kit table
CREATE TABLE
IF NOT EXISTS "kit"
(
  "id" VARCHAR
(255) NOT NULL,
  "kit_code" VARCHAR
(255) NOT NULL UNIQUE,
  "name" VARCHAR
(500) NOT NULL,
  "description" TEXT,
  "system_capacity_kwp" DECIMAL
(8,2) NOT NULL,
  "components" JSONB NOT NULL,
  "kit_price" DECIMAL
(12,2),
  "discount_pct" DECIMAL
(5,2),
  "target_consumer_class" VARCHAR
(50),
  "created_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "updated_at" TIMESTAMP
WITH TIME ZONE NOT NULL DEFAULT NOW
(),
  "deleted_at" TIMESTAMP
WITH TIME ZONE,
  CONSTRAINT "kit_pkey" PRIMARY KEY
("id")
);

-- Create indexes for better query performance
CREATE INDEX
IF NOT EXISTS "idx_manufacturer_tier" ON "manufacturer"
("tier");
CREATE INDEX
IF NOT EXISTS "idx_manufacturer_slug" ON "manufacturer"
("slug");

CREATE INDEX
IF NOT EXISTS "idx_sku_manufacturer" ON "sku"
("manufacturer_id");
CREATE INDEX
IF NOT EXISTS "idx_sku_category" ON "sku"
("category");
CREATE INDEX
IF NOT EXISTS "idx_sku_code" ON "sku"
("sku_code");
CREATE INDEX
IF NOT EXISTS "idx_sku_prices" ON "sku"
("average_price", "lowest_price");

CREATE INDEX
IF NOT EXISTS "idx_offer_sku" ON "distributor_offer"
("sku_id");
CREATE INDEX
IF NOT EXISTS "idx_offer_distributor" ON "distributor_offer"
("distributor_name");
CREATE INDEX
IF NOT EXISTS "idx_offer_price" ON "distributor_offer"
("price");

CREATE INDEX
IF NOT EXISTS "idx_kit_capacity" ON "kit"
("system_capacity_kwp");
CREATE INDEX
IF NOT EXISTS "idx_kit_consumer_class" ON "kit"
("target_consumer_class");
CREATE INDEX
IF NOT EXISTS "idx_kit_code" ON "kit"
("kit_code");
