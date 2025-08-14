import { Migration } from "@mikro-orm/migrations";

export class Migration20250812000100 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "fulfillment_shipping_price" ("id" text not null, "fulfillment_id" text not null, "price" numeric not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "fulfillment_shipping_price_pkey" primary key ("id"));'
    );

    this.addSql(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_fsp_fulfillment_id_unique" ON "fulfillment_shipping_price" (fulfillment_id) WHERE deleted_at IS NULL;'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "fulfillment_shipping_price" cascade;');
  }
} 