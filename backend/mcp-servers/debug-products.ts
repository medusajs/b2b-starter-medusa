import { chromium } from 'playwright';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

async function debugProductsPage() {
  console.log('🔍 Iniciando debug da página de produtos Fortlev...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('📝 Fazendo login...');
    await page.goto('https://fortlevsolar.app/login', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    await page.fill('input[name="username"]', process.env.FORTLEV_EMAIL!);
    await page.fill('input[name="password"]', process.env.FORTLEV_PASSWORD!);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    console.log(`✅ Login realizado. URL atual: ${currentUrl}\n`);

    // 2. Navegar para produtos
    console.log('🔍 Procurando links de produtos/catálogo...');
    
    // Tentar encontrar links de navegação
    const navLinks = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href'),
        classes: link.className
      })).filter(l => l.text && l.text.length > 0)
    );
    
    console.log('\n📋 Links de navegação encontrados:');
    navLinks.slice(0, 20).forEach(link => {
      console.log(`  - "${link.text}" -> ${link.href}`);
    });

    // Procurar por links relacionados a produtos/catálogo
    const productLinks = navLinks.filter(link => 
      link.text?.toLowerCase().includes('produto') ||
      link.text?.toLowerCase().includes('catálogo') ||
      link.text?.toLowerCase().includes('catalog') ||
      link.href?.includes('product') ||
      link.href?.includes('catalog')
    );

    console.log('\n🎯 Links relacionados a produtos:');
    productLinks.forEach(link => {
      console.log(`  - "${link.text}" -> ${link.href}`);
    });

    // Tentar navegar para uma página de produtos
    console.log(`\n➡️ Navegando diretamente para: /produto-avulso`);
    await page.goto('https://fortlevsolar.app/produto-avulso', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // 3. Capturar estrutura da página
    const pageUrl = page.url();
    console.log(`\n📄 Analisando página: ${pageUrl}`);
    
    const pageHtml = await page.content();
    await fs.writeFile(
      path.join(process.cwd(), 'debug-products.html'),
      pageHtml,
      'utf-8'
    );
    console.log('✅ HTML salvo em: debug-products.html');

    await page.screenshot({ 
      path: path.join(process.cwd(), 'debug-products.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot salvo em: debug-products.png');

    // 4. Analisar estrutura de produtos
    console.log('\n🔍 Procurando elementos de produtos...');
    
    // Procurar por cards/itens de produtos
    const productSelectors = [
      '.product-card',
      '.product-item',
      '[class*="product"]',
      '[data-product]',
      '.card',
      '.item',
      'article'
    ];

    for (const selector of productSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`\n✅ Encontrados ${count} elementos: ${selector}`);
        
        // Analisar primeiro elemento
        const firstElement = page.locator(selector).first();
        const html = await firstElement.innerHTML();
        const text = await firstElement.textContent();
        
        console.log('\n📦 Estrutura do primeiro elemento:');
        console.log('HTML:', html.substring(0, 500));
        console.log('\nTexto:', text?.substring(0, 200));
      }
    }

    // Procurar por tabelas
    const tableCount = await page.locator('table').count();
    if (tableCount > 0) {
      console.log(`\n📊 Encontradas ${tableCount} tabelas`);
      const firstTable = page.locator('table').first();
      const headers = await firstTable.locator('th').allTextContents();
      console.log('Cabeçalhos:', headers);
    }

    // 5. Procurar por filtros/categorias
    console.log('\n🔍 Procurando filtros/categorias...');
    const selectElements = await page.$$eval('select', selects =>
      selects.map(select => ({
        name: select.getAttribute('name'),
        id: select.getAttribute('id'),
        options: Array.from(select.options).map((opt: any) => opt.text)
      }))
    );

    if (selectElements.length > 0) {
      console.log('\n📋 Filtros encontrados:');
      selectElements.forEach(select => {
        console.log(`\n  ${select.name || select.id}:`);
        console.log(`  Opções: ${select.options.join(', ')}`);
      });
    }

    console.log('\n✅ Debug concluído! Verifique os arquivos gerados.');
    console.log('\n⏸️ Navegador permanecerá aberto por 30 segundos para inspeção manual...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  } finally {
    await browser.close();
  }
}

debugProductsPage();
