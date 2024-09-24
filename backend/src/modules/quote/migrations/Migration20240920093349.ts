import { Migration } from "@mikro-orm/migrations";

export class Migration20240920093349 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "quote" ("id" text not null, "draft_order_id" text not null, "cart_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_pkey" primary key ("id"));'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "quote" cascade;');
  }
}
