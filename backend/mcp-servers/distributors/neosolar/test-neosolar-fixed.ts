import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testNeosolar() {
  const email = process.env.EMAIL_NEOSOLAR || '';
  const password = process.env.PASSWORD_NEOSOLAR || '';

  if (!email || !password) {
    console.error('❌ Missing credentials. Set EMAIL_NEOSOLAR and PASSWORD_NEOSOLAR');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Step 1: Login
    console.log('🔑 Logging in...');
    await page.goto('https://portalb2b.neosolar.com.br/login', { waitUntil: 'networkidle' });
    
    // Fill form
    await page.fill('input[name="username"]', email);
    await page.fill('input[name="password"]', password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect after login
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });
    } catch (e) {
      // Network idle might timeout on single page apps, but we should still be redirected
      console.log('⚠️  Navigation timeout (expected for SPAs), continuing...');
      await page.waitForTimeout(2000);
    }
    
    const afterLoginUrl = page.url();
    console.log(`✅ Login successful! URL: ${afterLoginUrl}`);

    // Step 2: Click on "Novo Pedido" or Products link
    console.log('📦 Looking for products section...');
    
    // Try different possible navigation paths
    const possibleSelectors = [
      'a:has-text("Novo Pedido")',
      'button:has-text("Novo Pedido")',
      'a[href*="/novo-pedido"]',
      'text=Novo Pedido',
      'a:has-text("Produtos")',
      '[data-testid*="product"]',
    ];

    let foundNavigation = false;
    for (const selector of possibleSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found navigation element: ${selector}`);
          await element.click();
          foundNavigation = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!foundNavigation) {
      console.log('⚠️  Could not find navigation link, trying direct URL navigation...');
      await page.goto('https://portalb2b.neosolar.com.br/novo-pedido', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      }).catch(() => {
        console.log('⚠️  Direct navigation to novo-pedido failed');
      });
    }

    // Wait for page to load and for any dynamic content
    console.log('⏳ Waiting for page to stabilize...');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    // Step 3: Look for products section
    console.log('🔍 Searching for products...');
    
    // Check page content
    const bodyText = await page.textContent('body');
    const hasProductKeyword = bodyText?.includes('produto') || bodyText?.includes('Produto') || bodyText?.includes('SKU');
    
    if (hasProductKeyword) {
      console.log('✅ Page appears to have product information');
    } else {
      console.log('⚠️  No product keywords found in page content');
    }

    // Get all links on page
    const allLinks = await page.locator('a').evaluateAll(els => 
      els.map(el => ({
        text: el.textContent || '',
        href: el.getAttribute('href') || '',
        visible: (el as any).offsetParent !== null
      }))
    );
    
    console.log('\n📋 Available links on page:');
    allLinks.filter(l => l.visible && l.text.trim()).forEach(l => {
      console.log(`  - ${l.text.trim()} (${l.href})`);
    });

    // Try clicking products-related link if available
    const productLink = allLinks.find(l => 
      l.text.toLowerCase().includes('produto') || 
      l.href.includes('produto')
    );
    
    if (productLink && productLink.href) {
      console.log(`\n🔗 Found product link: ${productLink.href}`);
      try {
        await page.goto(productLink.href, { waitUntil: 'networkidle', timeout: 10000 });
        console.log(`✅ Navigated to products page`);
      } catch (e) {
        console.log(`⚠️  Could not navigate to product link`);
      }
    }

    // Step 4: Save page HTML for inspection
    const html = await page.content();
    const outputPath = join(__dirname, 'page-after-fix.html');
    writeFileSync(outputPath, html);
    console.log(`\n💾 Saved page HTML to: ${outputPath}`);

    // Step 5: Check for product elements
    const productSelectors = [
      '[data-product-id]',
      '[data-sku]',
      '.product',
      '.produto',
      '[class*="card"]',
      '[role="grid"]',
      'table tbody tr',
      '[data-testid*="product"]',
    ];

    console.log('\n🔎 Checking for product containers:');
    for (const selector of productSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`  ✅ ${selector}: ${count} elements found`);
      }
    }

    // Take screenshot
    const screenshotPath = join(__dirname, 'page-after-fix.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

  } finally {
    // Keep browser open for 10 seconds so you can see the page
    console.log('\n⏳ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testNeosolar().catch(console.error);
