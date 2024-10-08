import { Migration } from "@mikro-orm/migrations";

export class Migration20241008112646 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "message" ("id" text not null, "text" text not null, "item_id" text null, "admin_id" text null, "customer_id" text null, "quote_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "message_pkey" primary key ("id"));'
    );
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_message_quote_id" ON "message" (quote_id) WHERE deleted_at IS NULL;'
    );

    this.addSql(
      'alter table if exists "message" add constraint "message_quote_id_foreign" foreign key ("quote_id") references "quote" ("id") on update cascade;'
    );

    this.addSql('drop table if exists "comment" cascade;');
  }

  async down(): Promise<void> {
    this.addSql(
      'create table if not exists "comment" ("id" text not null, "text" text not null, "item_id" text null, "admin_id" text null, "customer_id" text null, "quote_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "comment_pkey" primary key ("id"));'
    );
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_comment_quote_id" ON "comment" (quote_id) WHERE deleted_at IS NULL;'
    );

    this.addSql(
      'alter table if exists "comment" add constraint "comment_quote_id_foreign" foreign key ("quote_id") references "quote" ("id") on update cascade;'
    );

    this.addSql('drop table if exists "message" cascade;');
  }
}
