#!/usr/bin/env tsx
/**
 * Inspecionar estrutura de produtos Neosolar
 * Salva o HTML da página de produtos para análise
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function inspectNeosolar() {
  console.log('🔍 Inspecting Neosolar product page...\n');
  
  const email = process.env.EMAIL_NEOSOLAR;
  const password = process.env.PASSWORD_NEOSOLAR;
  
  if (!email || !password) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    
    // Login
    await page.goto('https://portalb2b.neosolar.com.br/login', { waitUntil: 'networkidle' });
    await page.locator('input[name="username"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
      page.locator('button[type="submit"]').click(),
    ]);

    console.log('✅ Logged in');

    // Go to products page
    await page.goto('https://portalb2b.neosolar.com.br/produtos', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    console.log('📄 Saving page HTML for inspection...');
    
    const html = await page.content();
    fs.writeFileSync(path.join(__dirname, 'neosolar-products-page.html'), html);
    console.log('✅ Saved to neosolar-products-page.html');

    // Extract page structure info
    const info = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        divs: document.querySelectorAll('div').length,
        tables: document.querySelectorAll('table').length,
        bodyClasses: document.body.className,
        mainContent: document.querySelector('main')?.outerHTML?.substring(0, 500),
        // Look for specific patterns
        itemPatterns: {
          'data-id divs': document.querySelectorAll('[data-id]').length,
          'data-product divs': document.querySelectorAll('[data-product]').length,
          'product class': document.querySelectorAll('.product').length,
          'item class': document.querySelectorAll('.item').length,
          'card class': document.querySelectorAll('.card').length,
          'grid-item class': document.querySelectorAll('.grid-item').length,
          'col class': document.querySelectorAll('.col').length,
          'row class': document.querySelectorAll('.row').length,
        }
      };
    });

    console.log('\n📊 Page structure:');
    console.log(`   Title: ${info.title}`);
    console.log(`   URL: ${info.url}`);
    console.log(`   Total divs: ${info.divs}`);
    console.log(`   Total tables: ${info.tables}`);
    console.log(`   Body classes: ${info.bodyClasses}`);
    
    console.log('\n🎯 Item patterns found:');
    Object.entries(info.itemPatterns).forEach(([key, count]) => {
      if (count > 0) {
        console.log(`   ✅ ${key}: ${count}`);
      }
    });

    // Save screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'neosolar-products-screenshot.png'),
      fullPage: true,
    });
    console.log('\n📸 Saved screenshot to neosolar-products-screenshot.png');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await browser.close();
  }
}

inspectNeosolar().catch(console.error);
