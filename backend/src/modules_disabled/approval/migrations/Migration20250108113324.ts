import { Migration } from '@mikro-orm/migrations';

export class Migration20250108113324 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "approval_settings" add column if not exists "company_id" text not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "approval_settings" drop column if exists "company_id";');
  }

}
