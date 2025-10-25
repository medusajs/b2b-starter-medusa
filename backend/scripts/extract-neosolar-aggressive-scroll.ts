#!/usr/bin/env node

/**
 * Neosolar Network Interception Extraction
 * Intercepts API responses while portal loads to get all products
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface Product {
  id: string;
  sku: string;
  title: string;
  price: number;
  url: string;
  imageUrl: string;
  category: string;
}

interface ExtractionStats {
  totalExtracted: number;
  totalAvailable: number;
  categories: { [key: string]: number };
  startTime: number;
  endTime?: number;
  duration?: number;
}

const PORTAL_URL = 'https://portalb2b.neosolar.com.br/';
const OUTPUT_DIR = path.join(process.cwd(), 'output', 'neosolar');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function categorizeProduct(title: string): string {
  const lowerTitle = title.toLowerCase();
  const categories: { [key: string]: string[] } = {
    bateria: ['bateria', 'estacionária', 'moura', 'heliar', 'freedom', 'fulguris'],
    bomba: ['bomba', 'solar', 'anauger', 'agua', 'piscina'],
    painel: ['painel', 'solar', 'fotovoltáico', 'módulo'],
    inversor: ['inversor', 'inverter', 'isolada', 'hybrid', 'grid-tie'],
    estrutura: ['estrutura', 'suporte', 'trilho', 'fixação'],
    cabo: ['cabo', 'conduite', 'conectores', 'conector'],
    eletrico: ['tomada', 'fusível', 'disjuntor', 'chave'],
    veiculo: ['veículo', 'elétrico', 'ev', 'carregamento'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category;
    }
  }

  return 'outros';
}

async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      const hasLogout = !!document.querySelector('a[href*="logout"]');
      const hasUserMenu = !!document.querySelector('.user-menu, [class*="profile"]');
      const hasProducts = document.querySelectorAll('a[href*="/produto"]').length > 0;
      return hasLogout || hasUserMenu || hasProducts;
    });
  } catch {
    return false;
  }
}

async function login(page: Page, email: string, password: string): Promise<void> {
  console.log('🔐 Realizando login...');
  
  try {
    const enterButton = page.locator('button:has-text("Entrar"), a:has-text("Entrar")').first();
    if (await enterButton.isVisible({ timeout: 5000 })) {
      await enterButton.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    // Button might not be needed
  }

  const emailInputs = ['input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]'];
  const passwordInputs = ['input[type="password"]', 'input[name="password"]', 'input[placeholder*="senha" i]'];

  for (const selector of emailInputs) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(email);
      break;
    }
  }

  for (const selector of passwordInputs) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(password);
      break;
    }
  }

  try {
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch (e) {
    // Already logged in
  }
}

/**
 * Extract products from DOM with aggressive scrolling
 */
async function extractProductsAggressive(page: Page): Promise<Product[]> {
  console.log('\n📜 Iniciando scroll agressivo para carregar todos os produtos...');

  // Scroll to bottom multiple times
  for (let i = 0; i < 200; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    if ((i + 1) % 20 === 0) {
      const count = await page.evaluate(() => {
        return document.querySelectorAll('a[href*="/produto"]').length;
      });
      console.log(`  ${i + 1} scrolls: ${count} produtos`);

      // Stop if no new products in last 20 scrolls
      if (i > 100 && count === 20) {
        console.log('  ✅ Estabilizado em ' + count + ' produtos');
        break;
      }
    }

    await page.waitForTimeout(100);
  }

  // Also try to trigger loading by scrolling back to top and down again
  console.log('  🔄 Scroll adicional para otimizar carregamento...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(150);
  }

  // Extract all products
  const products = await page.evaluate(() => {
    const items: any[] = [];
    const productLinks = Array.from(document.querySelectorAll('a[href*="/produto"]'));

    productLinks.forEach((link, index) => {
      try {
        const href = (link as HTMLAnchorElement).href;
        const skuMatch = href.match(/\/produto\/(\d+)/);
        const sku = skuMatch ? skuMatch[1] : `unknown-${index}`;

        let title = (link.textContent || '').trim();

        if (!title || title.length < 5) {
          const parent = link.closest('[class*="product"], [class*="card"], li');
          if (parent) {
            const titleEl = parent.querySelector('h2, h3, h4, .title, [class*="title"]');
            if (titleEl) {
              title = (titleEl.textContent || '').trim();
            }
          }
        }

        if (!title) title = `Product ${sku}`;

        let imageUrl = '';
        const parent = link.closest('[class*="product"], [class*="card"], li');
        if (parent) {
          const img = parent.querySelector('img');
          if (img && (img as HTMLImageElement).src) {
            imageUrl = (img as HTMLImageElement).src;
          }
        }

        let price = 0;
        const priceEl = parent?.querySelector('[class*="price"], .preco');
        if (priceEl) {
          const priceText = (priceEl.textContent || '').trim();
          const priceMatch = priceText.match(/[\d.,]+/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0].replace(',', '.'));
          }
        }

        items.push({
          sku,
          title,
          url: href,
          imageUrl,
          price: isNaN(price) ? 0 : price,
        });
      } catch (e) {
        // Skip
      }
    });

    return items;
  });

  // Deduplicate
  const uniqueSkus = new Set<string>();
  return products
    .filter(p => {
      if (uniqueSkus.has(p.sku)) return false;
      uniqueSkus.add(p.sku);
      return true;
    })
    .map((p, index) => ({
      ...p,
      id: String(index),
      category: categorizeProduct(p.title),
    }));
}

/**
 * Main extraction with aggressive loading
 */
async function extractAllProducts(): Promise<void> {
  let browser: Browser | null = null;
  const stats: ExtractionStats = {
    totalExtracted: 0,
    totalAvailable: 0,
    categories: {},
    startTime: Date.now(),
  };

  try {
    const email = process.env.NEOSOLAR_EMAIL || 'product@boldsbrain.ai';
    const password = process.env.NEOSOLAR_PASSWORD || 'Rookie@010100';

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🌐 Conectando ao portal...');
    await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`✅ Página carregada`);

    const alreadyLoggedIn = await isLoggedIn(page);
    console.log(alreadyLoggedIn ? '✅ Usuário já logado' : '🔐 Fazendo login...');

    if (!alreadyLoggedIn) {
      await login(page, email, password);
      await page.waitForTimeout(1000);
    }

    // Extract with aggressive scrolling
    const products = await extractProductsAggressive(page);
    stats.totalExtracted = products.length;
    stats.totalAvailable = products.length; // We don't know the actual total

    // Count by category
    for (const product of products) {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    }

    stats.endTime = Date.now();
    stats.duration = (stats.endTime - stats.startTime) / 1000;

    // Save files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const jsonFile = path.join(OUTPUT_DIR, `products-aggressive-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(products, null, 2));

    const csvFile = path.join(OUTPUT_DIR, `products-aggressive-${timestamp}.csv`);
    const csvContent = [
      ['ID', 'SKU', 'Título', 'Preço', 'URL', 'Categoria'].join(','),
      ...products.map(p =>
        [p.id, p.sku, `"${p.title.replace(/"/g, '""')}"`, p.price, p.url, p.category].join(',')
      ),
    ].join('\n');
    fs.writeFileSync(csvFile, csvContent);

    // Summary
    console.log(`
╔═══════════════════════════════════════════════╗
║ ✨ EXTRAÇÃO COM SCROLL AGRESSIVO            ║
╚═══════════════════════════════════════════════╝

📊 ESTATÍSTICAS:
  • Total: ${stats.totalExtracted}
  • Duração: ${stats.duration?.toFixed(2)}s

📂 CATEGORIAS:
${Object.entries(stats.categories)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, count]) => `  • ${cat}: ${count}`)
  .join('\n')}

📁 ARQUIVOS:
  • JSON: ${path.basename(jsonFile)}
  • CSV: ${path.basename(csvFile)}
    `);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

extractAllProducts().catch(console.error);
