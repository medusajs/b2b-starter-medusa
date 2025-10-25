/**
 * Test suite for Fotus agent
 * Usage: EMAIL=user@example.com PASSWORD=password npx tsx test-fotus.ts
 */

import FotusMCPServer from './server.js';
import { strict as assert } from 'assert';

async function runTests(): Promise<void> {
  const server = new FotusMCPServer({
    name: 'fotus',
    version: '1.0.0',
    logger: console as any,
  });
  
  const email = process.env.EMAIL || '';
  const password = process.env.PASSWORD || '';
  
  if (!email || !password) {
    console.error('❌ Please set EMAIL and PASSWORD environment variables');
    process.exit(1);
  }
  
  try {
    // Test 1: Authentication
    console.log('🧪 Test 1: Authentication');
    const session = await server.authenticate(email, password);
    assert(session.distributor === 'fotus', 'Distributor name mismatch');
    assert(session.token, 'No token returned');
    assert(session.expiresAt, 'No expiration date');
    console.log('✅ Authentication test passed');
    
    // Test 2: List Products
    console.log('🧪 Test 2: List Products');
    const products = await server.listProducts();
    assert(Array.isArray(products), 'Products is not an array');
    assert(products.length > 0, 'No products found');
    console.log(`✅ Found ${products.length} products`);
    
    // Test 3: Get Detailed Product
    if (products.length > 0) {
      console.log('🧪 Test 3: Get Product Details');
      const firstProduct = products[0];
      const detailed = await server.getProduct(firstProduct.sku);
      assert(detailed, 'Failed to get product details');
      console.log('✅ Product details retrieved');
    }
    
    // Test 4: Category Filter
    console.log('🧪 Test 4: Category Filter');
    const filtered = await server.listProducts({ category: 'inversores' });
    assert(Array.isArray(filtered), 'Filtered products is not an array');
    console.log(`✅ Found ${filtered.length} products in category`);
    
    // Test 5: Full Extraction
    console.log('🧪 Test 5: Full Extraction');
    const result = await server.extractProducts({
      filters: { limit: 50 },
    });
    assert(result.distributor === 'fotus', 'Result distributor mismatch');
    assert(result.products.length > 0, 'No products in extraction result');
    console.log(`✅ Extracted ${result.products.length} products in ${result.duration}ms`);
    
    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await server.cleanup();
  }
}

runTests().catch(console.error);
