import { Migration } from '@mikro-orm/migrations';

export class Migration20250113133737 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "approval" ("id" text not null, "cart_id" text not null, "type" text check ("type" in (\'admin\', \'sales_manager\')) not null, "status" text check ("status" in (\'pending\', \'approved\', \'rejected\')) not null, "created_by" text not null, "handled_by" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "approval_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_approval_deleted_at" ON "approval" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "approval" cascade;');
  }

}
