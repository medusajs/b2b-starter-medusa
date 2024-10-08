import { Migration } from "@mikro-orm/migrations";

export class Migration20240930213517 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "quote" add column if not exists "customer_id" text not null;'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "quote" drop column if exists "customer_id";'
    );
  }
}
