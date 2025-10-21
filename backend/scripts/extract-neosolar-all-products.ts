#!/usr/bin/env node

/**
 * Neosolar Full Product Extraction
 * Extracts ALL 1400+ products from Neosolar B2B Portal
 * 
 * Credentials (env):
 *   NEOSOLAR_EMAIL: product@boldsbrain.ai
 *   NEOSOLAR_PASSWORD: Rookie@010100
 * 
 * Usage:
 *   npx tsx scripts/extract-neosolar-all-products.ts
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
const NOVO_PEDIDO_URL = 'https://portalb2b.neosolar.com.br/novo-pedido';

const OUTPUT_DIR = path.join(process.cwd(), 'output', 'neosolar');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Auto-categorize products based on title
 */
function categorizeProduct(title: string): string {
  const lowerTitle = title.toLowerCase();

  const categories: { [key: string]: string[] } = {
    bateria: ['bateria', 'estacionária', 'bateriaestacionária', 'moura', 'heliar', 'freedom', 'fulguris'],
    bomba: ['bomba', 'solar', 'anauger', 'agua', 'piscina'],
    painel: ['painel', 'solar', 'fotovoltáico', 'módulo'],
    inversor: ['inversor', 'inverter', 'isolada', 'hybrid', 'grid-tie'],
    estrutura: ['estrutura', 'suporte', 'trilho', 'fixação', 'mounting'],
    cabo: ['cabo', 'conduite', 'connectores', 'conector'],
    eletrico: ['tomada', 'fusível', 'disjuntor', 'chave', 'eletrico'],
    veiculo: ['veículo', 'elétrico', 'ev', 'carregamento', 'charging'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category;
    }
  }

  return 'outros';
}

/**
 * Check if user is logged in
 */
async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      const hasLogout = !!document.querySelector('a[href*="logout"]');
      const hasUserMenu = !!document.querySelector('.user-menu, [class*="profile"], [class*="account"]');
      const hasProducts = document.querySelectorAll('a[href*="/produto"]').length > 0;
      return hasLogout || hasUserMenu || hasProducts;
    });
  } catch {
    return false;
  }
}

/**
 * Perform login
 */
async function login(page: Page, email: string, password: string): Promise<void> {
  console.log('🔐 Tentando fazer login...');
  
  try {
    // Wait for and click "Entrar" button
    const enterButton = page.locator('button:has-text("Entrar"), a:has-text("Entrar")').first();
    
    if (await enterButton.isVisible({ timeout: 5000 })) {
      await enterButton.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    // Button might not be needed if form is already visible
  }

  // Try multiple form field selectors
  const emailInputs = ['input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]'];
  const passwordInputs = ['input[type="password"]', 'input[name="password"]', 'input[placeholder*="senha" i]'];

  for (const selector of emailInputs) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(email);
      console.log(`✅ Email preenchido via ${selector}`);
      break;
    }
  }

  for (const selector of passwordInputs) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(password);
      console.log(`✅ Senha preenchida via ${selector}`);
      break;
    }
  }

  // Submit form
  try {
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('✅ Login enviado');
  } catch (e) {
    // Might already be logged in
  }
}

/**
 * Trigger lazy loading with multiple strategies
 */
async function triggerLazyLoading(page: Page, iterations: number = 50): Promise<number> {
  console.log(`📜 Acionando lazy loading (${iterations} iterações)...`);

  let previousCount = 0;
  let stableCount = 0;
  const threshold = 3; // iterations with same count before stopping

  for (let i = 0; i < iterations; i++) {
    // Scroll down
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await page.waitForTimeout(500);

    // Get current product count
    const currentCount = await page.evaluate(() => {
      return document.querySelectorAll('a[href*="/produto"]').length;
    });

    if (currentCount === previousCount) {
      stableCount++;
      if (stableCount >= threshold) {
        console.log(`  📊 Estabilizado em ${currentCount} produtos após ${i + 1} iterações`);
        return currentCount;
      }
    } else {
      stableCount = 0;
    }

    previousCount = currentCount;
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${iterations} iterações - ${currentCount} produtos encontrados`);
    }
  }

  return previousCount;
}

/**
 * Extract products from current page
 */
async function extractProducts(page: Page, startId: number = 0): Promise<Product[]> {
  const products = await page.evaluate(() => {
    const items: any[] = [];
    const productLinks = document.querySelectorAll('a[href*="/produto"]');

    productLinks.forEach((link, index) => {
      try {
        const href = (link as HTMLAnchorElement).href;
        const skuMatch = href.match(/\/produto\/(\d+)/);
        const sku = skuMatch ? skuMatch[1] : `unknown-${index}`;

        let title = (link.textContent || '').trim();
        
        // Try to find title in parent elements
        if (!title || title.length < 5) {
          const parent = link.closest('[class*="product"], [class*="card"], li, div[role="option"]');
          if (parent) {
            const titleEl = parent.querySelector('h2, h3, h4, .title, [class*="title"]');
            if (titleEl) {
              title = (titleEl.textContent || '').trim();
            }
          }
        }

        if (!title) {
          title = `Product ${sku}`;
        }

        // Extract image
        let imageUrl = '';
        const parent = link.closest('[class*="product"], [class*="card"], li');
        if (parent) {
          const img = parent.querySelector('img');
          if (img && (img as HTMLImageElement).src) {
            imageUrl = (img as HTMLImageElement).src;
          }
        }

        // Extract price if available
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

  // Deduplicate by SKU and assign IDs
  const uniqueSkus = new Set<string>();
  return products
    .filter(p => {
      if (uniqueSkus.has(p.sku)) return false;
      uniqueSkus.add(p.sku);
      return true;
    })
    .map((p, index) => ({
      ...p,
      id: String(startId + index),
      category: categorizeProduct(p.title),
    }));
}

/**
 * Main extraction function
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

    console.log('🌐 Conectando ao portal Neosolar...');
    await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`✅ Página carregada: ${page.url()}`);

    // Check if already logged in
    const alreadyLoggedIn = await isLoggedIn(page);
    console.log(alreadyLoggedIn ? '✅ Usuário já está logado' : '⏳ Realizando login...');

    if (!alreadyLoggedIn) {
      await login(page, email, password);
      await page.waitForTimeout(2000);

      // Navigate to novo-pedido if not already there
      if (!page.url().includes('novo-pedido')) {
        await page.goto(NOVO_PEDIDO_URL, { waitUntil: 'domcontentloaded' });
      }
    }

    // Trigger lazy loading
    const productCount = await triggerLazyLoading(page, 100);
    stats.totalAvailable = productCount;

    console.log(`📦 Extraindo ${productCount} produtos...`);
    const products = await extractProducts(page);
    stats.totalExtracted = products.length;

    // Count by category
    for (const product of products) {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    }

    stats.endTime = Date.now();
    stats.duration = (stats.endTime - stats.startTime) / 1000;

    // Save JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonFile = path.join(OUTPUT_DIR, `products-all-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(products, null, 2));
    console.log(`✅ JSON salvo: ${jsonFile}`);

    // Save CSV
    const csvFile = path.join(OUTPUT_DIR, `products-all-${timestamp}.csv`);
    const csvContent = [
      ['ID', 'SKU', 'Título', 'Preço', 'URL', 'Categoria', 'Imagem'].join(','),
      ...products.map(p =>
        [p.id, p.sku, `"${p.title.replace(/"/g, '""')}"`, p.price, p.url, p.category, p.imageUrl].join(',')
      ),
    ].join('\n');
    fs.writeFileSync(csvFile, csvContent);
    console.log(`✅ CSV salvo: ${csvFile}`);

    // Save stats
    const statsFile = path.join(OUTPUT_DIR, `extraction-stats-${timestamp}.json`);
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

    // Print summary
    console.log(`
╔════════════════════════════════════════════════╗
║   ✨ EXTRAÇÃO COMPLETA - NEOSOLAR B2B         ║
╚════════════════════════════════════════════════╝

📊 ESTATÍSTICAS:
  • Total de produtos: ${stats.totalExtracted}
  • Total disponível: ${stats.totalAvailable}
  • Cobertura: ${((stats.totalExtracted / stats.totalAvailable) * 100).toFixed(1)}%
  • Duração: ${stats.duration?.toFixed(2)}s

📂 CATEGORIAS:
${Object.entries(stats.categories)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, count]) => `  • ${cat}: ${count}`)
  .join('\n')}

📁 ARQUIVOS:
  JSON: ${jsonFile}
  CSV:  ${csvFile}
  Stats: ${statsFile}

🎉 Extraction complete!
    `);

    if (stats.totalExtracted < stats.totalAvailable) {
      console.log(`⚠️  Note: Only ${stats.totalExtracted} of ${stats.totalAvailable} products extracted.`);
      console.log(`   Try increasing scroll iterations or implementing pagination.`);
    }

  } catch (error) {
    console.error('❌ Erro na extração:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run extraction
extractAllProducts().catch(console.error);
