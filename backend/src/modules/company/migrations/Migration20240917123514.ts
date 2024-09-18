import { Migration } from '@mikro-orm/migrations';

export class Migration20240917123514 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "company" alter column "address" type text using ("address"::text);');
    this.addSql('alter table if exists "company" alter column "address" drop not null;');
    this.addSql('alter table if exists "company" alter column "city" type text using ("city"::text);');
    this.addSql('alter table if exists "company" alter column "city" drop not null;');
    this.addSql('alter table if exists "company" alter column "state" type text using ("state"::text);');
    this.addSql('alter table if exists "company" alter column "state" drop not null;');
    this.addSql('alter table if exists "company" alter column "zip" type text using ("zip"::text);');
    this.addSql('alter table if exists "company" alter column "zip" drop not null;');
    this.addSql('alter table if exists "company" alter column "country" type text using ("country"::text);');
    this.addSql('alter table if exists "company" alter column "country" drop not null;');
    this.addSql('alter table if exists "company" alter column "logo_url" type text using ("logo_url"::text);');
    this.addSql('alter table if exists "company" alter column "logo_url" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "company" alter column "address" type text using ("address"::text);');
    this.addSql('alter table if exists "company" alter column "address" set not null;');
    this.addSql('alter table if exists "company" alter column "city" type text using ("city"::text);');
    this.addSql('alter table if exists "company" alter column "city" set not null;');
    this.addSql('alter table if exists "company" alter column "state" type text using ("state"::text);');
    this.addSql('alter table if exists "company" alter column "state" set not null;');
    this.addSql('alter table if exists "company" alter column "zip" type text using ("zip"::text);');
    this.addSql('alter table if exists "company" alter column "zip" set not null;');
    this.addSql('alter table if exists "company" alter column "country" type text using ("country"::text);');
    this.addSql('alter table if exists "company" alter column "country" set not null;');
    this.addSql('alter table if exists "company" alter column "logo_url" type text using ("logo_url"::text);');
    this.addSql('alter table if exists "company" alter column "logo_url" set not null;');
  }

}
