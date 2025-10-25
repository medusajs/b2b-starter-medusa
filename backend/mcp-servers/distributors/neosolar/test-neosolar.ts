#!/usr/bin/env tsx
/**
 * Test script for Neosolar MCP Server
 * Usage: EMAIL=your@email.com PASSWORD=yourpass npx tsx mcp-servers/distributors/neosolar/test-neosolar.ts
 */

import { createNeosolarServer } from './server.js';
import pino from 'pino';

async function testNeosolar() {
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
    console.log('  EMAIL=your@email.com PASSWORD=yourpass npx tsx mcp-servers/distributors/neosolar/test-neosolar.ts');
    process.exit(1);
  }

  const server = createNeosolarServer({
    distributor: 'neosolar',
    logger,
  });

  try {
    console.log('🧪 Starting Neosolar MCP Server Tests\n');

    // Test 1: Authentication
    console.log('📝 Test 1: Authentication');
    console.log('   Email:', email);
    const session = await server.authenticate(email, password);
    console.log('   ✅ Authentication successful');
    console.log('   Session expires:', session.expiresAt);
    console.log('   Cookies count:', Object.keys(session.cookies).length);

    // Test 2: List Products (first page)
    console.log('\n📝 Test 2: List Products (first page)');
    const { products, total } = await server.listProducts({
      page: 1,
      limit: 10,
    });
    console.log('   ✅ Listed products');
    console.log('   Total found:', products.length);
    console.log('   Sample products:');
    products.slice(0, 3).forEach((p, i) => {
      console.log(`     ${i + 1}. ${p.sku} - ${p.title}`);
      console.log(`        Category: ${p.category}`);
      console.log(`        Price: R$ ${p.pricing.amount.toFixed(2)}`);
      console.log(`        Brand: ${p.manufacturer || 'N/A'}`);
    });

    // Test 3: Get Product Details
    if (products.length > 0) {
      console.log('\n📝 Test 3: Get Product Details');
      const firstSku = products[0].sku;
      console.log('   Testing with SKU:', firstSku);
      const product = await server.getProduct(firstSku);
      
      if (product) {
        console.log('   ✅ Product details retrieved');
        console.log('   Title:', product.title);
        console.log('   SKU:', product.sku);
        console.log('   Category:', product.category);
        console.log('   Manufacturer:', product.manufacturer);
        console.log('   Price: R$', product.pricing.amount.toFixed(2));
        console.log('   Images:', product.images.length);
        console.log('   Description:', product.description?.substring(0, 100) || 'N/A');
      } else {
        console.log('   ⚠️  Product not found');
      }
    }

    // Test 4: Search Products
    console.log('\n📝 Test 4: Search Products');
    const searchTerm = 'inversor';
    console.log('   Search term:', searchTerm);
    const searchResults = await server.listProducts({
      search: searchTerm,
      limit: 5,
    });
    console.log('   ✅ Search completed');
    console.log('   Results found:', searchResults.products.length);
    searchResults.products.slice(0, 3).forEach((p, i) => {
      console.log(`     ${i + 1}. ${p.sku} - ${p.title}`);
    });

    // Test 5: Extract Products (small batch)
    console.log('\n📝 Test 5: Extract Products (small batch)');
    const extraction = await server.extractProducts({
      batchSize: 20,
      maxPages: 2,
      maxProducts: 40,
    });
    console.log('   ✅ Extraction completed');
    console.log('   Total products:', extraction.totalProducts);
    console.log('   Duration:', extraction.duration.toFixed(2), 'seconds');
    console.log('   Rate:', (extraction.totalProducts / extraction.duration).toFixed(2), 'products/second');
    console.log('   Categories:', Object.keys(extraction.stats.categoryCounts).join(', '));
    console.log('   Price range: R$', extraction.stats.priceStats.min.toFixed(2), '-', extraction.stats.priceStats.max.toFixed(2));

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - Authentication: ✅');
    console.log('   - List Products: ✅');
    console.log('   - Get Product: ✅');
    console.log('   - Search: ✅');
    console.log('   - Extraction: ✅');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await server.cleanup();
  }
}

testNeosolar().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
