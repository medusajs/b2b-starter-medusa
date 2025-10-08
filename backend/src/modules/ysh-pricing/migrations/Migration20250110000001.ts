import { Migration } from "@mikro-orm/migrations";

export class Migration20250110000001 extends Migration {
    async up(): Promise<void> {
        // Create ysh_distributor table
        this.addSql(`
      CREATE TABLE IF NOT EXISTS "ysh_distributor" (
        "id" VARCHAR(255) NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "display_name" TEXT,
        "slug" TEXT NOT NULL UNIQUE,
        "keywords" JSONB,
        "price_markup" NUMERIC(10, 4) NOT NULL DEFAULT 1.15,
        "min_order_value" NUMERIC(10, 2) NOT NULL DEFAULT 0,
        "allowed_companies" JSONB,
        "priority" INTEGER NOT NULL DEFAULT 100,
        "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
        "last_sync_at" TIMESTAMPTZ,
        "default_lead_time_days" INTEGER NOT NULL DEFAULT 7,
        "api_endpoint" TEXT,
        "api_key" TEXT,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

        // Create ysh_distributor_price table
        this.addSql(`
      CREATE TABLE IF NOT EXISTS "ysh_distributor_price" (
        "id" VARCHAR(255) NOT NULL PRIMARY KEY,
        "distributor_id" VARCHAR(255) NOT NULL,
        "variant_id" VARCHAR(255) NOT NULL,
        "variant_external_id" TEXT,
        "base_price" NUMERIC(10, 2) NOT NULL,
        "final_price" NUMERIC(10, 2) NOT NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'BRL',
        "availability" TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock', 'backorder')),
        "qty_available" INTEGER NOT NULL DEFAULT 0,
        "qty_reserved" INTEGER NOT NULL DEFAULT 0,
        "allow_backorder" BOOLEAN NOT NULL DEFAULT FALSE,
        "lead_time_days" INTEGER,
        "min_quantity" INTEGER NOT NULL DEFAULT 1,
        "warehouse_location" TEXT,
        "restock_date" TIMESTAMPTZ,
        "last_updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "is_stale" BOOLEAN NOT NULL DEFAULT FALSE,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_distributor_price_distributor" FOREIGN KEY ("distributor_id") REFERENCES "ysh_distributor"("id") ON DELETE CASCADE
      );
    `);

        // Create indexes for performance
        this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_distributor_price_variant_distributor" 
      ON "ysh_distributor_price" ("variant_id", "distributor_id");
    `);

        this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_distributor_price_variant_external_id" 
      ON "ysh_distributor_price" ("variant_external_id");
    `);

        this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_distributor_price_availability" 
      ON "ysh_distributor_price" ("availability");
    `);

        this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_distributor_price_is_stale" 
      ON "ysh_distributor_price" ("is_stale");
    `);

        // Seed default distributors
        this.addSql(`
      INSERT INTO "ysh_distributor" (
        "id", "name", "display_name", "slug", "keywords", 
        "price_markup", "min_order_value", "priority", "default_lead_time_days"
      ) VALUES
        (
          'dist_neosolar', 'NeoSolar', 'NeoSolar', 'neosolar',
          '["neosolar", "neo solar", "neo_solar"]'::jsonb,
          1.12, 1000, 1, 5
        ),
        (
          'dist_solfacil', 'Solfácil', 'Solfácil', 'solfacil',
          '["solfacil", "solfácil", "sol_facil"]'::jsonb,
          1.10, 800, 2, 7
        ),
        (
          'dist_odex', 'ODEX', 'ODEX Energia', 'odex',
          '["odex"]'::jsonb,
          1.15, 0, 3, 10
        ),
        (
          'dist_fotus', 'FOTUS', 'FOTUS Solar', 'fotus',
          '["fotus"]'::jsonb,
          1.13, 1200, 4, 7
        ),
        (
          'dist_fortlev', 'FortLev', 'FortLev Estruturas', 'fortlev',
          '["fortlev", "fort lev", "fort_lev"]'::jsonb,
          1.08, 0, 5, 14
        )
      ON CONFLICT (slug) DO NOTHING;
    `);
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "ysh_distributor_price" CASCADE;');
        this.addSql('DROP TABLE IF EXISTS "ysh_distributor" CASCADE;');
    }
}
