#!/usr/bin/env node

/**
 * Neosolar B2B Production Extraction Script
 * Simple direct extraction without type issues
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  warn: (msg: string) => console.warn(`⚠️  ${msg}`),
};

interface Product {
  sku: string;
  title: string;
  category: string;
  price: number;
  url: string;
  imageUrl: string;
  priceText: string;
}

async function extractNeosolarProducts() {
  const startTime = Date.now();
  const email = process.env.NEOSOLAR_EMAIL || 'product@boldsbrain.ai';
  const password = process.env.NEOSOLAR_PASSWORD || 'Rookie@010100';
  const language = process.env.LANGUAGE || 'pt';

  log.info(`🚀 Iniciando extração Neosolar`);
  log.info(`Email: ${email}`);
  log.info(`Idioma: ${language}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 1. Go to login page
    log.info('🔐 Navegando para página de login...');
    await page.goto('https://portalb2b.neosolar.com.br/', { waitUntil: 'domcontentloaded' });

    // 2. Fill login form with discovered credentials
    log.info('📝 Preenchendo formulário de login...');
    
    // Try to find email/username field
    const emailSelector = 'input[name="email"], input[name="username"], input[type="email"]';
    const emailField = await page.$(emailSelector);
    if (emailField) {
      await page.fill(emailSelector, email);
      log.success('Email preenchido');
    }

    // Fill password
    const passwordSelector = 'input[name="password"], input[type="password"]';
    const passwordField = await page.$(passwordSelector);
    if (passwordField) {
      await page.fill(passwordSelector, password);
      log.success('Senha preenchida');
    }

    // 3. Click login button
    log.info('🔑 Clicando no botão de login...');
    const loginButton = await page.$('button[type="submit"], button.btn-login, button.login-button');
    if (loginButton) {
      await loginButton.click();
    } else {
      log.warn('Botão de login não encontrado, tentando Enter...');
      await page.press('input[type="password"]', 'Enter');
    }

    // 4. Wait for navigation
    log.info('⏳ Aguardando redirecionamento...');
    try {
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch {
      log.warn('Timeout na navegação, continuando...');
      await page.waitForTimeout(2000);
    }

    const currentUrl = page.url();
    log.success(`URL atual: ${currentUrl}`);

    // 5. Check if logged in
    const isLoggedIn = await page.evaluate(() => {
      const hasLogoutButton = !!document.querySelector('[href*="logout"], [onclick*="logout"]');
      const hasUserMenu = !!document.querySelector('.user-menu, .profile, .account');
      const hasProducts = !!document.querySelector('[data-product], .product, .item-product');
      return hasLogoutButton || hasUserMenu || hasProducts;
    });

    if (!isLoggedIn) {
      log.warn('Pode não estar logado. Tentando navegar para produtos...');
    } else {
      log.success('✅ Autenticação bem-sucedida');
    }

    // 6. Navigate to products page
    log.info('📦 Navegando para página de produtos...');
    await page.goto('https://portalb2b.neosolar.com.br/novo-pedido', { waitUntil: 'domcontentloaded' });

    // 7. Wait for page to stabilize
    await page.waitForTimeout(3000);

    // 8. Scroll to load all products (lazy loading)
    log.info('📜 Scrollando para carregar produtos...');
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => window.scrollTo(0, 0)); // Go back to top

    // 9. Extract products
    log.info('🔍 Extraindo produtos...');
    const products = await page.evaluate(() => {
      const items = [];
      
      // Try different selectors to find products
      const selectors = [
        '.product-card',
        '.product-item',
        '.item-product',
        '[data-product]',
        'div[class*="product"]',
        'article',
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach((el: Element) => {
            const titleEl = el.querySelector('h3, .product-title, .title, .name');
            const priceEl = el.querySelector('.price, .product-price, [data-price]');
            const linkEl = el.querySelector('a[href]');
            const imageEl = el.querySelector('img');

            const title = titleEl?.textContent?.trim() || '';
            const priceText = priceEl?.textContent?.trim() || '';
            const url = linkEl ? (linkEl as HTMLAnchorElement).href : '';
            const imageUrl = imageEl ? (imageEl as HTMLImageElement).src : '';

            // Extract SKU
            let sku = el.getAttribute('data-sku') || el.getAttribute('data-id') || '';
            if (!sku && url) {
              const match = url.match(/\/([A-Z0-9\-]+)(?:\/|$)/);
              sku = match ? match[1] : `SKU-${Math.random().toString(36).substr(2, 9)}`;
            }

            if (title && priceText) {
              items.push({ sku, title, priceText, url, imageUrl });
            }
          });

          if (items.length > 0) break;
        }
      }

      return items;
    });

    log.success(`Encontrados ${products.length} produtos`);

    if (products.length === 0) {
      log.warn('Nenhum produto encontrado com os seletores padrão');
      log.info('Salvando página HTML para análise...');
      
      const html = await page.content();
      const htmlPath = join(dirname(__dirname), 'output', 'neosolar-page-debug.html');
      mkdirSync(dirname(htmlPath), { recursive: true });
      writeFileSync(htmlPath, html);
      log.info(`Página salva em: ${htmlPath}`);
    }

    // 10. Parse products
    const parsedProducts: Product[] = products.map((p: any) => ({
      ...p,
      category: categorizeProduct(p.title),
      price: parsePrice(p.priceText),
    }));

    // 11. Save results
    const outputDir = join(dirname(__dirname), 'output', 'neosolar');
    mkdirSync(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save JSON
    const jsonPath = join(outputDir, `products-${timestamp}.json`);
    writeFileSync(jsonPath, JSON.stringify(parsedProducts, null, 2));
    log.success(`JSON salvo: ${jsonPath}`);

    // Save CSV
    const csvPath = join(outputDir, `products-${timestamp}.csv`);
    const csv = convertToCSV(parsedProducts);
    writeFileSync(csvPath, csv);
    log.success(`CSV salvo: ${csvPath}`);

    // Print summary
    const duration = Date.now() - startTime;
    log.info('\n' + '='.repeat(60));
    log.info('RESUMO DA EXTRAÇÃO - NEOSOLAR');
    log.info('='.repeat(60));
    log.info(`Total de produtos: ${parsedProducts.length}`);
    log.info(`Duração: ${(duration / 1000).toFixed(2)}s`);
    log.info(`Idioma: ${language}`);
    log.info(`Arquivos salvos:`);
    log.info(`  📄 JSON: ${jsonPath}`);
    log.info(`  📊 CSV:  ${csvPath}`);
    log.info('='.repeat(60));

    // Print samples
    if (parsedProducts.length > 0) {
      log.info('\n🎯 Primeiros 3 produtos:');
      parsedProducts.slice(0, 3).forEach((p, i) => {
        log.info(`\n${i + 1}. ${p.title}`);
        log.info(`   SKU: ${p.sku}`);
        log.info(`   Categoria: ${p.category}`);
        log.info(`   Preço: R$ ${p.price.toFixed(2)}`);
      });
    }

  } catch (error) {
    log.error(`Erro durante extração: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function categorizeProduct(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('painel') || lower.includes('módulo')) return 'painel_solar';
  if (lower.includes('inversor') && !lower.includes('micro')) return 'inversor';
  if (lower.includes('microinversor')) return 'microinversor';
  if (lower.includes('estrutura') || lower.includes('suporte')) return 'estrutura';
  if (lower.includes('cabo')) return 'cabo';
  if (lower.includes('conector')) return 'conector';
  if (lower.includes('string box')) return 'string_box';
  if (lower.includes('bateria')) return 'bateria';
  if (lower.includes('kit')) return 'kit_completo';
  return 'outros';
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^\d,]/g, '').replace(',', '.');
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

function convertToCSV(products: Product[]): string {
  const headers = ['SKU', 'Título', 'Categoria', 'Preço (R$)', 'URL', 'Imagem'];
  const rows = products.map(p => [
    escapeCSV(p.sku),
    escapeCSV(p.title),
    escapeCSV(p.category),
    p.price.toFixed(2),
    escapeCSV(p.url),
    escapeCSV(p.imageUrl),
  ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

function escapeCSV(value: string): string {
  if (!value) return '""';
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

// Run
extractNeosolarProducts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
