#!/usr/bin/env node

/**
 * Extract All Distributors - Automated Multi-Distributor Extraction
 * 
 * Extracts products from all 7 distributors sequentially
 * Uses credentials from environment variables
 * 
 * Usage:
 *   npx tsx scripts/extract-all-distributors.ts
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface Distributor {
  name: string;
  url: string;
  email: string;
  password: string;
  emailEnvVar: string;
  passwordEnvVar: string;
}

interface Product {
  id: string;
  sku: string;
  title: string;
  price: number;
  url: string;
  imageUrl: string;
  category: string;
  distributor: string;
}

interface ExtractionResult {
  distributor: string;
  success: boolean;
  products: Product[];
  duration: number;
  error?: string;
  timestamp: string;
}

const DISTRIBUTORS: Distributor[] = [
  {
    name: 'neosolar',
    url: 'https://portalb2b.neosolar.com.br/',
    email: '',
    password: '',
    emailEnvVar: 'NEOSOLAR_EMAIL',
    passwordEnvVar: 'NEOSOLAR_PASSWORD',
  },
  {
    name: 'solfacil',
    url: 'https://integrador.solfacil.com.br/', // Login via SSO: sso.solfacil.com.br
    email: '',
    password: '',
    emailEnvVar: 'SOLFACIL_EMAIL',
    passwordEnvVar: 'SOLFACIL_PASSWORD',
  },
  {
    name: 'fotus',
    url: 'https://app.fotus.com.br/login', // UPDATED: Direct login page
    email: '',
    password: '',
    emailEnvVar: 'FOTUS_EMAIL',
    passwordEnvVar: 'FOTUS_PASSWORD',
  },
  {
    name: 'odex',
    url: 'https://odex.com.br/',
    email: '',
    password: '',
    emailEnvVar: 'ODEX_EMAIL',
    passwordEnvVar: 'ODEX_PASSWORD',
  },
  {
    name: 'edeltec',
    url: 'https://edeltecsolar.com.br/',
    email: '',
    password: '',
    emailEnvVar: 'EDELTEC_EMAIL',
    passwordEnvVar: 'EDELTEC_PASSWORD',
  },
  {
    name: 'fortlev',
    url: 'https://fortlevsolar.app/login', // UPDATED: Fortlev Solar App
    email: '',
    password: '',
    emailEnvVar: 'FORTLEV_EMAIL',
    passwordEnvVar: 'FORTLEV_PASSWORD',
  },
  {
    name: 'dynamis',
    url: 'https://app.dynamisimportadora.com.br/', // UPDATED: Dynamis App
    email: '',
    password: '',
    emailEnvVar: 'DYNAMIS_EMAIL',
    passwordEnvVar: 'DYNAMIS_PASSWORD',
  },
];

const OUTPUT_DIR = path.join(process.cwd(), 'output', 'multi-distributor');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function categorizeProduct(title: string): string {
  const lowerTitle = title.toLowerCase();
  const categories: { [key: string]: string[] } = {
    bateria: ['bateria', 'estacionária', 'moura', 'heliar', 'freedom', 'fulguris', 'lifepo4'],
    bomba: ['bomba', 'solar', 'anauger', 'agua', 'piscina', 'submersa'],
    painel: ['painel', 'solar', 'fotovoltáico', 'módulo', 'placa'],
    inversor: ['inversor', 'inverter', 'isolada', 'hybrid', 'grid-tie', 'fronius', 'growatt'],
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
      const hasLogout = !!document.querySelector('a[href*="logout"], a[href*="sair"]');
      const hasUserMenu = !!document.querySelector('.user-menu, [class*="profile"], [class*="account"]');
      const hasProducts = document.querySelectorAll('a[href*="produto"], a[href*="product"]').length > 0;
      return hasLogout || hasUserMenu || hasProducts;
    });
  } catch {
    return false;
  }
}

async function attemptLogin(page: Page, email: string, password: string): Promise<boolean> {
  try {
    // Try to find and click login button
    const loginButtons = [
      'button:has-text("Entrar")',
      'button:has-text("Login")',
      'a:has-text("Entrar")',
      'a:has-text("Login")',
      '[type="submit"]',
    ];

    for (const selector of loginButtons) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    // Fill email
    const emailInputs = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="e-mail" i]',
    ];

    for (const selector of emailInputs) {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill(email);
        break;
      }
    }

    // Fill password
    const passwordInputs = [
      'input[type="password"]',
      'input[name="password"]',
      'input[name="senha"]',
      'input[placeholder*="senha" i]',
      'input[placeholder*="password" i]',
    ];

    for (const selector of passwordInputs) {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill(password);
        break;
      }
    }

    // Submit
    try {
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      return true;
    } catch (e) {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function extractProducts(page: Page, distributorName: string): Promise<Product[]> {
  // Scroll to trigger lazy loading
  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(200);
  }

  // Extract products from DOM
  const products = await page.evaluate((distName) => {
    const items: any[] = [];
    
    // Try multiple product link patterns
    const productSelectors = [
      'a[href*="/produto"]',
      'a[href*="/product"]',
      'a[href*="item"]',
      '[data-product]',
    ];

    let productLinks: Element[] = [];
    for (const selector of productSelectors) {
      const found = Array.from(document.querySelectorAll(selector));
      if (found.length > 0) {
        productLinks = found;
        break;
      }
    }

    productLinks.forEach((link, index) => {
      try {
        const href = (link as HTMLAnchorElement).href;
        
        // Extract SKU
        const skuMatch = href.match(/\d+/);
        const sku = skuMatch ? skuMatch[0] : `${distName}-${index}`;

        // Extract title
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

        // Extract image
        let imageUrl = '';
        const parent = link.closest('[class*="product"], [class*="card"], li');
        if (parent) {
          const img = parent.querySelector('img');
          if (img && (img as HTMLImageElement).src) {
            imageUrl = (img as HTMLImageElement).src;
          }
        }

        // Extract price
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
          distributor: distName,
        });
      } catch (e) {
        // Skip
      }
    });

    return items;
  }, distributorName);

  // Deduplicate and categorize
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

async function extractFromDistributor(distributor: Distributor): Promise<ExtractionResult> {
  const startTime = Date.now();
  const result: ExtractionResult = {
    distributor: distributor.name,
    success: false,
    products: [],
    duration: 0,
    timestamp: new Date().toISOString(),
  };

  let browser: Browser | null = null;

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 ${distributor.name.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`🌐 URL: ${distributor.url}`);
    console.log(`👤 User: ${distributor.email}`);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate
    await page.goto(distributor.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`✅ Página carregada`);

    // Check if already logged in
    const alreadyLoggedIn = await isLoggedIn(page);
    
    if (!alreadyLoggedIn) {
      console.log(`🔐 Tentando login...`);
      const loginSuccess = await attemptLogin(page, distributor.email, distributor.password);
      
      if (!loginSuccess) {
        result.error = 'Login failed - could not find form or submit';
        console.log(`❌ Login falhou`);
        return result;
      }

      await page.waitForTimeout(2000);
      
      // Check login success
      const nowLoggedIn = await isLoggedIn(page);
      if (!nowLoggedIn) {
        result.error = 'Login failed - credentials may be incorrect';
        console.log(`❌ Credenciais inválidas ou erro no login`);
        return result;
      }
    }

    console.log(`✅ Login bem-sucedido`);

    // Extract products
    console.log(`📦 Extraindo produtos...`);
    const products = await extractProducts(page, distributor.name);
    
    result.products = products;
    result.success = true;
    result.duration = (Date.now() - startTime) / 1000;

    console.log(`✅ ${products.length} produtos extraídos em ${result.duration.toFixed(2)}s`);

    // Save individual file
    const outputDir = path.join(process.cwd(), 'output', distributor.name);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonFile = path.join(outputDir, `products-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(products, null, 2));
    console.log(`💾 Salvo: ${jsonFile}`);

  } catch (error) {
    result.error = (error as Error).message;
    result.duration = (Date.now() - startTime) / 1000;
    console.log(`❌ Erro: ${result.error}`);
  } finally {
    if (browser) await browser.close();
  }

  return result;
}

async function extractAllDistributors(): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 EXTRAÇÃO AUTOMÁTICA - TODOS OS DISTRIBUIDORES        ║
╚════════════════════════════════════════════════════════════╝
  `);

  const startTime = Date.now();
  const results: ExtractionResult[] = [];

  // Load credentials from environment
  for (const distributor of DISTRIBUTORS) {
    distributor.email = process.env[distributor.emailEnvVar] || '';
    distributor.password = process.env[distributor.passwordEnvVar] || '';

    if (!distributor.email || !distributor.password) {
      console.log(`⚠️  ${distributor.name}: Credenciais não encontradas (${distributor.emailEnvVar}, ${distributor.passwordEnvVar})`);
      results.push({
        distributor: distributor.name,
        success: false,
        products: [],
        duration: 0,
        error: 'Missing credentials',
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    const result = await extractFromDistributor(distributor);
    results.push(result);

    // Wait between distributors
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const totalDuration = (Date.now() - startTime) / 1000;

  // Aggregate results
  const allProducts: Product[] = [];
  results.forEach(r => allProducts.push(...r.products));

  // Save combined results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const combinedFile = path.join(OUTPUT_DIR, `all-products-${timestamp}.json`);
  fs.writeFileSync(combinedFile, JSON.stringify(allProducts, null, 2));

  const summaryFile = path.join(OUTPUT_DIR, `extraction-summary-${timestamp}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));

  // Print summary
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  ✨ EXTRAÇÃO COMPLETA                                     ║
╚════════════════════════════════════════════════════════════╝

📊 RESUMO:
  • Duração total: ${totalDuration.toFixed(2)}s
  • Distribuidores: ${results.length}
  • Sucessos: ${results.filter(r => r.success).length}
  • Falhas: ${results.filter(r => !r.success).length}
  • Total de produtos: ${allProducts.length}

📋 RESULTADOS POR DISTRIBUIDOR:
${results.map(r => {
  const icon = r.success ? '✅' : '❌';
  const products = r.success ? `${r.products.length} produtos` : r.error;
  return `  ${icon} ${r.distributor}: ${products} (${r.duration.toFixed(2)}s)`;
}).join('\n')}

📁 ARQUIVOS GERADOS:
  • Combinado: ${combinedFile}
  • Resumo: ${summaryFile}
  • Individuais: output/{distribuidor}/products-*.json

🎉 Processo concluído!
  `);
}

// Run
extractAllDistributors().catch(console.error);
