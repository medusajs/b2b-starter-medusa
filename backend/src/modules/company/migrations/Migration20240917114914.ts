import { Migration } from '@mikro-orm/migrations';

export class Migration20240917114914 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "company" ("id" text not null, "name" text not null, "phone" text not null, "email" text not null, "address" text not null, "city" text not null, "state" text not null, "zip" text not null, "country" text not null, "logo_url" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "company_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "company" cascade;');
  }

}
