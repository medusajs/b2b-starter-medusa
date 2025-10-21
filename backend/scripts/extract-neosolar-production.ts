#!/usr/bin/env node

/**
 * Neosolar B2B Production Extraction Script
 * Extracts all products from Neosolar B2B portal with full details
 * Language: Portuguese (pt-BR) + English (en-US) support
 */

import { NeosolarMCPServer } from '../mcp-servers/distributors/neosolar/server.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple logger
const logger = {
  info: (msg: string, data?: any) => {
    if (data && typeof data === 'object') {
      console.log(`ℹ️  ${msg}`, JSON.stringify(data, null, 2));
    } else {
      console.log(`ℹ️  ${msg}`);
    }
  },
  error: (msg: string, data?: any) => {
    if (data && typeof data === 'object') {
      console.error(`❌ ${msg}`, JSON.stringify(data, null, 2));
    } else {
      console.error(`❌ ${msg}`);
    }
  },
};

// Configuration
const CONFIG = {
  language: (process.env.LANGUAGE || 'pt') as 'pt' | 'en',
  maxProducts: parseInt(process.env.MAX_PRODUCTS || '1000'),
  fullDetails: process.env.FULL_DETAILS !== 'false',
  concurrency: parseInt(process.env.CONCURRENCY || '3'),
  outputDir: process.env.OUTPUT_DIR || join(__dirname, '..', 'output', 'neosolar'),
  timeout: parseInt(process.env.TIMEOUT || '300000'), // 5 minutes
};

// I18n messages
const messages = {
  pt: {
    starting: '🚀 Iniciando extração Neosolar...',
    credentials_check: '🔑 Verificando credenciais...',
    credentials_missing: '❌ Credenciais ausentes: EMAIL_NEOSOLAR, PASSWORD_NEOSOLAR',
    auth_starting: '🔐 Autenticando no portal B2B...',
    auth_success: '✅ Autenticação bem-sucedida',
    auth_failed: '❌ Falha na autenticação',
    listing_products: '📦 Listando produtos...',
    products_found: (count: number) => `✅ ${count} produtos encontrados`,
    fetching_details: (current: number, total: number) => `📥 Obtendo detalhes: ${current}/${total}`,
    extracting: '🔄 Extraindo informações detalhadas...',
    extracting_complete: (count: number, duration: string) =>
      `✅ Extração concluída: ${count} produtos em ${duration}`,
    parsing: '⚙️  Parseando resultados...',
    saving: (file: string) => `💾 Salvando em: ${file}`,
    cleanup: '🧹 Limpando recursos...',
    error: (msg: string) => `❌ Erro: ${msg}`,
    done: '🎉 Processo finalizado com sucesso!',
  },
  en: {
    starting: '🚀 Starting Neosolar extraction...',
    credentials_check: '🔑 Checking credentials...',
    credentials_missing: '❌ Missing credentials: EMAIL_NEOSOLAR, PASSWORD_NEOSOLAR',
    auth_starting: '🔐 Authenticating with B2B portal...',
    auth_success: '✅ Authentication successful',
    auth_failed: '❌ Authentication failed',
    listing_products: '📦 Listing products...',
    products_found: (count: number) => `✅ ${count} products found`,
    fetching_details: (current: number, total: number) => `📥 Fetching details: ${current}/${total}`,
    extracting: '🔄 Extracting detailed information...',
    extracting_complete: (count: number, duration: string) =>
      `✅ Extraction complete: ${count} products in ${duration}`,
    parsing: '⚙️  Parsing results...',
    saving: (file: string) => `💾 Saving to: ${file}`,
    cleanup: '🧹 Cleaning up resources...',
    error: (msg: string) => `❌ Error: ${msg}`,
    done: '🎉 Process completed successfully!',
  },
};

const msg = messages[CONFIG.language];

async function formatDuration(ms: number): Promise<string> {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

async function main() {
  const startTime = Date.now();
  let server: NeosolarMCPServer | null = null;

  try {
    logger.info(msg.starting);
    logger.info(`Language: ${CONFIG.language.toUpperCase()}`);
    logger.info(`Configuration:`, CONFIG);

    // 1. Check credentials
    logger.info(msg.credentials_check);
    const email = process.env.NEOSOLAR_EMAIL;
    const password = process.env.NEOSOLAR_PASSWORD;

    if (!email || !password) {
      logger.error(msg.credentials_missing);
      process.exit(1);
    }
    logger.info(`✅ Using: ${email}`);

    // 2. Initialize server with language support
    logger.info('🔧 Inicializando servidor Neosolar...');
    server = new NeosolarMCPServer({
      name: 'Neosolar MCP Server',
      version: '1.0.0',
      distributor: 'neosolar',
      credentials: { email, password },
      language: CONFIG.language,
    });

    // 3. Authenticate
    logger.info(msg.auth_starting);
    const session = await server.authenticate(email, password);
    logger.info(msg.auth_success);
    logger.info(`Token: ${session.token.substring(0, 20)}...`);
    logger.info(`Expires at: ${session.expiresAt}`);

    // 4. Extract catalog
    logger.info(msg.extracting);
    const result = await server.extractCatalog({
      full_details: CONFIG.fullDetails,
      max_products: CONFIG.maxProducts,
      filters: {},
    });

    // 5. Log results
    logger.info(msg.products_found(result.total_products));
    logger.info(`Duration: ${result.duration_ms}ms`);

    // 6. Parse and prepare output
    logger.info(msg.parsing);
    
    // Create output directory
    mkdirSync(CONFIG.outputDir, { recursive: true });

    // Save as JSON
    const jsonPath = join(CONFIG.outputDir, `neosolar-products-${Date.now()}.json`);
    writeFileSync(
      jsonPath,
      JSON.stringify(result, null, 2),
      { encoding: 'utf-8' }
    );
    logger.info(msg.saving(jsonPath));

    // Save as CSV
    const csvPath = join(CONFIG.outputDir, `neosolar-products-${Date.now()}.csv`);
    const csv = convertToCSV(result.products);
    writeFileSync(csvPath, csv, { encoding: 'utf-8' });
    logger.info(msg.saving(csvPath));

    // Save summary
    const duration = await formatDuration(Date.now() - startTime);
    const summaryPath = join(CONFIG.outputDir, `neosolar-summary-${Date.now()}.json`);
    writeFileSync(
      summaryPath,
      JSON.stringify(
        {
          extraction_date: new Date().toISOString(),
          distributor: 'neosolar',
          total_products: result.total_products,
          language: CONFIG.language,
          config: CONFIG,
          duration,
          files: {
            json: jsonPath,
            csv: csvPath,
            summary: summaryPath,
          },
          sample_products: result.products.slice(0, 3),
        },
        null,
        2
      ),
      { encoding: 'utf-8' }
    );
    logger.info(msg.saving(summaryPath));

    // 7. Print summary
    logger.info('\n' + '='.repeat(70));
    logger.info('EXTRACTION SUMMARY - RESUMO DA EXTRAÇÃO');
    logger.info('='.repeat(70));
    logger.info(`Total Products: ${result.total_products}`);
    logger.info(`Extraction Duration: ${duration}`);
    logger.info(`Language: ${CONFIG.language}`);
    logger.info(`Full Details: ${CONFIG.fullDetails}`);
    logger.info('');
    logger.info('Output Files:');
    logger.info(`  📄 JSON: ${jsonPath}`);
    logger.info(`  📊 CSV:  ${csvPath}`);
    logger.info(`  📋 Summary: ${summaryPath}`);
    logger.info('='.repeat(70) + '\n');

    // 8. Print sample products
    if (result.products.length > 0) {
      logger.info('Sample Products:');
      result.products.slice(0, 3).forEach((p, i) => {
        logger.info(`\n[${i + 1}] ${p.title}`);
        logger.info(`    SKU: ${p.sku}`);
        logger.info(`    Category: ${p.category}`);
        logger.info(`    Price: R$ ${p.price}`);
        logger.info(`    Manufacturer: ${p.manufacturer}`);
      });
    }

    logger.info('');
    logger.info(msg.done);

  } catch (error) {
    logger.error(msg.error(error instanceof Error ? error.message : String(error)));
    logger.error(error);
    process.exit(1);
  } finally {
    if (server) {
      logger.info(msg.cleanup);
      await server.cleanup();
    }
  }
}

function convertToCSV(products: any[]): string {
  if (products.length === 0) {
    return '';
  }

  // Headers
  const headers = [
    'SKU',
    'Title',
    'Category',
    'Manufacturer',
    'Model',
    'Price (R$)',
    'Available',
    'Quantity',
    'URL',
    'Images',
    'Datasheet URL',
  ];

  // Rows
  const rows = products.map(p => [
    escapeCSV(p.sku),
    escapeCSV(p.title),
    escapeCSV(p.category),
    escapeCSV(p.manufacturer),
    escapeCSV(p.model),
    p.price.toFixed(2),
    p.stock?.available ? 'Yes' : 'No',
    p.stock?.quantity || '-',
    escapeCSV(p.url),
    escapeCSV(p.images?.join('; ') || ''),
    escapeCSV(p.datasheet_url || ''),
  ]);

  // Combine
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csv;
}

function escapeCSV(value: string | undefined | null): string {
  if (!value) return '""';
  const escaped = String(value).replace(/"/g, '""');
  return `"${escaped}"`;
}

// Run
main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
