import { Migration } from "@mikro-orm/migrations";

export class Migration20240930213427 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      "alter table if exists \"quote\" add column if not exists \"status\" text check (\"status\" in ('pending_merchant', 'pending_customer', 'accepted', 'rejected')) not null default 'pending_merchant';"
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "quote" drop column if exists "status";'
    );
  }
}
