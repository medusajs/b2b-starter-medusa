import { Migration } from '@mikro-orm/migrations';

export class Migration20251012000001 extends Migration {

  async up(): Promise<void> {
    // Create manufacturer table
    this.addSql(`create table if not exists "manufacturer" (
      "id" text not null,
      "name" text not null,
      "slug" text not null,
      "tier" text not null default 'UNKNOWN',
      "country" text null,
      "website" text null,
      "logo_url" text null,
      "description" text null,
      "aliases" jsonb null,
      "product_count" integer not null default 0,
      "avg_rating" numeric null,
      "is_active" boolean not null default true,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "manufacturer_pkey" primary key ("id")
    );`);
    
    // Create indexes for manufacturer
    this.addSql('create unique index "IDX_manufacturer_slug" on "manufacturer" ("slug");');
    this.addSql('create index "IDX_manufacturer_tier" on "manufacturer" ("tier");');
    this.addSql('create index "IDX_manufacturer_country" on "manufacturer" ("country");');
    
    // Add check constraint for tier enum
    this.addSql('alter table "manufacturer" add constraint "CHK_manufacturer_tier" check ("tier" in (\'TIER_1\', \'TIER_2\', \'TIER_3\', \'UNKNOWN\'));');

    // Create sku table
    this.addSql(`create table if not exists "sku" (
      "id" text not null,
      "sku_code" text not null,
      "manufacturer_id" text not null,
      "category" text not null,
      "model_number" text not null,
      "name" text not null,
      "description" text null,
      "technical_specs" jsonb not null,
      "compatibility_tags" jsonb null,
      "lowest_price" numeric null,
      "highest_price" numeric null,
      "average_price" numeric null,
      "median_price" numeric null,
      "price_variation_pct" numeric null,
      "image_urls" jsonb null,
      "datasheet_url" text null,
      "certification_labels" jsonb null,
      "warranty_years" integer null,
      "search_keywords" jsonb null,
      "total_offers" integer not null default 0,
      "is_active" boolean not null default true,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "sku_pkey" primary key ("id")
    );`);
    
    // Create indexes for sku
    this.addSql('create unique index "IDX_sku_code" on "sku" ("sku_code");');
    this.addSql('create index "IDX_sku_category" on "sku" ("category");');
    this.addSql('create index "IDX_sku_manufacturer" on "sku" ("manufacturer_id");');
    this.addSql('create index "IDX_sku_category_manufacturer" on "sku" ("category", "manufacturer_id");');
    this.addSql('create index "IDX_sku_price_range" on "sku" ("lowest_price", "highest_price");');
    
    // Add check constraint for category enum
    this.addSql('alter table "sku" add constraint "CHK_sku_category" check ("category" in (\'panels\', \'inverters\', \'batteries\', \'charge_controllers\', \'cables\', \'connectors\', \'structures\', \'accessories\', \'kits\', \'monitoring\', \'protection\', \'other\'));');
    
    // Add foreign key
    this.addSql('alter table "sku" add constraint "sku_manufacturer_id_foreign" foreign key ("manufacturer_id") references "manufacturer" ("id") on update cascade on delete cascade;');

    // Create distributor_offer table
    this.addSql(`create table if not exists "distributor_offer" (
      "id" text not null,
      "sku_id" text not null,
      "distributor_name" text not null,
      "distributor_slug" text not null,
      "price" numeric not null,
      "original_price" numeric null,
      "discount_pct" numeric null,
      "stock_quantity" integer null,
      "stock_status" text not null default 'unknown',
      "lead_time_days" integer null,
      "source_id" text not null,
      "source_url" text null,
      "last_updated_at" timestamptz not null,
      "distributor_rating" numeric null,
      "min_order_quantity" integer not null default 1,
      "shipping_cost" numeric null,
      "free_shipping_threshold" numeric null,
      "conditions" text null,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "distributor_offer_pkey" primary key ("id")
    );`);
    
    // Create indexes for distributor_offer
    this.addSql('create index "IDX_offer_sku" on "distributor_offer" ("sku_id");');
    this.addSql('create index "IDX_offer_distributor" on "distributor_offer" ("distributor_slug");');
    this.addSql('create unique index "IDX_offer_sku_distributor" on "distributor_offer" ("sku_id", "distributor_slug");');
    this.addSql('create index "IDX_offer_price" on "distributor_offer" ("price");');
    this.addSql('create index "IDX_offer_stock_status" on "distributor_offer" ("stock_status");');
    
    // Add check constraint for stock_status enum
    this.addSql('alter table "distributor_offer" add constraint "CHK_offer_stock_status" check ("stock_status" in (\'in_stock\', \'low_stock\', \'out_of_stock\', \'unknown\'));');
    
    // Add foreign key
    this.addSql('alter table "distributor_offer" add constraint "distributor_offer_sku_id_foreign" foreign key ("sku_id") references "sku" ("id") on update cascade on delete cascade;');

    // Create kit table
    this.addSql(`create table if not exists "kit" (
      "id" text not null,
      "kit_code" text not null,
      "name" text not null,
      "category" text not null,
      "system_capacity_kwp" numeric not null,
      "voltage" text null,
      "phase" text null,
      "components" jsonb not null,
      "total_components_price" numeric null,
      "kit_price" numeric null,
      "discount_amount" numeric null,
      "discount_pct" numeric null,
      "kit_offers" jsonb null,
      "description" text null,
      "image_url" text null,
      "installation_complexity" text not null default 'medium',
      "estimated_installation_hours" integer null,
      "target_consumer_class" text null,
      "monthly_consumption_kwh_min" numeric null,
      "monthly_consumption_kwh_max" numeric null,
      "mapping_confidence_avg" numeric null,
      "is_active" boolean not null default true,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "kit_pkey" primary key ("id")
    );`);
    
    // Create indexes for kit
    this.addSql('create unique index "IDX_kit_code" on "kit" ("kit_code");');
    this.addSql('create index "IDX_kit_category" on "kit" ("category");');
    this.addSql('create index "IDX_kit_capacity" on "kit" ("system_capacity_kwp");');
    this.addSql('create index "IDX_kit_target_class" on "kit" ("target_consumer_class");');
    this.addSql('create index "IDX_kit_consumption_range" on "kit" ("monthly_consumption_kwh_min", "monthly_consumption_kwh_max");');
    
    // Add check constraints for enums
    this.addSql('alter table "kit" add constraint "CHK_kit_category" check ("category" in (\'grid-tie\', \'off-grid\', \'hybrid\', \'backup\', \'commercial\', \'residential\'));');
    this.addSql('alter table "kit" add constraint "CHK_kit_complexity" check ("installation_complexity" in (\'easy\', \'medium\', \'hard\'));');
    this.addSql('alter table "kit" add constraint "CHK_kit_consumer_class" check ("target_consumer_class" in (\'residential\', \'commercial\', \'industrial\', \'rural\', \'public\'));');
  }

  async down(): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    this.addSql('drop table if exists "kit" cascade;');
    this.addSql('drop table if exists "distributor_offer" cascade;');
    this.addSql('drop table if exists "sku" cascade;');
    this.addSql('drop table if exists "manufacturer" cascade;');
  }
}
