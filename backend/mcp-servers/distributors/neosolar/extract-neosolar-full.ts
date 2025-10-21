#!/usr/bin/env tsx
/**
 * Full catalog extraction script for Neosolar
 * Usage: EMAIL=your@email.com PASSWORD=yourpass npx tsx mcp-servers/distributors/neosolar/extract-neosolar-full.ts
 */

import { NeosolarMCPServer } from './server.js';
import pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function extractFullCatalog() {
  const logger = pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });

  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    console.error('❌ Error: EMAIL and PASSWORD environment variables are required');
    console.log('\nUsage:');
    console.log('  EMAIL=your@email.com PASSWORD=yourpass npx tsx mcp-servers/distributors/neosolar/extract-neosolar-full.ts');
    process.exit(1);
  }

  const server = new NeosolarMCPServer({
    distributor: 'neosolar',
    logger,
  });

  try {
    console.log('🚀 Starting Neosolar Full Catalog Extraction\n');
    console.log('⏰ Started at:', new Date().toISOString());

    // Authenticate
    console.log('\n🔐 Step 1: Authenticating...');
    await server.authenticate(email, password);
    console.log('   ✅ Authenticated successfully');

    // Extract full catalog
    console.log('\n📦 Step 2: Extracting products...');
    console.log('   Config:');
    console.log('   - Max Pages: 50');
    console.log('   - Batch Size: 50');
    console.log('   - Max Products: unlimited');
    
    const extraction = await server.extractProducts({
      batchSize: 50,
      maxPages: 50,
      maxProducts: undefined, // No limit
    });

    console.log('\n✅ Extraction Complete!');
    console.log('   Total Products:', extraction.totalProducts);
    console.log('   Duration:', extraction.duration.toFixed(2), 'seconds');
    console.log('   Rate:', (extraction.totalProducts / extraction.duration).toFixed(2), 'products/second');

    // Statistics
    console.log('\n📊 Statistics:');
    console.log('   Categories:');
    Object.entries(extraction.stats.categoryCounts).forEach(([cat, count]) => {
      console.log(`     - ${cat}: ${count}`);
    });
    console.log('   Price Statistics:');
    console.log(`     - Min: R$ ${extraction.stats.priceStats.min.toFixed(2)}`);
    console.log(`     - Max: R$ ${extraction.stats.priceStats.max.toFixed(2)}`);
    console.log(`     - Average: R$ ${extraction.stats.priceStats.avg.toFixed(2)}`);
    console.log(`     - Median: R$ ${extraction.stats.priceStats.median.toFixed(2)}`);

    // Save to JSON
    console.log('\n💾 Step 3: Saving results...');
    const outputPath = path.join(__dirname, '..', '..', 'neosolar-catalog-full.json');
    fs.writeFileSync(outputPath, JSON.stringify(extraction, null, 2));
    console.log('   ✅ Saved to:', outputPath);

    // Save to CSV
    const csvPath = path.join(__dirname, '..', '..', 'neosolar-catalog-full.csv');
    const csvLines = [
      'SKU,Title,Category,Manufacturer,Model,Price (BRL),Images,Last Updated',
      ...extraction.products.map((p) =>
        [
          p.sku,
          `"${p.title.replace(/"/g, '""')}"`,
          p.category || '',
          p.manufacturer || '',
          p.model || '',
          p.pricing.amount.toFixed(2),
          p.images.length,
          p.lastUpdated,
        ].join(',')
      ),
    ];
    fs.writeFileSync(csvPath, csvLines.join('\n'));
    console.log('   ✅ Saved CSV to:', csvPath);

    // Summary
    console.log('\n🎉 Extraction Summary:');
    console.log('   📦 Total Products:', extraction.totalProducts);
    console.log('   📂 Categories:', Object.keys(extraction.stats.categoryCounts).length);
    console.log('   ⏱️  Duration:', extraction.duration.toFixed(2), 's');
    console.log('   🚀 Rate:', (extraction.totalProducts / extraction.duration).toFixed(2), 'products/s');
    console.log('   💾 Output Files:');
    console.log('      - JSON:', outputPath);
    console.log('      - CSV:', csvPath);

  } catch (error) {
    console.error('\n❌ Extraction failed:', error);
    process.exit(1);
  } finally {
    await server.cleanup();
    console.log('\n⏰ Finished at:', new Date().toISOString());
  }
}

extractFullCatalog().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
