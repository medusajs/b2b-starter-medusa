import { Migration } from "@mikro-orm/migrations";

export class Migration20240930144912 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "company" ("id" text not null, "name" text not null, "phone" text not null, "email" text not null, "address" text null, "city" text null, "state" text null, "zip" text null, "country" text null, "logo_url" text null, "currency_code" text null, "spending_limit_reset_frequency" text check ("spending_limit_reset_frequency" in (\'never\', \'daily\', \'weekly\', \'monthly\', \'yearly\')) not null default \'monthly\', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "company_pkey" primary key ("id"));'
    );

    this.addSql(
      'create table if not exists "employee" ("id" text not null, "spending_limit" numeric not null default 0, "spend_since_reset" numeric not null default 0, "is_admin" boolean not null default false, "company_id" text not null, "raw_spending_limit" jsonb not null, "raw_spend_since_reset" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "employee_pkey" primary key ("id"));'
    );
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_employee_company_id" ON "employee" (company_id) WHERE deleted_at IS NULL;'
    );

    this.addSql(
      'alter table if exists "employee" add constraint "employee_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "employee" drop constraint if exists "employee_company_id_foreign";'
    );

    this.addSql('drop table if exists "company" cascade;');

    this.addSql('drop table if exists "employee" cascade;');
  }
}
