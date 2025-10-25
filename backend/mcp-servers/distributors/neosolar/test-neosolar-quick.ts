#!/usr/bin/env tsx
/**
 * Teste rápido de extração Neosolar
 * Usage: EMAIL_NEOSOLAR=... PASSWORD_NEOSOLAR=... npx tsx test-neosolar-quick.ts
 */

import { chromium } from 'playwright';

async function testNeosolar() {
  console.log('🧪 Testing Neosolar extraction...\n');
  
  const email = process.env.EMAIL_NEOSOLAR;
  const password = process.env.PASSWORD_NEOSOLAR;
  
  if (!email || !password) {
    console.error('❌ Missing credentials. Set EMAIL_NEOSOLAR and PASSWORD_NEOSOLAR');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    console.log('1️⃣ Navigating to Neosolar login page...');
    await page.goto('https://portalb2b.neosolar.com.br/login', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    console.log('2️⃣ Filling login form...');
    
    // Neosolar uses username/password fields
    const usernameInput = await page.locator('input[name="username"]').first();
    const passwordInput = await page.locator('input[name="password"]').first();
    
    if (await usernameInput.count() === 0) {
      console.error('❌ Username input not found');
    } else {
      await usernameInput.fill(email);
      console.log('   ✅ Username filled');
    }

    if (await passwordInput.count() === 0) {
      console.error('❌ Password input not found');
    } else {
      await passwordInput.fill(password);
      console.log('   ✅ Password filled');
    }

    console.log('3️⃣ Submitting login...');
    
    // Find and click submit button
    const submitButton = await page.locator(
      'button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Acessar")'
    ).first();
    
    if (await submitButton.count() > 0) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {}),
        submitButton.click(),
      ]);
      console.log('   ✅ Button clicked');
    } else {
      console.error('❌ Submit button not found');
    }

    // Wait a bit for redirect
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`\n4️⃣ Current URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.error('❌ Still on login page - authentication may have failed');
      
      // Check for error messages
      const pageContent = await page.content();
      if (pageContent.includes('erro') || pageContent.includes('invalid') || pageContent.includes('incorreto')) {
        console.log('⚠️  Page contains error indicators');
      }
    } else {
      console.log('✅ Logged in successfully!');
      
      console.log('\n5️⃣ Extracting products...');
      
      // Navigate to product listing
      const listingUrls = [
        'https://portalb2b.neosolar.com.br/produtos',
        'https://portalb2b.neosolar.com.br/catalogo',
        'https://portalb2b.neosolar.com.br/loja',
        'https://portalb2b.neosolar.com.br/',
      ];

      for (const url of listingUrls) {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          console.log(`   ✅ Loaded: ${url}`);
          break;
        } catch (e) {
          console.log(`   ❌ Failed: ${url}`);
        }
      }

      // Extract products
      const products = await page.evaluate(() => {
        const selectors = ['[data-product-id]', '.product-card', '.product-item', '[class*="product"]', '.card'];
        for (const selector of selectors) {
          const items = document.querySelectorAll(selector);
          if (items.length > 0) {
            return Array.from(items).slice(0, 10).map((el) => ({
              text: (el as any).textContent?.substring(0, 100).trim(),
              classes: (el as any).className,
              selector,
            }));
          }
        }
        return [];
      });

      console.log(`\n   Found ${products.length} products`);
      if (products.length === 0) {
        console.log('   ⚠️  No products found with standard selectors');
        console.log('   Try inspecting the page manually');
      } else {
        products.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.text} [${p.selector}]`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
}

testNeosolar().catch(console.error);
