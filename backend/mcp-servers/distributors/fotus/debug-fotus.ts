/**
 * Debug script for Fotus Portal
 * Maps HTML structure and selectors
 * Usage: EMAIL=user@example.com PASSWORD=password npx tsx debug-fotus.ts
 */

import { chromium, type Browser, type Page } from 'playwright';
import { promises as fs } from 'fs';

async function debug(): Promise<void> {
  const email = process.env.EMAIL || '';
  const password = process.env.PASSWORD || '';
  
  if (!email || !password) {
    console.error('Please set EMAIL and PASSWORD environment variables');
    process.exit(1);
  }
  
  let browser: Browser | undefined;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Opening Fotus login page...');
    await page.goto('https://www.fotus.com.br/login', { waitUntil: 'networkidle' });
    
    // Save login page
    await page.screenshot({ path: 'debug-login-page.png' });
    const loginHtml = await page.content();
    await fs.writeFile('debug-login-page.html', loginHtml);
    console.log('✅ Login page saved: debug-login-page.html');
    
    // Attempt login
    console.log('🔑 Attempting login...');
    await page.fill('input[name="email"], input[type="email"]', email);
    await page.fill('input[name="password"], input[type="password"]', password);
    await page.click('button[type="submit"], .btn-login, .login-button');
    
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      console.warn('⚠️  Navigation timeout, checking current page...');
    }
    
    // Wait a bit for JavaScript to settle
    await page.waitForTimeout(3000);
    
    // Check if login was successful
    const url = page.url();
    console.log('📍 Current URL:', url);
    
    if (url.includes('/login') || url.includes('/signin')) {
      console.error('❌ Still on login page - credentials may be incorrect');
    } else {
      console.log('✅ Successfully navigated past login page');
      
      // Save homepage
      await page.screenshot({ path: 'debug-home-page.png' });
      const homeHtml = await page.content();
      await fs.writeFile('debug-home-page.html', homeHtml);
      console.log('✅ Home page saved: debug-home-page.html');
      
      // Navigate to products
      console.log('🛍️  Navigating to products...');
      await page.goto('https://www.fotus.com.br/produtos', { waitUntil: 'networkidle' });
      
      // Save products page
      await page.screenshot({ path: 'debug-products-page.png' });
      const productsHtml = await page.content();
      await fs.writeFile('debug-products-page.html', productsHtml);
      console.log('✅ Products page saved: debug-products-page.html');
      
      // Extract product selectors
      console.log('🔎 Analyzing product structure...');
      const analysis = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.product-card, .product-item, [data-product]');
        console.log('Found product elements:', productElements.length);
        
        if (productElements.length === 0) {
          // Try to find other patterns
          const possibleSelectors = [
            '.product',
            '.item',
            '[data-product]',
            '[data-item]',
            '.product-card',
            '.product-item',
          ];
          
          const found = possibleSelectors.filter(sel => document.querySelectorAll(sel).length > 0);
          return { warning: 'No products found with selector, try these:', suggestions: found };
        }
        
        const firstProduct = productElements[0];
        return {
          totalFound: productElements.length,
          firstProduct: {
            html: firstProduct.outerHTML.substring(0, 500),
            innerText: firstProduct.innerText?.substring(0, 200) || '',
          },
        };
      });
      
      console.log('📊 Analysis:', JSON.stringify(analysis, null, 2));
    }
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debug().catch(console.error);
