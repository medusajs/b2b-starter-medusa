#!/usr/bin/env node
/**
 * Import Catalog to AWS RDS (Production)
 * Usage: node scripts/import-catalog-to-rds.js [--dry-run]
 */

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RDS_CONFIG = {
  host: '127.0.0.1',
  port: 59588,
  user: 'supabase_admin',
  password: 'po5lwIAe_kKb5Ham0nPr2qeah2CGDNys',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const CATALOG_FILE = path.resolve(__dirname, '../static/products/products-fully-priced-catalog.json');
const BATCH_SIZE = 100;
const DRY_RUN = process.argv.includes('--dry-run');

const pool = new Pool(RDS_CONFIG);

async function importCatalog() {
  console.log('🔌 Conectando ao RDS de Produção...');
  console.log(`📍 Host: ${RDS_CONFIG.host}:${RDS_CONFIG.port}`);
  console.log(`🗄️  Database: ${RDS_CONFIG.database}`);
  console.log(`🔧 Mode: ${DRY_RUN ? 'DRY RUN' : 'PRODUCTION'}\n`);

  // Load catalog
  console.log(`📂 Carregando catálogo: ${path.basename(CATALOG_FILE)}`);
  const catalogData = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
  const products = catalogData.products || [];
  console.log(`📦 Total produtos: ${products.length}\n`);

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - Nenhuma alteração será feita\n');
    console.log(`✅ Catálogo carregado com sucesso`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - Total: ${products.length} produtos`);
    console.log(`   - Categorias: ${new Set(products.map(p => p.category)).size}`);
    console.log(`   - Fabricantes: ${new Set(products.map(p => p.manufacturer)).size}`);
    return;
  }

  // Test connection
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Conexão estabelecida: ${result.rows[0].now}\n`);
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }

  // Import in batches
  console.log(`📥 Importando ${products.length} produtos em lotes de ${BATCH_SIZE}...\n`);
  
  let imported = 0;
  let errors = 0;
  const errorDetails = [];

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    console.log(`📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)} (${batch.length} produtos)...`);

    for (const product of batch) {
      try {
        const client = await pool.connect();
        try {
          await client.query(
            `INSERT INTO catalog (
              sku, filename, category, manufacturer, model,
              power_w, power_kw, power_kwp, voltage_v, current_a,
              price_brl, price_source, price_confidence,
              image_url, dimensions_mm, weight_kg,
              efficiency_percent, warranty_years, certifications,
              description, structure_type, is_active, cdn_published
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10,
              $11, $12, $13,
              $14, $15, $16,
              $17, $18, $19,
              $20, $21, $22, $23
            )
            ON CONFLICT (sku) DO UPDATE SET
              price_brl = EXCLUDED.price_brl,
              image_url = EXCLUDED.image_url,
              cdn_published = EXCLUDED.cdn_published,
              updated_at = NOW()
            `,
            [
              product.sku,
              product.filename || product.sku,
              product.category,
              product.manufacturer || 'UNKNOWN',
              product.model || product.name || 'N/A',
              product.power_w || null,
              product.power_kw || null,
              product.power_kwp || null,
              product.voltage_v || null,
              product.current_a || null,
              product.price_brl || null,
              ['direct', 'similar', 'estimated'].includes(product.price_source) ? product.price_source : 'estimated',
              product.price_confidence || 0.5,
              product.image_cdn_url || product.image_url || null,
              product.dimensions_mm ? (typeof product.dimensions_mm === 'string' ? product.dimensions_mm : JSON.stringify(product.dimensions_mm)) : null,
              product.weight_kg || null,
              product.efficiency_percent || null,
              product.warranty_years || null,
              product.certifications ? (typeof product.certifications === 'string' ? product.certifications : JSON.stringify(product.certifications)) : null,
              product.description || null,
              product.kit_structure_type || product.structure_type || null,
              true, // is_active
              true, // cdn_published
            ]
          );
          imported++;
        } finally {
          client.release();
        }
      } catch (error) {
        errors++;
        errorDetails.push({
          sku: product.sku,
          error: error.message,
        });
      }
    }
  }

  console.log('\n📊 Resumo da Importação:');
  console.log(`   ✅ Importados: ${imported} produtos`);
  console.log(`   ❌ Erros: ${errors} produtos`);
  console.log(`   📈 Taxa de sucesso: ${((imported / products.length) * 100).toFixed(1)}%\n`);

  if (errors > 0 && errorDetails.length > 0) {
    console.log('⚠️  Erros detalhados (primeiros 10):');
    errorDetails.slice(0, 10).forEach(({ sku, error }) => {
      console.log(`   - ${sku}: ${error}`);
    });
    console.log();
  }

  // Validate import
  const statsResult = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT category) as categories,
      COUNT(DISTINCT manufacturer) as manufacturers,
      ROUND(SUM(COALESCE(price_brl, 0))::numeric, 2) as total_value
    FROM catalog
  `);

  console.log('✅ Validação do banco:');
  console.log(`   📦 Total produtos: ${statsResult.rows[0].total}`);
  console.log(`   🏷️  Categorias: ${statsResult.rows[0].categories}`);
  console.log(`   🏭 Fabricantes: ${statsResult.rows[0].manufacturers}`);
  console.log(`   💰 Valor total: R$ ${Number(statsResult.rows[0].total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

  console.log('🎉 Importação para RDS de Produção concluída!');
}

importCatalog()
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
