import { Migration } from "@mikro-orm/migrations";

export class Migration20241003204917 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "comment" ("id" text not null, "text" text not null, "item_id" text null, "user_id" text not null, "quote_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "comment_pkey" primary key ("id"));'
    );
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_comment_quote_id" ON "comment" (quote_id) WHERE deleted_at IS NULL;'
    );

    this.addSql(
      'alter table if exists "comment" add constraint "comment_quote_id_foreign" foreign key ("quote_id") references "quote" ("id") on update cascade;'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "comment" cascade;');

    this.addSql(
      'alter table if exists "quote" drop constraint if exists "quote_status_check";'
    );

    this.addSql(
      'alter table if exists "quote" alter column "status" type text using ("status"::text);'
    );
  }
}
