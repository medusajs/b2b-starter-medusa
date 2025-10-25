#!/usr/bin/env node

/**
 * Neosolar Full Pagination Extraction
 * Extracts ALL 1400+ products using pagination API
 * 
 * Credentials (env):
 *   NEOSOLAR_EMAIL: product@boldsbrain.ai
 *   NEOSOLAR_PASSWORD: Rookie@010100
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
  totalPages: number;
  itemsPerPage: number;
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
  console.log('🔐 Tentando fazer login...');
  
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
    console.log('✅ Login enviado');
  } catch (e) {
    // Already logged in
  }
}

/**
 * Intercept and collect API calls to understand pagination
 */
async function analyzeApiCalls(page: Page): Promise<void> {
  console.log('🔍 Analisando chamadas API para entender paginação...');

  const apiCalls: any[] = [];

  await page.on('response', async (response) => {
    if (response.url().includes('/api') || response.url().includes('/graphql')) {
      try {
        const status = response.status();
        console.log(`  📡 ${response.url().substring(0, 80)} [${status}]`);
        if (status === 200 && response.url().includes('produtos')) {
          apiCalls.push({
            url: response.url(),
            method: response.request().method(),
            time: new Date().toISOString(),
          });
        }
      } catch (e) {
        // Ignore
      }
    }
  });

  // Trigger different pagination scenarios
  console.log('  • Scrolling...');
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 5));
  await page.waitForTimeout(2000);

  console.log('  • Looking for pagination controls...');
  const paginationControls = await page.evaluate(() => {
    const controls = {
      nextButtons: Array.from(document.querySelectorAll('button, a')).filter(el =>
        (el.textContent || '').match(/próx|next|>|»/i)
      ).length,
      pageInputs: document.querySelectorAll('input[type="number"], input[placeholder*="página" i]').length,
      selectDropdowns: document.querySelectorAll('select').length,
      paginationDivs: document.querySelectorAll('[class*="pagination"], [class*="paging"]').length,
    };
    return controls;
  });

  console.log(`  📊 Controles encontrados:`, paginationControls);
}

/**
 * Try to find next page button and click it
 */
async function goToNextPage(page: Page): Promise<boolean> {
  try {
    // Try to find next page button
    const nextButtons = [
      'button:has-text("próximo")',
      'button:has-text("next")',
      'a:has-text(">")',
      'a:has-text("»")',
      '[data-testid="pagination-next"]',
      '[aria-label*="próximo" i]',
      '[aria-label*="next" i]',
    ];

    for (const selector of nextButtons) {
      try {
        const button = page.locator(selector).first();
        if (await button.isEnabled({ timeout: 2000 }).catch(() => false)) {
          await button.click();
          await page.waitForTimeout(1000);
          return true;
        }
      } catch (e) {
        // Try next selector
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Extract products from current DOM
 */
async function extractProducts(page: Page): Promise<Product[]> {
  const products = await page.evaluate(() => {
    const items: any[] = [];
    const productLinks = document.querySelectorAll('a[href*="/produto"]');

    productLinks.forEach((link, index) => {
      try {
        const href = (link as HTMLAnchorElement).href;
        const skuMatch = href.match(/\/produto\/(\d+)/);
        const sku = skuMatch ? skuMatch[1] : `unknown-${index}`;

        let title = (link.textContent || '').trim();

        if (!title || title.length < 5) {
          const parent = link.closest('[class*="product"], [class*="card"], li, div[role="option"]');
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
        const priceEl = parent?.querySelector('[class*="price"], .preco, [data-price]');
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
        // Skip problematic items
      }
    });

    return items;
  });

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
 * Main extraction with pagination
 */
async function extractAllProductsWithPagination(): Promise<void> {
  let browser: Browser | null = null;
  const allProducts: Product[] = [];
  const seenSkus = new Set<string>();
  const stats: ExtractionStats = {
    totalExtracted: 0,
    totalPages: 0,
    itemsPerPage: 0,
    categories: {},
    startTime: Date.now(),
  };

  try {
    const email = process.env.NEOSOLAR_EMAIL || 'product@boldsbrain.ai';
    const password = process.env.NEOSOLAR_PASSWORD || 'Rookie@010100';

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🌐 Conectando ao portal Neosolar...');
    await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`✅ Página carregada: ${page.url()}`);

    const alreadyLoggedIn = await isLoggedIn(page);
    console.log(alreadyLoggedIn ? '✅ Usuário já logado' : '⏳ Fazendo login...');

    if (!alreadyLoggedIn) {
      await login(page, email, password);
      await page.waitForTimeout(2000);
    }

    // Analyze API structure
    await analyzeApiCalls(page);

    // Try pagination
    console.log('\n📖 Tentando extrair com paginação...');
    let pageNum = 1;
    let hasNextPage = true;
    let previousProductCount = 0;

    while (hasNextPage && pageNum <= 100) {
      console.log(`\n📄 Página ${pageNum}:`);

      // Scroll to load products on current page
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 3);
      });
      await page.waitForTimeout(1000);

      // Extract products
      const pageProducts = await extractProducts(page);
      console.log(`  ✅ ${pageProducts.length} produtos encontrados`);

      // Track unique products
      let newProducts = 0;
      for (const product of pageProducts) {
        if (!seenSkus.has(product.sku)) {
          seenSkus.add(product.sku);
          product.id = String(allProducts.length);
          allProducts.push(product);
          newProducts++;
        }
      }

      if (newProducts === 0 && pageNum > 1) {
        console.log('  ⚠️  Nenhum produto novo encontrado - parando');
        break;
      }

      stats.totalPages = pageNum;
      stats.itemsPerPage = Math.max(stats.itemsPerPage, pageProducts.length);

      previousProductCount = pageProducts.length;

      // Try to go to next page
      if (pageNum < 100) {
        const advanced = await goToNextPage(page);
        hasNextPage = advanced;

        if (!advanced) {
          console.log('  ℹ️  Nenhum botão "próximo" encontrado');
          break;
        }
      } else {
        hasNextPage = false;
      }

      pageNum++;
    }

    console.log(`\n✅ Extração completa: ${allProducts.length} produtos únicos`);

    // Count by category
    for (const product of allProducts) {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    }

    stats.totalExtracted = allProducts.length;
    stats.endTime = Date.now();
    stats.duration = (stats.endTime - stats.startTime) / 1000;

    // Save files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const jsonFile = path.join(OUTPUT_DIR, `products-paginated-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(allProducts, null, 2));
    console.log(`✅ JSON: ${jsonFile}`);

    const csvFile = path.join(OUTPUT_DIR, `products-paginated-${timestamp}.csv`);
    const csvContent = [
      ['ID', 'SKU', 'Título', 'Preço', 'URL', 'Categoria', 'Imagem'].join(','),
      ...allProducts.map(p =>
        [p.id, p.sku, `"${p.title.replace(/"/g, '""')}"`, p.price, p.url, p.category, p.imageUrl].join(',')
      ),
    ].join('\n');
    fs.writeFileSync(csvFile, csvContent);
    console.log(`✅ CSV: ${csvFile}`);

    const statsFile = path.join(OUTPUT_DIR, `pagination-stats-${timestamp}.json`);
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

    // Print summary
    console.log(`
╔═════════════════════════════════════════════════╗
║   ✨ EXTRAÇÃO COM PAGINAÇÃO - NEOSOLAR B2B     ║
╚═════════════════════════════════════════════════╝

📊 ESTATÍSTICAS:
  • Total de produtos: ${stats.totalExtracted}
  • Páginas processadas: ${stats.totalPages}
  • Itens/página: ${stats.itemsPerPage}
  • Duração: ${stats.duration?.toFixed(2)}s

📂 CATEGORIAS:
${Object.entries(stats.categories)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, count]) => `  • ${cat}: ${count}`)
  .join('\n')}

📁 ARQUIVOS:
  JSON: ${jsonFile}
  CSV:  ${csvFile}
    `);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

extractAllProductsWithPagination().catch(console.error);
