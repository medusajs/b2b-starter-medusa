import { Migration } from "@mikro-orm/migrations";

export class Migration20250107125203 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_quote_deleted_at" ON "quote" (deleted_at) WHERE deleted_at IS NULL;'
    );
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_message_deleted_at" ON "message" (deleted_at) WHERE deleted_at IS NULL;'
    );
  }

  async down(): Promise<void> {
    this.addSql('DROP INDEX IF EXISTS "IDX_quote_deleted_at";');
    this.addSql('DROP INDEX IF EXISTS "IDX_message_deleted_at";');
  }
}
