/**
 * 🗄️ Pact Provider Test DB Setup
 * Seeds database with test data for contract verification
 */

import { DataSource } from "typeorm";

export interface TestDataSeeder {
  seedQuotes(): Promise<void>;
  seedProducts(): Promise<void>;
  cleanup(): Promise<void>;
}

export class PactTestDBSetup implements TestDataSeeder {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async seedQuotes(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Insert test quote
      await queryRunner.query(`
        INSERT INTO quote (id, customer_id, status, total, created_at, updated_at)
        VALUES ('quote_123', 'cus_test', 'pending', 10000, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `);

      // Insert quote items
      await queryRunner.query(`
        INSERT INTO quote_item (id, quote_id, product_id, quantity, unit_price, created_at, updated_at)
        VALUES ('qi_1', 'quote_123', 'prod_panel_1', 10, 1000, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `);

      await queryRunner.commitTransaction();
      console.log("✅ Pact test quotes seeded");
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Failed to seed quotes:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async seedProducts(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Insert test products
      await queryRunner.query(`
        INSERT INTO product (id, title, handle, status, created_at, updated_at)
        VALUES 
          ('prod_panel_1', 'Test Solar Panel 550W', 'test-panel-550w', 'published', NOW(), NOW()),
          ('prod_inverter_1', 'Test Inverter 5kW', 'test-inverter-5kw', 'published', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `);

      // Insert product variants
      await queryRunner.query(`
        INSERT INTO product_variant (id, product_id, title, sku, inventory_quantity, created_at, updated_at)
        VALUES 
          ('var_panel_1', 'prod_panel_1', 'Default', 'PANEL-550W-TEST', 100, NOW(), NOW()),
          ('var_inverter_1', 'prod_inverter_1', 'Default', 'INV-5KW-TEST', 50, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `);

      await queryRunner.commitTransaction();
      console.log("✅ Pact test products seeded");
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Failed to seed products:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cleanup(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Cleanup in reverse order (foreign keys)
      await queryRunner.query(`DELETE FROM quote_item WHERE quote_id = 'quote_123'`);
      await queryRunner.query(`DELETE FROM quote WHERE id = 'quote_123'`);
      await queryRunner.query(`DELETE FROM product_variant WHERE product_id IN ('prod_panel_1', 'prod_inverter_1')`);
      await queryRunner.query(`DELETE FROM product WHERE id IN ('prod_panel_1', 'prod_inverter_1')`);

      await queryRunner.commitTransaction();
      console.log("✅ Pact test data cleaned up");
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Failed to cleanup:", error);
    } finally {
      await queryRunner.release();
    }
  }
}

// Singleton instance
let seederInstance: PactTestDBSetup | null = null;

export function getTestDBSeeder(dataSource: DataSource): PactTestDBSetup {
  if (!seederInstance) {
    seederInstance = new PactTestDBSetup(dataSource);
  }
  return seederInstance;
}
