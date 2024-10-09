import { Migration } from "@mikro-orm/migrations";

export class Migration20240924092256 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "quote" add column if not exists "order_change_id" text not null;'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "quote" drop column if exists "order_change_id";'
    );
  }
}
