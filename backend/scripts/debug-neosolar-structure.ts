#!/usr/bin/env node

/**
 * Debug Neosolar Portal Structure
 * Analyzes HTML to understand pagination and product list structure
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const PORTAL_URL = 'https://portalb2b.neosolar.com.br/';
const OUTPUT_DIR = path.join(process.cwd(), 'output', 'neosolar');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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

async function analyzePortalStructure(page: Page): Promise<void> {
  console.log('🔍 Analisando estrutura do portal...\n');

  // Get HTML structure info
  const info = await page.evaluate(() => {
    const analysis: any = {
      productLinks: document.querySelectorAll('a[href*="/produto"]').length,
      hiddenElements: document.querySelectorAll('[style*="display: none"], [hidden]').length,
      dataAttributes: {
        dataPage: document.querySelectorAll('[data-page], [data-page-size], [data-total]').length,
        dataProduct: document.querySelectorAll('[data-product], [data-sku], [data-id]').length,
      },
      containers: {
        main: Array.from(document.querySelectorAll('main, [role="main"]')).map((el: any) => ({
          tag: el.tagName,
          class: el.className,
          children: el.children.length,
        })),
        grid: Array.from(document.querySelectorAll('[class*="grid"], [class*="list"], [role="grid"], [role="list"]')).map((el: any) => ({
          tag: el.tagName,
          class: el.className,
          items: el.querySelectorAll('[class*="item"], [role="option"], li').length,
        })),
      },
      scripts: Array.from(document.querySelectorAll('script')).map((el: any) => {
        const src = el.src || el.textContent?.substring(0, 100) || '';
        return { src, hasData: src.includes('data') || src.includes('products') };
      }).slice(0, 5),
    };

    // Check for React/Vue/Angular
    const html = document.documentElement.outerHTML;
    const hasReact = html.includes('react') || html.includes('__react');
    const hasVue = html.includes('vue') || html.includes('__vue');
    const hasAngular = html.includes('angular') || html.includes('ng-');

    analysis.frameworks = { hasReact, hasVue, hasAngular };

    // Look for pagination info
    const paginationElements = document.querySelectorAll(
      '[class*="paginat"], [class*="pagin"], [role="navigation"], .pagination, [aria-label*="paginat"]'
    );
    analysis.paginationInfo = paginationElements.length;
    analysis.paginationElements = Array.from(paginationElements).map((el: any) => ({
      tag: el.tagName,
      class: el.className,
      text: el.textContent?.substring(0, 50),
    }));

    return analysis;
  });

  console.log('📊 Informações da página:');
  console.log(`  • Links de produtos: ${info.productLinks}`);
  console.log(`  • Elementos ocultos: ${info.hiddenElements}`);
  console.log(`  • Elementos com data-attributes: ${info.dataAttributes.dataPage + info.dataAttributes.dataProduct}`);
  console.log(`\n🎯 Containers encontrados:`);
  info.containers.grid.forEach((grid: any, idx: number) => {
    console.log(`  ${idx + 1}. <${grid.tag} class="${grid.class}"> com ${grid.items} itens`);
  });

  console.log(`\n🔧 Frameworks detectados:`);
  console.log(`  • React: ${info.frameworks.hasReact ? '✅' : '❌'}`);
  console.log(`  • Vue: ${info.frameworks.hasVue ? '✅' : '❌'}`);
  console.log(`  • Angular: ${info.frameworks.hasAngular ? '✅' : '❌'}`);

  if (info.paginationInfo > 0) {
    console.log(`\n📖 Paginação encontrada:`);
    info.paginationElements.forEach((el: any, idx: number) => {
      console.log(`  ${idx + 1}. <${el.tag}> "${el.text}"`);
    });
  } else {
    console.log(`\n📖 Nenhum elemento de paginação óbvio encontrado`);
  }

  // Check for infinite scroll indicators
  const hasIntersectionObserver = await page.evaluate(() => {
    return typeof (window as any).IntersectionObserver !== 'undefined';
  });

  console.log(`\n🔄 Scroll infinito:`);
  console.log(`  • IntersectionObserver: ${hasIntersectionObserver ? '✅ (pode usar lazy loading)' : '❌'}`);

  // Save full HTML for manual inspection
  const htmlContent = await page.content();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlFile = path.join(OUTPUT_DIR, `portal-structure-${timestamp}.html`);
  fs.writeFileSync(htmlFile, htmlContent);
  console.log(`\n💾 HTML completo: ${htmlFile}`);

  // Extract window data
  const windowData = await page.evaluate(() => {
    const result: any = {};

    // Check for global data variables
    Object.keys(window).forEach(key => {
      if (
        (key.includes('product') || key.includes('data') || key.includes('store')) &&
        !key.startsWith('_') &&
        key.length < 50
      ) {
        const val = (window as any)[key];
        if (typeof val === 'object' && val !== null) {
          try {
            result[key] = JSON.stringify(val).substring(0, 200);
          } catch (e) {
            // Ignore
          }
        }
      }
    });

    return result;
  });

  if (Object.keys(windowData).length > 0) {
    console.log(`\n🌐 Dados globais encontrados:`);
    Object.entries(windowData).forEach(([key, value]) => {
      console.log(`  • ${key}: ${value}`);
    });
  }
}

async function main(): Promise<void> {
  let browser: Browser | null = null;

  try {
    const email = process.env.NEOSOLAR_EMAIL || 'product@boldsbrain.ai';
    const password = process.env.NEOSOLAR_PASSWORD || 'Rookie@010100';

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🌐 Conectando ao portal...\n');
    await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const alreadyLoggedIn = await isLoggedIn(page);
    if (!alreadyLoggedIn) {
      await login(page, email, password);
      await page.waitForTimeout(1000);
    }

    // Analyze
    await analyzePortalStructure(page);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (browser) await browser.close();
  }
}

main();
