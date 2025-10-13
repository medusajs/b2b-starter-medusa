import { Migration } from '@mikro-orm/migrations';

export class Migration20250113000001 extends Migration {

  async up(): Promise<void> {
    // Add new fields to company table
    this.addSql('alter table "company" add column "cnpj" text not null;');
    this.addSql('alter table "company" add column "email_domain" text not null;');
    this.addSql('alter table "company" add column "customer_group_id" text null;');
    this.addSql('alter table "company" add column "is_active" boolean not null default true;');
    
    // Update existing columns with defaults
    this.addSql('alter table "company" alter column "country" set default \'BR\';');
    this.addSql('alter table "company" alter column "currency_code" set default \'BRL\';');
    
    // Add unique constraint on CNPJ
    this.addSql('create unique index "IDX_company_cnpj" on "company" ("cnpj");');
    this.addSql('create index "IDX_company_email_domain" on "company" ("email_domain");');
    this.addSql('create index "IDX_company_customer_group" on "company" ("customer_group_id");');

    // Add new fields to employee table
    this.addSql('alter table "employee" add column "customer_id" text not null;');
    this.addSql('alter table "employee" add column "role" text not null default \'buyer\';');
    this.addSql('alter table "employee" add column "is_active" boolean not null default true;');
    
    // Add constraints for employee
    this.addSql('create unique index "IDX_employee_customer" on "employee" ("customer_id");');
    this.addSql('create index "IDX_employee_company_role" on "employee" ("company_id", "role");');
    
    // Add check constraint for role enum
    this.addSql('alter table "employee" add constraint "CHK_employee_role" check ("role" in (\'admin\', \'manager\', \'buyer\', \'viewer\'));');
  }

  async down(): Promise<void> {
    // Remove constraints and indexes
    this.addSql('drop index "IDX_company_cnpj";');
    this.addSql('drop index "IDX_company_email_domain";');
    this.addSql('drop index "IDX_company_customer_group";');
    this.addSql('drop index "IDX_employee_customer";');
    this.addSql('drop index "IDX_employee_company_role";');
    this.addSql('alter table "employee" drop constraint "CHK_employee_role";');
    
    // Remove new columns
    this.addSql('alter table "company" drop column "cnpj";');
    this.addSql('alter table "company" drop column "email_domain";');
    this.addSql('alter table "company" drop column "customer_group_id";');
    this.addSql('alter table "company" drop column "is_active";');
    
    this.addSql('alter table "employee" drop column "customer_id";');
    this.addSql('alter table "employee" drop column "role";');
    this.addSql('alter table "employee" drop column "is_active";');
    
    // Reset defaults
    this.addSql('alter table "company" alter column "country" drop default;');
    this.addSql('alter table "company" alter column "currency_code" drop default;');
  }
}