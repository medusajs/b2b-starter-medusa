/**
 * Generic distributor import script for PostgreSQL
 * Imports products from any distributor JSON to ysh_catalog.products
 * Usage: npx tsx scripts/import-generic-distributor-to-db.ts --file=./mcp-servers/solfacil-catalog-full.json --distributor=solfacil
 */

import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Product {
  sku?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  url?: string;
  category?: string;
  brand?: string;
  description?: string;
  specifications?: Record<string, string>;
  images?: string[];
  [key: string]: unknown;
}

interface ExtractionResult {
  distributor?: string;
  products?: Product[];
  totalProducts?: number;
  [key: string]: unknown;
}

async function importDistributor(): Promise<void> {
  // Parse arguments
  const args = process.argv.slice(2);
  let filePath = '';
  let distributorSlug = '';

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      filePath = arg.replace('--file=', '');
    }
    if (arg.startsWith('--distributor=')) {
      distributorSlug = arg.replace('--distributor=', '');
    }
  }

  if (!filePath || !distributorSlug) {
    console.error('Usage: npx tsx import-generic-distributor-to-db.ts --file=path/to/file.json --distributor=slug');
    process.exit(1);
  }

  // Resolve file path
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ysh_db',
    user: 'supabase_admin',
    password: 'your-supabase-password',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    // Load JSON
    console.log(`📖 Loading catalog from: ${resolvedPath}`);
    const fileContent = await fs.readFile(resolvedPath, 'utf-8');
    const data: ExtractionResult = JSON.parse(fileContent);

    const products: Product[] = data.products || (Array.isArray(data) ? data : []);

    if (!products || products.length === 0) {
      console.error('❌ No products found in JSON');
      process.exit(1);
    }

    console.log(`📊 Found ${products.length} products for ${distributorSlug}`);

    // Get or create distributor
    console.log(`🔍 Looking up distributor: ${distributorSlug}`);
    const distributorResult = await pool.query(
      'SELECT id FROM ysh_catalog.distributors WHERE slug = $1',
      [distributorSlug]
    );

    let distributorId = distributorResult.rows[0]?.id;

    if (!distributorId) {
      console.log(`📌 Creating distributor: ${distributorSlug}`);
      const createResult = await pool.query(
        `INSERT INTO ysh_catalog.distributors (name, slug, base_url, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          distributorSlug.charAt(0).toUpperCase() + distributorSlug.slice(1),
          distributorSlug,
          `https://www.${distributorSlug}.com.br`,
          'active',
        ]
      );
      distributorId = createResult.rows[0].id;
      console.log(`✅ Distributor created: ${distributorId}`);
    }

    // Import products
    console.log(`💾 Importing ${products.length} products...`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progressBar = `[${i + 1}/${products.length}] ${((i + 1) / products.length * 100).toFixed(1)}%`;

      try {
        // Generate SKUs
        const distributorSku = product.sku || product.id || product.title?.substring(0, 20) || `PROD-${i}`;
        const yshSku = `${distributorSlug.toUpperCase()}-${distributorSku.toUpperCase().replace(/\s+/g, '-').substring(0, 30)}`;

        // Check if product already exists
        const existsResult = await pool.query(
          'SELECT id FROM ysh_catalog.products WHERE distributor_id = $1 AND distributor_sku = $2',
          [distributorId, distributorSku]
        );

        if (existsResult.rows.length > 0) {
          console.log(`⏭️  ${progressBar} Skipping ${distributorSku} (already exists)`);
          skipped++;
          continue;
        }

        // Map product fields
        const name = product.name || product.title || 'Unnamed Product';
        const category = product.category || 'Geral';
        const brand = product.brand || 'N/A';
        const price = product.price || 0;
        const currency = product.currency || 'BRL';
        const imageUrl = product.imageUrl || product.images?.[0] || '';
        const description = product.description || '';
        const url = product.url || '';

        // Build specification object
        const specifications = {
          ...product.specifications,
          url,
          description,
        };

        // Build raw_data object
        const rawData = {
          ...product,
          extracted_at: new Date().toISOString(),
          source_url: url,
        };

        // Insert product
        const insertResult = await pool.query(
          `INSERT INTO ysh_catalog.products (
            distributor_id, ysh_sku, distributor_sku, name, category, brand,
            price_brl, currency, images, specifications, raw_data, 
            datasheet_url, stock_status, quality_score, enrichment_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id`,
          [
            distributorId,
            yshSku,
            distributorSku,
            name,
            category,
            brand,
            price,
            currency,
            imageUrl ? [imageUrl] : [],
            JSON.stringify(specifications),
            JSON.stringify(rawData),
            url || null,
            'unknown',
            0.5,
            'pending',
          ]
        );

        console.log(`✅ ${progressBar} Imported: ${name}`);
        imported++;
      } catch (error) {
        console.error(`❌ ${progressBar} Error importing product ${i}:`, error instanceof Error ? error.message : error);
        errors++;
      }

      // Progress indicator every 10 products
      if ((i + 1) % 10 === 0) {
        console.log(`   📈 Progress: ${imported} imported, ${skipped} skipped, ${errors} errors`);
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${imported + skipped + errors}/${products.length}`);

    // Verify import
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM ysh_catalog.products WHERE distributor_id = $1',
      [distributorId]
    );

    console.log(`\n🎉 Now has ${countResult.rows[0].total} products in database`);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importDistributor().catch(console.error);
