import { Migration } from "@mikro-orm/migrations";

export class Migration20241201000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "growth_users" ("id" text not null, "email" text not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "growth_users_pkey" primary key ("id"));'
    );

    this.addSql(
      'create unique index if not exists "growth_users_email_unique" on "growth_users" ("email");'
    );

    this.addSql(
      'create index if not exists "IDX_growth_users_is_active" on "growth_users" ("is_active");'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop index if exists "IDX_growth_users_is_active";');
    this.addSql('drop index if exists "growth_users_email_unique";');
    this.addSql('drop table if exists "growth_users" cascade;');
  }
}
