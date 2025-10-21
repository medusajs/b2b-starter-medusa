/**
 * Script de depuração para inspecionar o site Fortlev
 * Captura screenshot e HTML para análise
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugFortlev() {
  const browser = await chromium.launch({
    headless: true, // Headless para não abrir janela
  });

  const page = await browser.newPage();

  try {
    console.log('🌐 Navegando para https://fortlevsolar.app/login...');
    await page.goto('https://fortlevsolar.app/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Aguardar um pouco
    await page.waitForTimeout(2000);

    // Capturar screenshot
    const screenshotPath = path.join(process.cwd(), 'debug-login.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot salvo em: ${screenshotPath}`);

    // Salvar HTML
    const html = await page.content();
    const htmlPath = path.join(process.cwd(), 'debug-login.html');
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`📄 HTML salvo em: ${htmlPath}`);

    // Procurar campos de input
    console.log('\n🔍 Procurando campos de input...');
    const inputs = await page.$$('input');
    console.log(`   Encontrados ${inputs.length} campos de input`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');

      console.log(`   Input ${i + 1}:`);
      console.log(`      type: ${type}`);
      console.log(`      name: ${name}`);
      console.log(`      id: ${id}`);
      console.log(`      placeholder: ${placeholder}`);
      console.log(`      class: ${className}`);
    }

    // Procurar botões
    console.log('\n🔍 Procurando botões...');
    const buttons = await page.$$('button');
    console.log(`   Encontrados ${buttons.length} botões`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const type = await button.getAttribute('type');
      const text = await button.textContent();
      const className = await button.getAttribute('class');

      console.log(`   Botão ${i + 1}:`);
      console.log(`      type: ${type}`);
      console.log(`      text: ${text?.trim()}`);
      console.log(`      class: ${className}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    if (error instanceof Error) {
      console.error('   Stack:', error.stack);
    }
  } finally {
    await browser.close();
  }
}

debugFortlev();
