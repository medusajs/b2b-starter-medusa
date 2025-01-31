import { Migration } from '@mikro-orm/migrations';

export class Migration20250130105122 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "approval_status" ("id" text not null, "cart_id" text not null, "status" text check ("status" in (\'pending\', \'approved\', \'rejected\')) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "approval_status_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_approval_status_deleted_at" ON "approval_status" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "approval_status" cascade;');
  }

}
