import { Migration } from '@mikro-orm/migrations';

export class Migration20250107125144 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "approval_settings" ("id" text not null, "requires_admin_approval" boolean not null default false, "requires_sales_manager_approval" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "approval_settings_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_approval_settings_deleted_at" ON "approval_settings" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "approval_settings" cascade;');
  }

}
