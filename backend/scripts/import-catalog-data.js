#!/usr/bin/env node
/**
 * Import Unified Catalog Data to PostgreSQL
 * Imports 1,161 products from unified_schemas to solar_product_metadata
 * 
 * Usage: node import-catalog-data.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 15432,
  user: 'medusa_user',
  password: 'medusa_password',
  database: 'medusa_db'
});

// Paths
const CATALOG_DIR = path.join(__dirname, '..', 'data', 'catalog', 'unified_schemas');
const MASTER_INDEX = path.join(CATALOG_DIR, 'MASTER_INDEX.json');

// Category mapping
const CATEGORY_MAP = {
  'kits': 'kit',
  'kits-hibridos': 'kit',
  'panels': 'panel',
  'inverters': 'inverter',
  'batteries': 'battery',
  'structures': 'structure',
  'accessories': 'accessory',
  'cables': 'cable',
  'controllers': 'controller',
  'stringboxes': 'stringbox',
  'ev_chargers': 'ev_charger',
  'posts': 'post',
  'others': 'other'
};

// Statistics
const stats = {
  total: 0,
  success: 0,
  errors: 0,
  skipped: 0,
  byCategory: {}
};

/**
 * Extract technical specs from product
 */
function extractTechnicalSpecs(product) {
  const specs = product.technical_specs || {};
  
  // Add common fields
  if (product.power_w) specs.power_w = product.power_w;
  if (product.potencia_kwp) specs.power_kw = product.potencia_kwp;
  if (product.voltage_v) specs.voltage_v = product.voltage_v;
  if (product.efficiency) specs.efficiency = product.efficiency;
  if (product.technology) specs.technology = product.technology;
  
  return specs;
}

/**
 * Extract kit components
 */
function extractKitComponents(product) {
  if (!product.type || !product.type.includes('kit')) return null;
  
  return {
    panels: product.panels || [],
    inverters: product.inverters || [],
    batteries: product.batteries || [],
    structures: product.structures || [],
    total_panels: product.total_panels || 0,
    total_inverters: product.total_inverters || 0,
    total_batteries: product.total_batteries || 0,
    total_power_w: product.total_power_w || 0
  };
}

/**
 * Extract image URLs
 */
function extractImageUrls(product) {
  const metadata = product.metadata || {};
  const imageMatch = metadata.image_match || {};
  
  return {
    original: product.image_url || product.image || null,
    thumb: imageMatch.thumb || null,
    medium: imageMatch.medium || null,
    large: imageMatch.large || null,
    webp: null, // to be generated
    avif: null  // to be generated
  };
}

/**
 * Extract search keywords
 */
function extractSearchKeywords(product) {
  const keywords = new Set();
  
  // Add name words
  if (product.name) {
    product.name.toLowerCase().split(/\s+/).forEach(w => {
      if (w.length > 3) keywords.add(w);
    });
  }
  
  // Add manufacturer/brand
  if (product.manufacturer) keywords.add(product.manufacturer.toLowerCase());
  if (product.brand) keywords.add(product.brand.toLowerCase());
  
  // Add type
  if (product.type) keywords.add(product.type.toLowerCase());
  
  // Add distributor
  if (product.distributor) keywords.add(product.distributor.toLowerCase());
  
  // Add power-related
  if (product.potencia_kwp) {
    keywords.add(`${product.potencia_kwp}kwp`);
    keywords.add(`${Math.round(product.potencia_kwp * 1000)}w`);
  }
  
  return Array.from(keywords);
}

/**
 * Calculate data completeness score
 */
function calculateCompletenessScore(product) {
  const fields = [
    'name', 'description', 'price', 'image',
    'manufacturer', 'model', 'category',
    'technical_specs'
  ];
  
  const filled = fields.filter(f => {
    if (f === 'technical_specs') {
      return product.technical_specs && Object.keys(product.technical_specs).length > 0;
    }
    return product[f] != null && product[f] !== '';
  });
  
  return (filled.length / fields.length) * 100;
}

/**
 * Calculate quality score
 */
function calculateQualityScore(product) {
  let score = 0;
  
  // Name quality (20 points)
  if (product.name && product.name.length > 10) score += 20;
  else if (product.name) score += 10;
  
  // Description quality (15 points)
  if (product.description && product.description.length > 50) score += 15;
  else if (product.description) score += 7;
  
  // Price (15 points)
  if (product.price_brl > 0) score += 15;
  
  // Image (20 points)
  const metadata = product.metadata || {};
  const imageMatch = metadata.image_match || {};
  if (imageMatch.exact_match) score += 20;
  else if (imageMatch.confidence > 0.8) score += 15;
  else if (product.image) score += 10;
  
  // Technical specs (20 points)
  const specs = product.technical_specs || {};
  const specsCount = Object.keys(specs).length;
  if (specsCount >= 5) score += 20;
  else if (specsCount >= 3) score += 15;
  else if (specsCount >= 1) score += 10;
  
  // Metadata enrichment (10 points)
  if (metadata.specs_enriched) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Insert product into solar_product_metadata
 */
async function insertProduct(product, client) {
  const solarType = CATEGORY_MAP[product.category] || 'other';
  const technicalSpecs = extractTechnicalSpecs(product);
  const kitComponents = extractKitComponents(product);
  const imageUrls = extractImageUrls(product);
  const searchKeywords = extractSearchKeywords(product);
  const completenessScore = calculateCompletenessScore(product);
  const qualityScore = calculateQualityScore(product);
  
  const query = `
    INSERT INTO solar_product_metadata (
      external_id,
      solar_type,
      solar_subtype,
      technical_specs,
      kit_components,
      manufacturer,
      brand,
      model,
      distributor,
      distributor_sku,
      distribution_center,
      total_power_w,
      total_panels,
      total_inverters,
      total_batteries,
      recommended_structure,
      image_urls,
      search_keywords,
      data_completeness_score,
      quality_score,
      source_file,
      source_system,
      enriched_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23
    )
    ON CONFLICT (external_id) DO UPDATE SET
      technical_specs = EXCLUDED.technical_specs,
      kit_components = EXCLUDED.kit_components,
      image_urls = EXCLUDED.image_urls,
      search_keywords = EXCLUDED.search_keywords,
      data_completeness_score = EXCLUDED.data_completeness_score,
      quality_score = EXCLUDED.quality_score,
      updated_at = NOW()
  `;
  
  const values = [
    product.id,                                      // $1 external_id
    solarType,                                       // $2 solar_type
    product.type || null,                            // $3 solar_subtype
    JSON.stringify(technicalSpecs),                  // $4 technical_specs
    kitComponents ? JSON.stringify(kitComponents) : null, // $5 kit_components
    product.manufacturer || null,                    // $6 manufacturer
    product.brand || null,                           // $7 brand
    product.model || null,                           // $8 model
    product.distributor || null,                     // $9 distributor
    product.id,                                      // $10 distributor_sku
    product.centro_distribuicao || null,             // $11 distribution_center
    product.total_power_w || null,                   // $12 total_power_w
    product.total_panels || null,                    // $13 total_panels
    product.total_inverters || null,                 // $14 total_inverters
    product.total_batteries || null,                 // $15 total_batteries
    product.estrutura || null,                       // $16 recommended_structure
    JSON.stringify(imageUrls),                       // $17 image_urls
    searchKeywords,                                  // $18 search_keywords
    completenessScore,                               // $19 data_completeness_score
    qualityScore,                                    // $20 quality_score
    product.metadata?.source_file || null,           // $21 source_file
    'unified_schemas',                               // $22 source_system
    product.metadata?.specs_enriched_at || null      // $23 enriched_at
  ];
  
  await client.query(query, values);
}

/**
 * Import products from a category file
 */
async function importCategory(filename, category) {
  const filePath = path.join(CATALOG_DIR, filename);
  
  console.log(`\n📦 Importing ${category} from ${filename}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found, skipping`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const products = Array.isArray(data) ? data : [data];
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let imported = 0;
    let errors = 0;
    
    for (const product of products) {
      try {
        await insertProduct(product, client);
        imported++;
        stats.success++;
        
        if (imported % 50 === 0) {
          process.stdout.write(`\r   ✓ Imported ${imported}/${products.length}...`);
        }
      } catch (error) {
        errors++;
        stats.errors++;
        console.error(`\n   ✗ Error importing ${product.id}:`, error.message);
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`\r   ✓ Imported ${imported}/${products.length} (${errors} errors)`);
    
    stats.byCategory[category] = {
      total: products.length,
      imported,
      errors
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`   ✗ Transaction error:`, error.message);
  } finally {
    client.release();
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Solar Catalog Import to PostgreSQL');
  console.log('=====================================\n');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✓ Database connection established');
    client.release();
    
    // Read master index
    const masterIndex = JSON.parse(fs.readFileSync(MASTER_INDEX, 'utf8'));
    console.log(`\n📊 Master Index:`);
    console.log(`   Total products: ${masterIndex.total_products}`);
    console.log(`   Categories: ${Object.keys(masterIndex.categories).length}`);
    
    stats.total = masterIndex.total_products;
    
    // Import each category
    const files = masterIndex.files;
    
    for (const file of files) {
      const category = file.replace('_unified.json', '');
      await importCategory(file, category);
    }
    
    // Print summary
    console.log('\n\n=====================================');
    console.log('📊 Import Summary');
    console.log('=====================================');
    console.log(`Total products: ${stats.total}`);
    console.log(`✓ Successfully imported: ${stats.success}`);
    console.log(`✗ Errors: ${stats.errors}`);
    console.log(`⊘ Skipped: ${stats.skipped}`);
    console.log(`Success rate: ${((stats.success / stats.total) * 100).toFixed(1)}%`);
    
    console.log('\n📊 By Category:');
    Object.entries(stats.byCategory).forEach(([cat, data]) => {
      console.log(`   ${cat}: ${data.imported}/${data.total} (${((data.imported/data.total)*100).toFixed(0)}%)`);
    });
    
    console.log('\n✅ Import completed!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run
main().catch(console.error);
