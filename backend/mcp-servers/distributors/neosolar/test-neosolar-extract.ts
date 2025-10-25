import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testNeosolarExtraction() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Login
    console.log('🔑 Logging in...');
    await page.goto('https://portalb2b.neosolar.com.br/login', { waitUntil: 'load' });

    const username = process.env.EMAIL_NEOSOLAR;
    const password = process.env.PASSWORD_NEOSOLAR;

    if (!username || !password) {
      throw new Error('Missing credentials: EMAIL_NEOSOLAR, PASSWORD_NEOSOLAR');
    }

    // Fill login form
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to novo-pedido
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });
    } catch (e) {
      console.log('⚠️  Navigation timeout (expected for SPAs), continuing...');
      await page.waitForTimeout(2000);
    }

    const url1 = page.url();
    console.log(`✅ Login successful! URL: ${url1}`);

    // 2. Navigate to products page
    console.log('📦 Navigating to products page...');
    
    // Click on "Voltar para lista de produtos" link
    const productLink = await page.$('a:has-text("Voltar para lista de produtos")');
    if (productLink) {
      console.log('✅ Found "Voltar para lista de produtos" link, clicking...');
      await productLink.click();
      
      try {
        await page.waitForNavigation({ waitUntil: 'load', timeout: 10000 });
      } catch (e) {
        console.log('⚠️  Navigation timeout, continuing...');
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('⚠️  Link not found, trying direct navigation...');
      await page.goto('https://portalb2b.neosolar.com.br/novo-pedido', { waitUntil: 'load' });
    }

    const url2 = page.url();
    console.log(`📍 Current URL: ${url2}`);

    // 3. Wait for page to load
    console.log('⏳ Waiting for page to stabilize...');
    await page.waitForTimeout(3000);

    // 4. Check for products
    console.log('🔍 Looking for products...');

    // Try multiple selectors to find products
    const selectors = [
      '[class*="product"]',
      '[class*="item"]',
      'div[class*="card"]',
      '[data-testid*="product"]',
      'div[class*="grid"]',
      'article',
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ Found ${count} elements with selector: ${selector}`);
      }
    }

    // 5. Try to extract all text content to understand page structure
    const pageContent = await page.content();
    const hasProductKeywords = pageContent.includes('SKU') || 
                               pageContent.includes('produto') || 
                               pageContent.includes('preço') ||
                               pageContent.includes('R$');
    
    if (hasProductKeywords) {
      console.log('✅ Page contains product-related keywords');
    }

    // 6. Save full page HTML for inspection
    const htmlPath = join(__dirname, 'page-products-full.html');
    writeFileSync(htmlPath, pageContent);
    console.log(`💾 Saved page HTML to: ${htmlPath}`);

    // 7. Take screenshot
    const screenshotPath = join(__dirname, 'page-products-full.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // 8. Try to find grid/table structures
    console.log('📊 Searching for data structures...');
    
    // Look for any div that might contain products
    const divCount = await page.locator('div').count();
    console.log(`   Total divs on page: ${divCount}`);

    // Look for common product data patterns
    const prices = await page.locator('text=/R\\$|preço|price/i').count();
    console.log(`   Elements with price indicators: ${prices}`);

    // 9. Look at page structure more carefully
    const mainContent = await page.$('main');
    if (mainContent) {
      console.log(`✅ Found main content tag`);
      
      // Check if there are product containers
      const containers = await page.locator('main [class*="container"], main [class*="grid"], main [class*="list"]').count();
      if (containers) {
        console.log(`   Product-like containers: ${containers}`);
      }
    }

    // 10. Try scrolling to trigger lazy loading
    console.log('📜 Scrolling page to trigger lazy loading...');
    await page.evaluate(async () => {
      (globalThis as any).window?.scrollBy?.(0, (globalThis as any).window?.innerHeight || 800);
    });
    await page.waitForTimeout(2000);

    // 11. Check if more content loaded
    const afterScrollContent = await page.content();
    const newKeywords = afterScrollContent.includes('SKU') || 
                        afterScrollContent.includes('Adicionar');
    
    if (newKeywords) {
      console.log('✅ New content loaded after scrolling');
      
      const updatedHTMLPath = join(__dirname, 'page-products-after-scroll.html');
      writeFileSync(updatedHTMLPath, afterScrollContent);
      console.log(`💾 Updated HTML saved to: ${updatedHTMLPath}`);
    }

    // 12. Try to find buttons or interactive elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    console.log(`   Buttons on page: ${buttons}`);
    console.log(`   Links on page: ${links}`);

    // 13. Look for React/Next data attributes
    const reactElements = await page.locator('[data-react*=""], [data-next*=""]').count();
    const customDataAttrs = await page.locator('[data-*]').count();
    console.log(`   Custom data attributes: ${customDataAttrs}`);

    console.log('\n✅ Page analysis complete!');
    console.log('📄 Check the saved HTML files for detailed structure');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await browser.close();
  }
}

testNeosolarExtraction();
