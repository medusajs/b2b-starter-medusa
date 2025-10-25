#!/usr/bin/env node
/**
 * Script de Importação do Catálogo CDN para Banco de Dados
 * 
 * Importa products-fully-priced-catalog.json para a tabela catalog do PostgreSQL
 * Com validação completa e relatório de erros
 * 
 * Uso:
 *   node scripts/import-catalog-to-db.js
 *   node scripts/import-catalog-to-db.js --dry-run
 *   node scripts/import-catalog-to-db.js --skip-validation
 * 
 * @requires pg
 * @requires dotenv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CATALOG_FILE = path.join(__dirname, '../static/products/products-fully-priced-catalog.json');
const BATCH_SIZE = 100; // Inserir produtos em lotes de 100

const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL || 'postgresql://supabase_admin:postgres@localhost:5432/medusa-backend',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// ============================================================================
// FLAGS DE LINHA DE COMANDO
// ============================================================================

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_VALIDATION = args.includes('--skip-validation');
const VERBOSE = args.includes('--verbose');

// ============================================================================
// LOGGING
// ============================================================================

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    debug: '→',
  }[level] || '•';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function verbose(message) {
  if (VERBOSE) {
    log(message, 'debug');
  }
}

// ============================================================================
// VALIDAÇÕES
// ============================================================================

/**
 * Valida campos obrigatórios
 */
function validateRequiredFields(product) {
  const errors = [];

  if (!product.sku || product.sku.trim() === '') {
    errors.push('SKU ausente');
  }

  if (!product.filename || product.filename.trim() === '') {
    errors.push('Filename ausente');
  }

  if (!product.category || product.category.trim() === '') {
    errors.push('Categoria ausente');
  }

  if (!product.image_url || product.image_url.trim() === '') {
    errors.push('Image URL ausente');
  }

  if (!product.price_brl || product.price_brl <= 0) {
    errors.push(`Preço inválido: ${product.price_brl}`);
  }

  return errors;
}

/**
 * Valida campos por categoria
 */
function validateCategoryFields(product) {
  const warnings = [];

  switch (product.category) {
    case 'inversores':
      if (!product.power_kw && !product.power_w) {
        warnings.push('Inversor sem potência definida');
      }
      break;

    case 'kits':
      if (!product.power_kwp) {
        warnings.push('Kit sem potência (kWp) definida');
      }
      break;

    case 'paineis':
      if (!product.power_w) {
        warnings.push('Painel sem potência (W) definida');
      }
      break;

    case 'baterias':
      if (!product.capacity_kwh && !product.capacity_ah) {
        warnings.push('Bateria sem capacidade definida');
      }
      break;
  }

  return warnings;
}

/**
 * Valida produto completo
 */
function validateProduct(product, index) {
  const errors = validateRequiredFields(product);
  const warnings = SKIP_VALIDATION ? [] : validateCategoryFields(product);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sku: product.sku || `UNKNOWN_${index}`,
  };
}

// ============================================================================
// TRANSFORMAÇÕES
// ============================================================================

/**
 * Transforma produto do JSON para formato do banco
 */
function transformProduct(product) {
  return {
    // Identificadores
    sku: product.sku,
    filename: product.filename,
    category: product.category,

    // URLs e publicação
    image_url: product.image_url,
    cdn_published: true, // Todos do catálogo estão publicados

    // Pricing
    price_brl: product.price_brl,
    price_source: product.pricing_method || 'estimated',
    price_confidence: product.confidence_score || 0.4,

    // Identificação
    manufacturer: product.manufacturer || null,
    model: product.model || null,
    distributor: product.distributor || null,

    // Potência
    power_w: product.power_w || null,
    power_kw: product.power_kw || null,
    power_kwp: product.power_kwp || null,

    // Especificações elétricas
    voltage_v: product.voltage_v || null,
    phase: product.phase || null,
    current_a: product.current_a || null,
    mppt_count: product.mppt_count || null,
    efficiency_percent: product.efficiency_percent || null,

    // Kits solares
    structure_type: product.structure_type || null,
    system_type: product.system_type || null,
    price_per_kwp: product.price_per_kwp || null,
    price_per_wp: product.price_per_wp || null,
    estimated_generation_kwh_month: product.estimated_generation_kwh_month || null,

    // Painéis
    cell_type: product.cell_type || null,
    dimensions_mm: product.dimensions_mm || null,
    weight_kg: product.weight_kg || null,

    // Baterias
    technology: product.technology || null,
    capacity_kwh: product.capacity_kwh || null,
    capacity_ah: product.capacity_ah || null,
    cycle_life: product.cycle_life || null,
    dod_percent: product.dod_percent || null,
    form_factor: product.form_factor || null,

    // Estruturas
    roof_type: product.roof_type || null,
    size: product.size || null,
    material: product.material || null,
    max_panels: product.max_panels || null,

    // String boxes
    input_count: product.input_count || null,
    output_count: product.output_count || null,
    voltage_rating: product.voltage_rating || null,
    current_rating: product.current_rating || null,
    protection_type: product.protection_type || null,

    // Cabos
    gauge_mm2: product.gauge_mm2 || null,
    cable_color: product.color || null,
    cable_length_m: product.length_m || null,
    cable_type: product.type || null,

    // Controladores
    controller_type: product.controller_type || null,
    voltage_system: product.voltage_system || null,

    // Carregadores
    connector_type: product.connector_type || null,

    // Metadados
    warranty_years: product.warranty_years || null,
    size_bytes: product.size_bytes || null,
    description: product.description || null,

    // Status
    is_active: true,
    out_of_stock: false,
    featured: false,
  };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Cria query de INSERT para produto
 */
function buildInsertQuery(product) {
  const columns = Object.keys(product);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(product);

  const query = `
    INSERT INTO catalog (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (sku) DO UPDATE SET
      ${columns.map((col, i) => `${col} = $${i + 1}`).join(', ')},
      updated_at = CURRENT_TIMESTAMP
  `;

  return { query, values };
}

/**
 * Insere produtos em lote
 */
async function insertBatch(pool, products) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const results = {
      inserted: 0,
      updated: 0,
      errors: 0,
    };

    for (const product of products) {
      try {
        const { query, values } = buildInsertQuery(product);
        await client.query(query, values);
        results.inserted++;
      } catch (error) {
        results.errors++;
        log(`Erro ao inserir ${product.sku}: ${error.message}`, 'error');
        verbose(JSON.stringify(product, null, 2));
      }
    }

    await client.query('COMMIT');
    return results;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n📦 Importação do Catálogo CDN AWS → PostgreSQL\n');
  console.log('═══════════════════════════════════════════════════\n');

  if (DRY_RUN) {
    log('Modo DRY RUN - nenhum dado será inserido', 'warn');
  }

  if (SKIP_VALIDATION) {
    log('Validação de categoria DESABILITADA', 'warn');
  }

  // ============================================================================
  // 1. CARREGAR ARQUIVO JSON
  // ============================================================================

  log('Carregando catálogo...');
  
  if (!fs.existsSync(CATALOG_FILE)) {
    log(`Arquivo não encontrado: ${CATALOG_FILE}`, 'error');
    process.exit(1);
  }

  const catalogData = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8'));
  const products = catalogData.products || [];

  log(`${products.length} produtos carregados do JSON`);
  console.log('');

  // ============================================================================
  // 2. VALIDAR PRODUTOS
  // ============================================================================

  log('Validando produtos...');

  const validationResults = products.map((product, index) => ({
    product,
    validation: validateProduct(product, index),
  }));

  const valid = validationResults.filter(r => r.validation.valid);
  const invalid = validationResults.filter(r => !r.validation.valid);
  const withWarnings = validationResults.filter(r => r.validation.warnings.length > 0);

  log(`${valid.length} produtos válidos`);
  
  if (invalid.length > 0) {
    log(`${invalid.length} produtos com erros críticos`, 'error');
    
    if (VERBOSE) {
      invalid.slice(0, 10).forEach(({ product, validation }) => {
        log(`  ${validation.sku}: ${validation.errors.join(', ')}`, 'error');
      });
      
      if (invalid.length > 10) {
        log(`  ... e mais ${invalid.length - 10} erros`, 'error');
      }
    }
  }

  if (withWarnings.length > 0) {
    log(`${withWarnings.length} produtos com avisos`, 'warn');
    
    if (VERBOSE) {
      withWarnings.slice(0, 5).forEach(({ product, validation }) => {
        log(`  ${validation.sku}: ${validation.warnings.join(', ')}`, 'warn');
      });
    }
  }

  console.log('');

  // ============================================================================
  // 3. TRANSFORMAR PRODUTOS
  // ============================================================================

  log('Transformando produtos para formato do banco...');

  const transformed = valid.map(({ product }) => transformProduct(product));

  log(`${transformed.length} produtos prontos para inserção`);
  console.log('');

  // ============================================================================
  // 4. CONECTAR AO BANCO
  // ============================================================================

  if (DRY_RUN) {
    log('Modo DRY RUN - pulando inserção no banco', 'warn');
    console.log('\n✓ Validação completa!\n');
    console.log('Resumo:');
    console.log(`  Total: ${products.length}`);
    console.log(`  Válidos: ${valid.length} (${((valid.length / products.length) * 100).toFixed(1)}%)`);
    console.log(`  Inválidos: ${invalid.length}`);
    console.log(`  Com avisos: ${withWarnings.length}`);
    console.log('');
    return;
  }

  log('Conectando ao banco de dados...');

  const pool = new Pool(DB_CONFIG);

  try {
    await pool.query('SELECT 1');
    log('Conexão estabelecida');
  } catch (error) {
    log(`Erro ao conectar: ${error.message}`, 'error');
    process.exit(1);
  }

  console.log('');

  // ============================================================================
  // 5. INSERIR EM LOTES
  // ============================================================================

  log(`Inserindo produtos em lotes de ${BATCH_SIZE}...`);

  const totalResults = {
    inserted: 0,
    updated: 0,
    errors: 0,
  };

  const totalBatches = Math.ceil(transformed.length / BATCH_SIZE);
  
  for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
    const batch = transformed.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    verbose(`Processando lote ${batchNum}/${totalBatches} (${batch.length} produtos)`);

    try {
      const results = await insertBatch(pool, batch);
      totalResults.inserted += results.inserted;
      totalResults.updated += results.updated;
      totalResults.errors += results.errors;

      log(`Lote ${batchNum}/${totalBatches}: ${results.inserted} inseridos, ${results.errors} erros`);

    } catch (error) {
      log(`Erro no lote ${batchNum}: ${error.message}`, 'error');
      totalResults.errors += batch.length;
    }
  }

  console.log('');

  // ============================================================================
  // 6. FINALIZAR
  // ============================================================================

  await pool.end();

  console.log('═══════════════════════════════════════════════════\n');
  console.log('✓ Importação concluída!\n');
  console.log('Resumo Final:');
  console.log(`  Total de produtos: ${products.length}`);
  console.log(`  Válidos: ${valid.length} (${((valid.length / products.length) * 100).toFixed(1)}%)`);
  console.log(`  Inválidos: ${invalid.length}`);
  console.log(`  Inseridos/Atualizados: ${totalResults.inserted}`);
  console.log(`  Erros de inserção: ${totalResults.errors}`);
  console.log('');

  if (totalResults.errors > 0) {
    log('⚠ Houve erros durante a importação. Execute com --verbose para detalhes.', 'warn');
  }

  // ============================================================================
  // 7. ESTATÍSTICAS DO CATÁLOGO
  // ============================================================================

  if (totalResults.inserted > 0 && !DRY_RUN) {
    console.log('\n📊 Estatísticas do Catálogo:\n');

    const pool2 = new Pool(DB_CONFIG);

    try {
      // Produtos por categoria
      const categoriesResult = await pool2.query(`
        SELECT category, COUNT(*) as count
        FROM catalog
        WHERE cdn_published = true
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `);

      console.log('Top 10 Categorias:');
      categoriesResult.rows.forEach(row => {
        console.log(`  ${row.category}: ${row.count} produtos`);
      });

      // Fabricantes
      const manufacturersResult = await pool2.query(`
        SELECT manufacturer, COUNT(*) as count
        FROM catalog
        WHERE cdn_published = true AND manufacturer IS NOT NULL
        GROUP BY manufacturer
        ORDER BY count DESC
        LIMIT 5
      `);

      console.log('\nTop 5 Fabricantes:');
      manufacturersResult.rows.forEach(row => {
        console.log(`  ${row.manufacturer}: ${row.count} produtos`);
      });

      // Pricing
      const pricingResult = await pool2.query(`
        SELECT 
          MIN(price_brl) as min_price,
          MAX(price_brl) as max_price,
          AVG(price_brl) as avg_price,
          SUM(price_brl) as total_value
        FROM catalog
        WHERE cdn_published = true
      `);

      const pricing = pricingResult.rows[0];
      console.log('\nPreços:');
      console.log(`  Mínimo: R$ ${parseFloat(pricing.min_price).toFixed(2)}`);
      console.log(`  Máximo: R$ ${parseFloat(pricing.max_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`  Médio: R$ ${parseFloat(pricing.avg_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`  Valor Total: R$ ${parseFloat(pricing.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    } catch (error) {
      log(`Erro ao gerar estatísticas: ${error.message}`, 'error');
    } finally {
      await pool2.end();
    }
  }

  console.log('\n');
}

// ============================================================================
// EXECUÇÃO
// ============================================================================

main().catch(error => {
  console.error('\n✗ Erro fatal:', error);
  process.exit(1);
});
