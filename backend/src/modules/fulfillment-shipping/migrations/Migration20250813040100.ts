import { Migration } from "@mikro-orm/migrations";

export class Migration20250813040100 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "fulfillment_shipping_price" add column if not exists "raw_price" jsonb not null;'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "fulfillment_shipping_price" drop column if exists "raw_price";'
    );
  }
}


