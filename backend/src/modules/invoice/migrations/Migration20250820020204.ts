import { Migration } from '@mikro-orm/migrations';

export class Migration20250820020204 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS fulfillment_invoice (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fulfillment_id TEXT NOT NULL UNIQUE REFERENCES fulfillment(id) ON DELETE CASCADE,
          invoice_url TEXT NOT NULL,
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS idx_fulfillment_invoice_fulfillment_id ON fulfillment_invoice(fulfillment_id);
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS idx_fulfillment_invoice_generated_at ON fulfillment_invoice(generated_at);
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP INDEX IF EXISTS idx_fulfillment_invoice_generated_at;');
    this.addSql('DROP INDEX IF EXISTS idx_fulfillment_invoice_fulfillment_id;');
    this.addSql('DROP TABLE IF EXISTS fulfillment_invoice;');
  }

}
