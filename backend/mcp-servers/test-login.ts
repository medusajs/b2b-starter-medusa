/**
 * Script para testar o login e ver a página pós-autenticação
 */

import { chromium } from 'playwright';
import * as dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
  const browser = await chromium.launch({
    headless: false, // Ver o que está acontecendo
    slowMo: 500,
  });

  const page = await browser.newPage();

  try {
    const email = process.env.FORTLEV_EMAIL!;
    const password = process.env.FORTLEV_PASSWORD!;

    console.log('🌐 Navegando para login...');
    await page.goto('https://fortlevsolar.app/login', {
      waitUntil: 'networkidle',
    });

    console.log('✏️  Preenchendo credenciais...');
    await page.fill('input[name="username"]', email);
    await page.fill('input[name="password"]', password);

    console.log('🔄 Clicando em Login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
      page.click('button[type="submit"]'),
    ]);

    console.log(`✅ Login concluído. URL atual: ${page.url()}`);

    // Capturar screenshot
    await page.screenshot({ path: 'debug-logged-in.png', fullPage: true });
    console.log('📸 Screenshot salvo: debug-logged-in.png');

    // Verificar se há algum erro visível
    const errorElements = await page.$$('.error, .alert-error, [class*="error"]');
    if (errorElements.length > 0) {
      console.log(`⚠️  Encontrados ${errorElements.length} elementos de erro`);
      for (const el of errorElements) {
        const text = await el.textContent();
        console.log(`   Erro: ${text}`);
      }
    }

    // Procurar elementos que indiquem login bem-sucedido
    console.log('\n🔍 Procurando indicadores de login bem-sucedido...');
    
    const selectors = [
      'nav',
      'header',
      '.navbar',
      '.sidebar',
      '[data-testid="user-menu"]',
      '.user-profile',
      '.logout-button',
      'button:has-text("Sair")',
      'button:has-text("Logout")',
      'a:has-text("Minha Conta")',
      'a:has-text("Perfil")',
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`   ✅ Encontrado: ${selector} (${count} elementos)`);
      }
    }

    // Aguardar para inspeção manual
    console.log('\n⏸️  Aguardando 60 segundos para inspeção manual...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Erro:', error);
    if (error instanceof Error) {
      console.error('   Stack:', error.stack);
    }
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testLogin();
