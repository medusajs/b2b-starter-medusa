#!/usr/bin/env node

/**
 * Neosolar API Direct Extraction
 * Accesses search API directly to extract ALL 1400+ products
 * 
 * API endpoint discovered:
 * GET /api/portals/shop/products/search?perPage=100&page=1
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
const API_BASE = 'https://portalb2b.neosolar.com.br/api/portals/shop/products/search';
const OUTPUT_DIR = path.join(process.cwd(), 'output', 'neosolar');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function categorizeProduct(title: string): string {
  const lowerTitle = title.toLowerCase();
  const categories: { [key: string]: string[] } = {
    bateria: ['bateria', 'estacionária', 'moura', 'heliar', 'freedom', 'fulguris', 'lifepo4'],
    bomba: ['bomba', 'solar', 'anauger', 'agua', 'piscina', 'submersa'],
    painel: ['painel', 'solar', 'fotovoltáico', 'módulo', 'placa'],
    inversor: ['inversor', 'inverter', 'isolada', 'hybrid', 'grid-tie', 'megatron'],
    estrutura: ['estrutura', 'suporte', 'trilho', 'fixação', 'mounting'],
    cabo: ['cabo', 'conduite', 'conectores', 'conector', 'MC4'],
    eletrico: ['tomada', 'fusível', 'disjuntor', 'chave', 'breaker'],
    veiculo: ['veículo', 'elétrico', 'ev', 'carregamento', 'wallbox'],
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
 * Query API with pagination
 */
async function queryProductsAPI(
  page: Page,
  page_num: number,
  per_page: number = 100
): Promise<{ products: any[]; total: number }> {
  const url = `${API_BASE}?perPage=${per_page}&page=${page_num}`;

  const response = await page.goto(url, { waitUntil: 'networkidle' });

  if (!response || !response.ok()) {
    throw new Error(`API error: ${response?.status()}`);
  }

  const content = await page.content();
  const match = content.match(/<pre[^>]*>([^<]+)<\/pre>/);

  if (!match) {
    throw new Error('Could not parse API response');
  }

  const jsonStr = match[1];
  const data = JSON.parse(jsonStr);

  return {
    products: data.results || [],
    total: data.total || 0,
  };
}

/**
 * Parse product from API response
 */
function parseProduct(apiProduct: any, index: number): Product {
  const sku = apiProduct.code || apiProduct.id || `prod-${index}`;
  const title = apiProduct.name || apiProduct.title || 'Unknown Product';
  const price = parseFloat(apiProduct.price) || 0;
  const imageUrl = apiProduct.image?.url || apiProduct.imageUrl || '';
  const url = `https://portalb2b.neosolar.com.br/produto/${sku}`;

  return {
    id: String(index),
    sku: String(sku),
    title,
    price,
    url,
    imageUrl,
    category: categorizeProduct(title),
  };
}

/**
 * Main extraction via API
 */
async function extractAllProductsViaAPI(): Promise<void> {
  let browser: Browser | null = null;
  const allProducts: Product[] = [];
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

    const alreadyLoggedIn = await isLoggedIn(page);
    console.log(alreadyLoggedIn ? '✅ Usuário já logado' : '🔐 Fazendo login...');

    if (!alreadyLoggedIn) {
      await login(page, email, password);
      await page.waitForTimeout(1000);
    }

    // Query API
    console.log('\n📡 Consultando API de produtos...');
    
    let pageNum = 1;
    let totalProducts = 0;
    const perPage = 100;

    while (true) {
      try {
        console.log(`\n📄 Página ${pageNum}:`);
        const { products, total } = await queryProductsAPI(page, pageNum, perPage);

        if (!products || products.length === 0) {
          console.log('  ℹ️  Nenhum produto nesta página');
          break;
        }

        totalProducts = total;
        stats.totalAvailable = total;

        console.log(`  ✅ ${products.length} produtos carregados`);

        // Parse products
        let addedCount = 0;
        for (let i = 0; i < products.length; i++) {
          const product = parseProduct(products[i], allProducts.length + i);
          allProducts.push(product);
          addedCount++;
        }

        console.log(`  📊 Total acumulado: ${allProducts.length}/${totalProducts}`);

        // Check if we've got all products
        if (allProducts.length >= totalProducts) {
          console.log(`  ✅ Todos os ${totalProducts} produtos extraídos!`);
          break;
        }

        pageNum++;

        // Safety limit
        if (pageNum > 50) {
          console.log('  ⚠️  Limite de páginas atingido');
          break;
        }

      } catch (error) {
        console.error(`  ❌ Erro ao processar página ${pageNum}:`, error);
        break;
      }

      await page.waitForTimeout(500);
    }

    // Re-index products
    allProducts.forEach((p, i) => {
      p.id = String(i);
    });

    // Count by category
    for (const product of allProducts) {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    }

    stats.totalExtracted = allProducts.length;
    stats.endTime = Date.now();
    stats.duration = (stats.endTime - stats.startTime) / 1000;

    // Save files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const jsonFile = path.join(OUTPUT_DIR, `products-api-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(allProducts, null, 2));
    console.log(`\n✅ JSON: ${jsonFile}`);

    const csvFile = path.join(OUTPUT_DIR, `products-api-${timestamp}.csv`);
    const csvContent = [
      ['ID', 'SKU', 'Título', 'Preço', 'URL', 'Categoria'].join(','),
      ...allProducts.map(p =>
        [p.id, p.sku, `"${p.title.replace(/"/g, '""')}"`, p.price, p.url, p.category].join(',')
      ),
    ].join('\n');
    fs.writeFileSync(csvFile, csvContent);
    console.log(`✅ CSV: ${csvFile}`);

    const statsFile = path.join(OUTPUT_DIR, `api-extraction-stats-${timestamp}.json`);
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

    // Print summary
    console.log(`
╔══════════════════════════════════════════════════╗
║   ✨ EXTRAÇÃO VIA API - NEOSOLAR B2B           ║
╚══════════════════════════════════════════════════╝

📊 ESTATÍSTICAS:
  • Total extraído: ${stats.totalExtracted}
  • Total disponível: ${stats.totalAvailable}
  • Cobertura: ${((stats.totalExtracted / stats.totalAvailable) * 100).toFixed(1)}%
  • Duração: ${stats.duration?.toFixed(2)}s

📂 CATEGORIAS:
${Object.entries(stats.categories)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, count]) => `  • ${cat}: ${count}`)
  .join('\n')}

📁 ARQUIVOS GERADOS:
  • JSON: ${path.basename(jsonFile)}
  • CSV: ${path.basename(csvFile)}
  • Stats: ${path.basename(statsFile)}

✅ Extraction concluída com sucesso!
    `);

  } catch (error) {
    console.error('❌ Erro na extração:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

extractAllProductsViaAPI().catch(console.error);
