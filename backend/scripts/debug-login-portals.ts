#!/usr/bin/env node

/**
 * Debug Solfácil and Fotus Login Pages
 * 
 * Inspects the login page structure to understand why automated login fails
 */

import { chromium } from 'playwright';

async function debugPortal(name: string, url: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 DEBUG: ${name.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`🌐 URL: ${url}\n`);

  const browser = await chromium.launch({ headless: false }); // Non-headless to see
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`✅ Page loaded`);

    // Wait for page to fully render
    await page.waitForTimeout(3000);

    // Analyze page structure
    const analysis = await page.evaluate(() => {
      const result: any = {};
      
      // Title
      result.title = document.title;
      
      // Detect if redirected
      result.currentUrl = window.location.href;
      
      // Find forms
      const forms = document.querySelectorAll('form');
      result.formsCount = forms.length;
      result.forms = [];
      
      forms.forEach((form, index) => {
        const formData: any = {
          index,
          action: form.action || 'none',
          method: form.method || 'GET',
          inputs: [],
        };
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          const el = input as HTMLInputElement;
          formData.inputs.push({
            type: el.type || 'text',
            name: el.name || 'unnamed',
            id: el.id || 'no-id',
            placeholder: el.placeholder || 'none',
          });
        });
        
        result.forms.push(formData);
      });
      
      // Find inputs outside forms
      const allInputs = document.querySelectorAll('input');
      result.totalInputs = allInputs.length;
      result.inputsByType = {};
      
      allInputs.forEach(input => {
        const type = (input as HTMLInputElement).type || 'text';
        result.inputsByType[type] = (result.inputsByType[type] || 0) + 1;
      });
      
      // Find buttons
      const buttons = document.querySelectorAll('button, input[type="submit"], [role="button"]');
      result.buttonsCount = buttons.length;
      result.buttons = [];
      
      buttons.forEach((btn, index) => {
        if (index < 10) { // First 10 only
          result.buttons.push({
            text: btn.textContent?.trim() || 'no-text',
            type: (btn as HTMLButtonElement).type || 'button',
            className: (btn as HTMLElement).className || 'none',
          });
        }
      });
      
      // Check for specific keywords
      const bodyText = document.body.innerText.toLowerCase();
      result.keywords = {
        login: bodyText.includes('login'),
        entrar: bodyText.includes('entrar'),
        email: bodyText.includes('email') || bodyText.includes('e-mail'),
        senha: bodyText.includes('senha') || bodyText.includes('password'),
        cadastro: bodyText.includes('cadastro') || bodyText.includes('cadastrar'),
      };
      
      // Detect frameworks
      result.frameworks = {
        react: !!(window as any).React || !!document.querySelector('[data-reactroot], [data-reactid]'),
        vue: !!(window as any).Vue || !!document.querySelector('[data-v-]'),
        angular: !!(window as any).angular || !!document.querySelector('[ng-app], [ng-controller]'),
      };
      
      return result;
    });

    console.log(`📋 ANALYSIS:`);
    console.log(`   Title: ${analysis.title}`);
    console.log(`   Current URL: ${analysis.currentUrl}`);
    console.log(`   Forms: ${analysis.formsCount}`);
    console.log(`   Total Inputs: ${analysis.totalInputs}`);
    console.log(`   Buttons: ${analysis.buttonsCount}\n`);

    console.log(`🔑 Inputs by Type:`);
    Object.entries(analysis.inputsByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    console.log(`\n🔍 Keywords Found:`);
    Object.entries(analysis.keywords).forEach(([keyword, found]) => {
      const icon = found ? '✅' : '❌';
      console.log(`   ${icon} ${keyword}`);
    });

    console.log(`\n🛠️ Frameworks:`);
    Object.entries(analysis.frameworks).forEach(([framework, detected]) => {
      const icon = detected ? '✅' : '❌';
      console.log(`   ${icon} ${framework}`);
    });

    console.log(`\n📝 Forms Detail:`);
    analysis.forms.forEach((form: any) => {
      console.log(`   Form ${form.index}:`);
      console.log(`     - Action: ${form.action}`);
      console.log(`     - Method: ${form.method}`);
      console.log(`     - Inputs (${form.inputs.length}):`);
      form.inputs.forEach((input: any) => {
        console.log(`       * ${input.type} | name="${input.name}" | id="${input.id}" | placeholder="${input.placeholder}"`);
      });
    });

    console.log(`\n🎯 Buttons (first 10):`);
    analysis.buttons.forEach((btn: any, index: number) => {
      console.log(`   ${index + 1}. "${btn.text}" (type: ${btn.type})`);
    });

    // Take screenshot
    const screenshotPath = `output/${name}-login-debug-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot: ${screenshotPath}`);

    // Keep browser open for 10 seconds
    console.log(`\n⏳ Keeping browser open for 10 seconds...`);
    await page.waitForTimeout(10000);

  } catch (error) {
    console.log(`❌ Error: ${(error as Error).message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  await debugPortal('solfacil', 'https://integrador.solfacil.com.br/');
  await debugPortal('fotus', 'https://app.fotus.com.br/');
}

main().catch(console.error);
