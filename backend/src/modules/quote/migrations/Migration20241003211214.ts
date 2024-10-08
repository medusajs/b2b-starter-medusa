import { Migration } from "@mikro-orm/migrations";

export class Migration20241003211214 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "comment" add column if not exists "admin_id" text null, add column if not exists "customer_id" text null;'
    );

    this.addSql(
      'alter table if exists "comment" drop column if exists "user_id";'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "comment" add column if not exists "user_id" text not null;'
    );

    this.addSql(
      'alter table if exists "comment" drop column if exists "admin_id";'
    );

    this.addSql(
      'alter table if exists "comment" drop column if exists "customer_id";'
    );
  }
}
