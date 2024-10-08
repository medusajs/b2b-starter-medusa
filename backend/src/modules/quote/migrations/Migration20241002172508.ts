import { Migration } from "@mikro-orm/migrations";

export class Migration20241002172508 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "quote" drop constraint if exists "quote_status_check";'
    );

    this.addSql(
      'alter table if exists "quote" alter column "status" type text using ("status"::text);'
    );
    this.addSql(
      "alter table if exists \"quote\" add constraint \"quote_status_check\" check (\"status\" in ('pending_merchant', 'pending_customer', 'accepted', 'customer_rejected', 'merchant_rejected'));"
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "quote" drop constraint if exists "quote_status_check";'
    );

    this.addSql(
      'alter table if exists "quote" alter column "status" type text using ("status"::text);'
    );
    this.addSql(
      "alter table if exists \"quote\" add constraint \"quote_status_check\" check (\"status\" in ('pending_merchant', 'pending_customer', 'accepted', 'rejected'));"
    );
  }
}
