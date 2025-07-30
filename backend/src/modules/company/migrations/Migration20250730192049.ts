import { Migration } from '@mikro-orm/migrations';

export class Migration20250730192049 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "company_address" ("id" text not null, "label" text not null, "address_1" text not null, "address_2" text null, "city" text not null, "province" text null, "postal_code" text not null, "country_code" text not null, "phone" text null, "is_default" boolean not null default false, "company_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "company_address_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_company_address_company_id" ON "company_address" (company_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_company_address_deleted_at" ON "company_address" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "company_address" add constraint "company_address_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "company_address" cascade;`);
  }

}
