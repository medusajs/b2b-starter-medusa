/**
 * Full extraction script for Fotus
 * Saves products to JSON and CSV
 * Usage: EMAIL=user@example.com PASSWORD=password npx tsx extract-fotus-full.ts
 */

import FotusMCPServer from './server.js';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';

interface CSVProduct {
  sku: string;
  title: string;
  price: number;
  currency: string;
  category?: string;
  brand?: string;
  url?: string;
  imageUrl?: string;
}

async function extractFull(): Promise<void> {
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
    console.log('🚀 Starting Fotus full extraction...');
    
    const result = await server.extractProducts({
      filters: { limit: 10000 },
    });
    
    // Save JSON
    const jsonPath = 'fotus-catalog-full.json';
    await fs.writeFile(jsonPath, JSON.stringify(result, null, 2));
    console.log(`✅ Saved ${result.products.length} products to ${jsonPath}`);
    
    // Save CSV
    const csvPath = 'fotus-catalog-full.csv';
    const csv = createWriteStream(csvPath);
    
    csv.write('sku,title,price,currency,imageUrl,url\n');
    
    for (const product of result.products) {
      const row = [
        escapeCSV(product.sku || ''),
        escapeCSV(product.title || ''),
        product.price || 0,
        product.currency || 'BRL',
        escapeCSV(product.imageUrl || ''),
        escapeCSV(product.url || ''),
      ].join(',');
      csv.write(row + '\n');
    }
    
    csv.end();
    console.log(`✅ Saved ${result.products.length} products to ${csvPath}`);
    
    console.log(`\n📊 Extraction Summary:`);
    console.log(`   Total Products: ${result.products.length}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Timestamp: ${result.timestamp}`);
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  } finally {
    await server.cleanup();
  }
}

function escapeCSV(value: string): string {
  if (typeof value !== 'string') return String(value);
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

extractFull().catch(console.error);
