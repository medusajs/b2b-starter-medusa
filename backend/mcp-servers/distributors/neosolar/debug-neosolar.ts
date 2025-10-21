#!/usr/bin/env tsx
/**
 * Debug script para mapear estrutura HTML do Portal B2B Neosolar
 * URL: https://portalb2b.neosolar.com.br/
 * 
 * Uso: npx tsx mcp-servers/distributors/neosolar/debug-neosolar.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function debugNeosolar() {
  console.log('🔍 Starting Neosolar Portal B2B debug session...\n');

  const browser = await chromium.launch({
    headless: false, // Keep visible for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // Step 1: Navigate to login page
    console.log('📄 Step 1: Navigating to login page...');
    await page.goto('https://portalb2b.neosolar.com.br/login', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // Capture login page structure
    console.log('📸 Capturing login page HTML structure...');
    const loginHtml = await page.content();
    fs.writeFileSync(
      path.join(__dirname, 'debug-login-page.html'),
      loginHtml
    );

    // Identify form fields
    console.log('\n🔎 Analyzing login form fields...');
    const emailField = await page.locator('input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="mail"]').first();
    const passwordField = await page.locator('input[type="password"]').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();

    console.log('   Email field:', await emailField.count() > 0 ? '✅ Found' : '❌ Not found');
    console.log('   Password field:', await passwordField.count() > 0 ? '✅ Found' : '❌ Not found');
    console.log('   Submit button:', await submitButton.count() > 0 ? '✅ Found' : '❌ Not found');

    if (await emailField.count() > 0) {
      const emailAttrs = await emailField.evaluate((el) => ({
        name: el.getAttribute('name'),
        id: el.getAttribute('id'),
        placeholder: el.getAttribute('placeholder'),
        selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.split(' ').join('.')}` : ''),
      }));
      console.log('   Email attributes:', emailAttrs);
    }

    if (await passwordField.count() > 0) {
      const passwordAttrs = await passwordField.evaluate((el) => ({
        name: el.getAttribute('name'),
        id: el.getAttribute('id'),
        placeholder: el.getAttribute('placeholder'),
        selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.split(' ').join('.')}` : ''),
      }));
      console.log('   Password attributes:', passwordAttrs);
    }

    // Step 2: Simulate authentication (requires manual credentials)
    console.log('\n⚠️  Step 2: Authentication requires valid credentials.');
    console.log('   To test authenticated pages, please provide credentials:');
    console.log('   EMAIL=your@email.com PASSWORD=yourpass npx tsx mcp-servers/distributors/neosolar/debug-neosolar.ts');

    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;

    if (email && password) {
      console.log('\n🔐 Attempting authentication...');
      
      await emailField.fill(email);
      await passwordField.fill(password);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
        submitButton.click(),
      ]);

      console.log('   Current URL:', page.url());
      
      // Check if still on login page
      if (page.url().includes('/login')) {
        console.log('   ❌ Still on login page - authentication may have failed');
        
        // Check for error messages
        const errorMsg = await page.locator('.alert-danger, .error, .message-error, [class*="error"]').first().textContent().catch(() => null);
        if (errorMsg) {
          console.log('   Error message:', errorMsg.trim());
        }
      } else {
        console.log('   ✅ Authentication successful!');

        // Step 3: Navigate to product catalog
        console.log('\n📦 Step 3: Navigating to product catalog...');
        
        // Try common product listing URLs
        const catalogUrls = [
          'https://portalb2b.neosolar.com.br/produtos',
          'https://portalb2b.neosolar.com.br/catalog',
          'https://portalb2b.neosolar.com.br/loja',
          'https://portalb2b.neosolar.com.br/',
        ];

        for (const url of catalogUrls) {
          try {
            console.log(`   Trying: ${url}`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            console.log(`   ✅ Loaded: ${url}`);
            break;
          } catch (e) {
            console.log(`   ❌ Failed: ${url}`);
          }
        }

        // Capture authenticated homepage
        const homeHtml = await page.content();
        fs.writeFileSync(
          path.join(__dirname, 'debug-home-page.html'),
          homeHtml
        );

        // Analyze product listing structure
        console.log('\n🛍️  Step 4: Analyzing product listing structure...');
        
        // Common selectors for product cards/items
        const productSelectors = [
          '.product-card',
          '.product-item',
          '[class*="product"]',
          '.card',
          '[data-product-id]',
          '.item',
        ];

        for (const selector of productSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`   ✅ Found ${count} elements with selector: ${selector}`);
            
            // Extract first product sample
            const firstProduct = await page.locator(selector).first().evaluate((el) => ({
              html: el.outerHTML.substring(0, 500),
              classes: el.className,
              id: el.id,
            }));
            console.log('   Sample HTML:', firstProduct.html);
          }
        }

        // Look for pagination
        console.log('\n📄 Step 5: Checking for pagination...');
        const paginationSelectors = ['.pagination', '[class*="pag"]', 'nav[aria-label*="page"]'];
        for (const selector of paginationSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`   ✅ Found pagination: ${selector}`);
          }
        }

        // Look for search/filter options
        console.log('\n🔍 Step 6: Checking for search/filter options...');
        const searchInput = await page.locator('input[type="search"], input[placeholder*="Buscar"], input[name*="search"]').first();
        if (await searchInput.count() > 0) {
          console.log('   ✅ Found search input');
          const searchAttrs = await searchInput.evaluate((el) => ({
            name: el.getAttribute('name'),
            placeholder: el.getAttribute('placeholder'),
          }));
          console.log('   Search attributes:', searchAttrs);
        }

        // Extract menu/navigation structure
        console.log('\n🧭 Step 7: Extracting navigation menu...');
        const navLinks = await page.locator('nav a, .menu a, [class*="nav"] a').all();
        const links = await Promise.all(
          navLinks.slice(0, 10).map(async (link) => ({
            text: await link.textContent(),
            href: await link.getAttribute('href'),
          }))
        );
        console.log('   Navigation links:', links);

        // Save full page screenshot
        console.log('\n📸 Step 8: Capturing screenshot...');
        await page.screenshot({
          path: path.join(__dirname, 'debug-screenshot.png'),
          fullPage: true,
        });
        console.log('   ✅ Screenshot saved to debug-screenshot.png');
      }
    }

    console.log('\n✅ Debug session complete!');
    console.log('📁 Generated files:');
    console.log('   - debug-login-page.html');
    if (email && password) {
      console.log('   - debug-home-page.html');
      console.log('   - debug-screenshot.png');
    }
    console.log('\n💡 Next steps:');
    console.log('   1. Review generated HTML files to identify correct selectors');
    console.log('   2. Update server.ts with actual field names and selectors');
    console.log('   3. Test authentication with real credentials');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

debugNeosolar().catch(console.error);
