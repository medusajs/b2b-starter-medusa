import { Migration } from '@mikro-orm/migrations';

export class Migration20250731150302 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "company_address" add column if not exists "firstName" text null, add column if not exists "lastName" text null, add column if not exists "companyName" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "company_address" drop column if exists "firstName", drop column if exists "lastName", drop column if exists "companyName";`);
  }

}
