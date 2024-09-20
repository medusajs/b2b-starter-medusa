import { Migration } from '@mikro-orm/migrations';

export class Migration20240919150244 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "company" ("id" text not null, "name" text not null, "phone" text not null, "email" text not null, "address" text null, "city" text null, "state" text null, "zip" text null, "country" text null, "logo_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "company_pkey" primary key ("id"));');

    this.addSql('create table if not exists "company_customer" ("id" text not null, "spending_limit" numeric not null default null, "is_admin" boolean not null default false, "company_id" text not null, "raw_spending_limit" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "company_customer_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_company_customer_company_id" ON "company_customer" (company_id) WHERE deleted_at IS NULL;');

    this.addSql('alter table if exists "company_customer" add constraint "company_customer_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "company_customer" drop constraint if exists "company_customer_company_id_foreign";');

    this.addSql('drop table if exists "company" cascade;');

    this.addSql('drop table if exists "company_customer" cascade;');
  }

}
