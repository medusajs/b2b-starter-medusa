import { Migration } from '@mikro-orm/migrations';

export class Migration20250113000001 extends Migration {

  async up(): Promise<void> {
    // Create financing_proposal table
    this.addSql('create table "financing_proposal" ("id" text not null, "customer_id" text not null, "quote_id" text null, "credit_analysis_id" text null, "modality" text not null, "requested_amount" numeric not null, "approved_amount" numeric null, "down_payment_amount" numeric not null default 0, "financed_amount" numeric null, "requested_term_months" integer not null, "approved_term_months" integer null, "interest_rate_monthly" real null, "interest_rate_annual" real null, "cet_rate" real null, "amortization_system" text not null default \'PRICE\', "status" text not null default \'pending\', "approved_at" timestamptz null, "contracted_at" timestamptz null, "cancelled_at" timestamptz null, "expires_at" timestamptz null, "contract_number" text null, "contract_url" text null, "approval_conditions" jsonb null, "rejection_reason" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "financing_proposal_pkey" primary key ("id"));');
    
    // Create payment_schedule table
    this.addSql('create table "payment_schedule" ("id" text not null, "financing_proposal_id" text not null, "installment_number" integer not null, "due_date" timestamptz not null, "principal_amount" numeric not null, "interest_amount" numeric not null, "total_amount" numeric not null, "remaining_balance" numeric not null, "status" text not null default \'pending\', "paid_at" timestamptz null, "paid_amount" numeric null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "payment_schedule_pkey" primary key ("id"));');

    // Add foreign key
    this.addSql('alter table "payment_schedule" add constraint "payment_schedule_financing_proposal_id_foreign" foreign key ("financing_proposal_id") references "financing_proposal" ("id") on update cascade on delete cascade;');

    // Add check constraints
    this.addSql('alter table "financing_proposal" add constraint "CHK_financing_modality" check ("modality" in (\'CDC\', \'LEASING\', \'EAAS\'));');
    this.addSql('alter table "financing_proposal" add constraint "CHK_financing_system" check ("amortization_system" in (\'PRICE\', \'SAC\'));');
    this.addSql('alter table "financing_proposal" add constraint "CHK_financing_status" check ("status" in (\'pending\', \'approved\', \'contracted\', \'cancelled\'));');
    this.addSql('alter table "payment_schedule" add constraint "CHK_payment_status" check ("status" in (\'pending\', \'paid\', \'overdue\', \'cancelled\'));');

    // Create indexes
    this.addSql('create index "IDX_financing_customer" on "financing_proposal" ("customer_id");');
    this.addSql('create index "IDX_financing_status" on "financing_proposal" ("status");');
    this.addSql('create index "IDX_financing_quote" on "financing_proposal" ("quote_id");');
    this.addSql('create unique index "IDX_financing_contract" on "financing_proposal" ("contract_number") where "contract_number" is not null;');
    
    this.addSql('create index "IDX_payment_schedule_proposal" on "payment_schedule" ("financing_proposal_id");');
    this.addSql('create index "IDX_payment_schedule_due_date" on "payment_schedule" ("due_date");');
    this.addSql('create index "IDX_payment_schedule_status" on "payment_schedule" ("status");');
  }

  async down(): Promise<void> {
    // Drop indexes
    this.addSql('drop index "IDX_financing_customer";');
    this.addSql('drop index "IDX_financing_status";');
    this.addSql('drop index "IDX_financing_quote";');
    this.addSql('drop index "IDX_financing_contract";');
    this.addSql('drop index "IDX_payment_schedule_proposal";');
    this.addSql('drop index "IDX_payment_schedule_due_date";');
    this.addSql('drop index "IDX_payment_schedule_status";');

    // Drop constraints
    this.addSql('alter table "financing_proposal" drop constraint "CHK_financing_modality";');
    this.addSql('alter table "financing_proposal" drop constraint "CHK_financing_system";');
    this.addSql('alter table "financing_proposal" drop constraint "CHK_financing_status";');
    this.addSql('alter table "payment_schedule" drop constraint "CHK_payment_status";');

    // Drop foreign key
    this.addSql('alter table "payment_schedule" drop constraint "payment_schedule_financing_proposal_id_foreign";');

    // Drop tables
    this.addSql('drop table "payment_schedule";');
    this.addSql('drop table "financing_proposal";');
  }
}