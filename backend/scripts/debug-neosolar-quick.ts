#!/usr/bin/env node

/**
 * Quick Debug Neosolar Login - Headless
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function debugLoginPageHeadless() {
  console.log('🔍 Analisando página de login Neosolar (headless)...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navegando para https://portalb2b.neosolar.com.br/...');
    await page.goto('https://portalb2b.neosolar.com.br/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log('⏳ Aguardando 3 segundos para página carregar completamente...');
    await page.waitForTimeout(3000);

    // Get page info
    const title = await page.title();
    const url = page.url();
    console.log(`\n📄 Título: ${title}`);
    console.log(`📍 URL: ${url}`);

    // Check what inputs are on the page
    const inputs = await page.$$eval('input', (els: any) =>
      els.map((el: HTMLInputElement) => ({
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        ariaLabel: el.getAttribute('aria-label'),
      }))
    );

    console.log('\n📝 Campos de entrada (inputs):');
    if (inputs.length === 0) {
      console.log('  ⚠️  Nenhum input encontrado!');
    } else {
      inputs.forEach((input, i) => {
        console.log(`  ${i + 1}. type="${input.type}" name="${input.name}" placeholder="${input.placeholder}"`);
      });
    }

    // Check for buttons
    const buttons = await page.$$eval('button', (els: any) =>
      els.map((el: HTMLButtonElement) => ({
        type: el.type,
        text: el.textContent?.trim().substring(0, 50),
        class: el.className.substring(0, 50),
      }))
    );

    console.log('\n🔘 Botões encontrados:');
    if (buttons.length === 0) {
      console.log('  ⚠️  Nenhum botão encontrado!');
    } else {
      buttons.forEach((btn, i) => {
        console.log(`  ${i + 1}. type="${btn.type}" text="${btn.text}"`);
      });
    }

    // Check for forms
    const forms = await page.$$eval('form', (els: any) =>
      els.map((el: HTMLFormElement) => ({
        action: el.action,
        method: el.method,
        id: el.id,
        innerHTML: el.innerHTML.substring(0, 100),
      }))
    );

    console.log('\n📋 Formulários encontrados:');
    if (forms.length === 0) {
      console.log('  ⚠️  Nenhum formulário encontrado!');
    } else {
      forms.forEach((form, i) => {
        console.log(`  ${i + 1}. action="${form.action}" method="${form.method}" id="${form.id}"`);
      });
    }

    // Look for any text that might give us clues
    const bodyText = await page.textContent('body');
    console.log('\n📄 Palavras-chave na página:');
    const keywords = ['login', 'senha', 'email', 'usuário', 'entrar', 'acesso', 'autenticação'];
    keywords.forEach(kw => {
      if (bodyText?.toLowerCase().includes(kw)) {
        console.log(`  ✅ "${kw}" encontrado`);
      }
    });

    // Save full HTML for inspection
    const html = await page.content();
    mkdirSync(join(__dirname, '..', 'output'), { recursive: true });
    const timestamp = Date.now();
    const htmlPath = join(__dirname, '..', 'output', `neosolar-login-${timestamp}.html`);
    writeFileSync(htmlPath, html);
    console.log(`\n💾 HTML salvo em: ${htmlPath}`);

    // Take screenshot
    const screenshotPath = join(__dirname, '..', 'output', `neosolar-login-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot salvo em: ${screenshotPath}`);

    console.log('\n✅ Análise completa!');

  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }
}

debugLoginPageHeadless();
