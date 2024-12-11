import { Migration } from "@mikro-orm/migrations";

export class Migration20241001085304 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "employee" drop column if exists "spend_since_reset";'
    );
    this.addSql(
      'alter table if exists "employee" drop column if exists "raw_spend_since_reset";'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "employee" add column if not exists "spend_since_reset" numeric not null default 0, add column if not exists "raw_spend_since_reset" jsonb not null;'
    );
  }
}
