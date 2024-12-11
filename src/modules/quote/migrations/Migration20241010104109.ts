import { Migration } from "@mikro-orm/migrations";

export class Migration20241010104109 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "quote" ("id" text not null, "status" text check ("status" in (\'pending_merchant\', \'pending_customer\', \'accepted\', \'customer_rejected\', \'merchant_rejected\')) not null default \'pending_merchant\', "customer_id" text not null, "draft_order_id" text not null, "order_change_id" text not null, "cart_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_pkey" primary key ("id"));'
    );

    this.addSql(
      'create table if not exists "message" ("id" text not null, "text" text not null, "item_id" text null, "admin_id" text null, "customer_id" text null, "quote_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "message_pkey" primary key ("id"));'
    );
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_message_quote_id" ON "message" (quote_id) WHERE deleted_at IS NULL;'
    );

    this.addSql(
      'alter table if exists "message" add constraint "message_quote_id_foreign" foreign key ("quote_id") references "quote" ("id") on update cascade;'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "message" drop constraint if exists "message_quote_id_foreign";'
    );

    this.addSql('drop table if exists "quote" cascade;');

    this.addSql('drop table if exists "message" cascade;');
  }
}
