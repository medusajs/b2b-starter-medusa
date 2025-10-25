import { Migration } from '@mikro-orm/migrations';

export class Migration20250113000001 extends Migration {

  async up(): Promise<void> {
    // Create solar_calculation table
    this.addSql(`
      CREATE TABLE "solar_calculation" (
        "id" varchar(255) NOT NULL,
        "consumo_kwh_mes" numeric NOT NULL,
        "uf" varchar(2) NOT NULL,
        "cep" varchar(10),
        "tipo_telhado" varchar(20),
        "area_disponivel_m2" numeric,
        "oversizing_target" numeric NOT NULL DEFAULT 130,
        "kwp_necessario" numeric NOT NULL,
        "kwp_proposto" numeric NOT NULL,
        "numero_paineis" integer NOT NULL,
        "potencia_inversor_kw" numeric NOT NULL,
        "area_necessaria_m2" numeric NOT NULL,
        "geracao_anual_kwh" numeric NOT NULL,
        "capex_total_brl" numeric NOT NULL,
        "economia_anual_brl" numeric NOT NULL,
        "payback_anos" numeric NOT NULL,
        "tir_percentual" numeric NOT NULL,
        "vpl_brl" numeric NOT NULL,
        "co2_evitado_ton_25anos" numeric NOT NULL,
        "calculation_hash" varchar(16) NOT NULL UNIQUE,
        "created_by" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "solar_calculation_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create solar_calculation_kit table
    this.addSql(`
      CREATE TABLE "solar_calculation_kit" (
        "id" varchar(255) NOT NULL,
        "solar_calculation_id" varchar(255) NOT NULL,
        "kit_id" varchar(255) NOT NULL,
        "nome" varchar(255) NOT NULL,
        "potencia_kwp" numeric NOT NULL,
        "match_score" numeric NOT NULL,
        "preco_brl" numeric NOT NULL,
        "componentes" jsonb NOT NULL,
        "disponibilidade" jsonb NOT NULL,
        "ranking_position" integer NOT NULL DEFAULT 1,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "solar_calculation_kit_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create indexes for performance
    this.addSql(`CREATE UNIQUE INDEX "IDX_solar_calculation_hash" ON "solar_calculation" ("calculation_hash");`);
    this.addSql(`CREATE INDEX "IDX_solar_calculation_kwp" ON "solar_calculation" ("kwp_proposto");`);
    this.addSql(`CREATE INDEX "IDX_solar_calculation_uf" ON "solar_calculation" ("uf");`);
    this.addSql(`CREATE INDEX "IDX_solar_calculation_created_at" ON "solar_calculation" ("created_at");`);
    
    this.addSql(`CREATE INDEX "IDX_solar_kit_calculation" ON "solar_calculation_kit" ("solar_calculation_id");`);
    this.addSql(`CREATE INDEX "IDX_solar_kit_score" ON "solar_calculation_kit" ("match_score");`);
    this.addSql(`CREATE INDEX "IDX_solar_kit_kwp" ON "solar_calculation_kit" ("potencia_kwp");`);
    this.addSql(`CREATE INDEX "IDX_solar_kit_ranking" ON "solar_calculation_kit" ("ranking_position");`);

    // Add foreign key constraint
    this.addSql(`
      ALTER TABLE "solar_calculation_kit" 
      ADD CONSTRAINT "FK_solar_kit_calculation" 
      FOREIGN KEY ("solar_calculation_id") 
      REFERENCES "solar_calculation" ("id") 
      ON DELETE CASCADE;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "solar_calculation_kit";`);
    this.addSql(`DROP TABLE IF EXISTS "solar_calculation";`);
  }
}