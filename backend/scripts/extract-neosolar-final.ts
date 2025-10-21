#!/usr/bin/env node

/**
 * Neosolar Extract - Final Version
 * Extracts products from Neosolar B2B Portal
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Product {
  id: string;
  sku: string;
  title: string;
  price: number;
  url: string;
  imageUrl: string;
  category: string;
}

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  warn: (msg: string) => console.warn(`⚠️  ${msg}`),
  step: (num: number, msg: string) => console.log(`\n[${num}] ${msg}`),
};

async function extractNeosolar() {
  const email = process.env.NEOSOLAR_EMAIL || 'product@boldsbrain.ai';
  const password = process.env.NEOSOLAR_PASSWORD || 'Rookie@010100';
  const startTime = Date.now();

  log.info(`🚀 Iniciando extração Neosolar B2B`);
  log.info(`Email: ${email}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Step 1: Navigate to portal
    log.step(1, 'Navegando para portal B2B...');
    await page.goto('https://portalb2b.neosolar.com.br/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    log.success('Página carregada');

    // Step 2: Check if login is needed
    log.step(2, 'Verificando autenticação...');
    
    const isLoggedIn = await page.evaluate(() => {
      // Check for logout button or user menu
      const hasLogout = !!document.querySelector('a[href*="logout"]');
      const hasUserMenu = !!document.querySelector('.user-menu, [class*="profile"]');
      const hasProducts = document.querySelectorAll('a[href*="/produto"]').length > 0;
      
      return hasLogout || hasUserMenu || hasProducts;
    });

    if (!isLoggedIn) {
      log.warn('Não logado. Tentando fazer login...');
      
      // Find and click login button
      const loginButton = await page.$('a[href="/login"], button:has-text("Fazer login"), button:has-text("Entrar")');
      if (loginButton) {
        await loginButton.click();
        await page.waitForLoadState('domcontentloaded');
      } else {
        log.warn('Botão de login não encontrado, continuando...');
      }

      // Wait for login form
      await page.waitForTimeout(2000);

      // Look for login inputs
      const emailInput = await page.$('input[name="email"], input[type="email"], input[placeholder*="email" i]');
      const passwordInput = await page.$('input[name="password"], input[type="password"]');

      if (emailInput && passwordInput) {
        log.info('Preenchendo credenciais...');
        await emailInput.fill(email);
        await passwordInput.fill(password);

        // Submit form
        const submitButton = await page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
        } else {
          await page.press('input[type="password"]', 'Enter');
        }

        // Wait for redirect
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        
        log.success('Login realizado');
      } else {
        log.warn('Campos de login não encontrados');
      }
    } else {
      log.success('Usuário já logado');
    }

    // Step 3: Extract products from current page
    log.step(3, 'Extraindo produtos...');
    
    // Navigate to products page if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('novo-pedido')) {
      log.info('Navegando para página de produtos...');
      await page.goto('https://portalb2b.neosolar.com.br/novo-pedido', {
        waitUntil: 'domcontentloaded',
      });
    }

    // Scroll to load all products
    log.info('Carregando todos os produtos (scrolling)...');
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(300);
    }

    // Extract all products
    const products: Product[] = await page.evaluate(() => {
      const items: any[] = [];
      
      // Find all product links
      const productLinks = document.querySelectorAll('a[href*="/produto"]');
      
      productLinks.forEach((link: any, index) => {
        try {
          // Get the product card container
          const container = link.closest('[class*="Grid"], [class*="card"], article, div[class*="item"]');
          
          if (!container) return;
          
          const title = link.querySelector('h3, .title, [class*="title"], span')?.textContent?.trim() || 
                        link.textContent?.trim() || '';
          const image = container.querySelector('img');
          const imageUrl = image?.src || '';
          const url = link.href;
          
          // Extract SKU from URL or attributes
          let sku = '';
          const skuMatch = url.match(/\/(\d+)$/);
          if (skuMatch) {
            sku = skuMatch[1];
          } else {
            sku = `SKU-${index}`;
          }
          
          if (title && sku) {
            items.push({
              id: `${index}`,
              sku,
              title,
              url,
              imageUrl,
              priceText: '',
            });
          }
        } catch (e) {
          // Skip errors
        }
      });
      
      return items;
    });

    log.success(`Encontrados ${products.length} produtos`);

    // Step 4: Parse and save results
    log.step(4, 'Salvando resultados...');

    const parsedProducts = products.map((p) => ({
      ...p,
      price: 0,
      category: categorizeProduct(p.title),
    }));

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
    log.info('\n' + '='.repeat(70));
    log.info('✨ EXTRAÇÃO CONCLUÍDA - NEOSOLAR B2B');
    log.info('='.repeat(70));
    log.info(`Total de produtos: ${parsedProducts.length}`);
    log.info(`Duração: ${(duration / 1000).toFixed(2)}s`);
    log.info(`Arquivos:`);
    log.info(`  📄 JSON: ${jsonPath}`);
    log.info(`  📊 CSV:  ${csvPath}`);
    log.info('='.repeat(70));

    // Print samples
    if (parsedProducts.length > 0) {
      log.info('\n📌 Primeiros 5 produtos:');
      parsedProducts.slice(0, 5).forEach((p, i) => {
        log.info(`${i + 1}. ${p.title} (SKU: ${p.sku})`);
      });
    }

  } catch (error) {
    log.error(`Erro: ${error instanceof Error ? error.message : String(error)}`);
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
  if (lower.includes('bateria')) return 'bateria';
  if (lower.includes('bomba')) return 'bomba';
  if (lower.includes('cabo') || lower.includes('conector')) return 'cabo';
  if (lower.includes('inversor')) return 'inversor';
  if (lower.includes('painel') || lower.includes('módulo')) return 'painel';
  if (lower.includes('estrutura') || lower.includes('suporte')) return 'estrutura';
  if (lower.includes('carregador')) return 'carregador';
  if (lower.includes('carro elétrico')) return 'veiculo_eletrico';
  return 'outros';
}

function convertToCSV(products: Product[]): string {
  const headers = ['SKU', 'Título', 'Categoria', 'URL', 'Imagem'];
  const rows = products.map(p => [
    p.sku,
    escapeCSV(p.title),
    p.category,
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

extractNeosolar().catch(error => {
  console.error('Fatal:', error);
  process.exit(1);
});
