#!/usr/bin/env node --no-warnings
/**
 * Debug: Explorar Estrutura do Site Fortlev
 * Investiga URLs e categorias disponíveis para extração completa
 */

import { chromium } from 'playwright';
import pino from 'pino';

const logger = pino({
  name: 'fortlev-site-explorer',
  level: 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } }
});

async function exploreNavigationAndCategories() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  // Restaurar sessão autenticada
  const sessionCookies = [
    {
      name: 'fortlev_session',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoiZmVybmFuZG8udGVpeGVpcmFAeWVsbG8uY2FzaCIsIl9pZCI6IjY3MTBiN2UxOTQ2NzI5M2U5MWNhM2JkZSIsImlkIjoiNjcxMGI3ZTE5NDY3MjkzZTkxY2EzYmRlIn0sImlhdCI6MTcyOTI1ODQ2NiwiZXhwIjoxNzI5MzQ0ODY2fQ.NkbsNEbHQhKcmRv9D9LBFWO4Vh7H0xGhb_L0vLEK8X4',
      domain: '.fortlevsolar.com.br',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }
  ];

  await context.addCookies(sessionCookies);
  const page = await context.newPage();

  try {
    logger.info('🔍 Explorando estrutura do site Fortlev Solar...\n');

    // 1. Acessar página principal
    await page.goto('https://fortlevsolar.com.br', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    logger.info('📋 MENU PRINCIPAL:\n');

    // 2. Extrair todos os links do menu principal
    const mainMenuLinks = await page.evaluate(() => {
      const links: { text: string; href: string }[] = [];
      document.querySelectorAll('nav a, .menu a, header a').forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        const text = anchor.textContent?.trim();
        const href = anchor.href;
        if (text && href && !href.includes('javascript:') && !href.includes('#')) {
          links.push({ text, href });
        }
      });
      return links;
    });

    mainMenuLinks.forEach((link, i) => {
      logger.info(`  ${i + 1}. ${link.text}`);
      logger.info(`     ${link.href}\n`);
    });

    // 3. Buscar páginas de produtos/catálogo
    logger.info('🛒 PÁGINAS DE PRODUTOS IDENTIFICADAS:\n');

    const productPages = mainMenuLinks.filter((link) =>
      link.href.includes('produto') ||
      link.href.includes('catalogo') ||
      link.href.includes('loja') ||
      link.href.includes('categoria')
    );

    if (productPages.length === 0) {
      logger.warn('⚠️  Nenhuma página de produtos encontrada no menu principal.');
      logger.info('🔎 Verificando diretamente URLs conhecidas...\n');

      const knownUrls = [
        'https://fortlevsolar.com.br/produto-avulso',
        'https://fortlevsolar.com.br/produtos',
        'https://fortlevsolar.com.br/catalogo',
        'https://fortlevsolar.com.br/loja',
        'https://fortlevsolar.com.br/categorias'
      ];

      for (const url of knownUrls) {
        try {
          const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
          if (response?.ok()) {
            logger.info(`✅ ${url} - Acessível`);

            // Contar produtos na página
            const productCount = await page.evaluate(() => {
              return document.querySelectorAll('.card, [class*="product"], [class*="item"]').length;
            });
            logger.info(`   📦 ${productCount} elementos de produto encontrados\n`);
          }
        } catch (error) {
          logger.info(`❌ ${url} - Não acessível\n`);
        }
      }
    } else {
      productPages.forEach((page) => {
        logger.info(`  • ${page.text}`);
        logger.info(`    ${page.href}\n`);
      });
    }

    // 4. Verificar se há filtros/categorias em /produto-avulso
    await page.goto('https://fortlevsolar.com.br/produto-avulso', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    logger.info('🏷️  FILTROS/CATEGORIAS EM /produto-avulso:\n');

    const filters = await page.evaluate(() => {
      const filterElements: { type: string; text: string; count?: number }[] = [];

      // Buscar selectores, checkboxes, radio buttons
      document.querySelectorAll('select, [type="checkbox"], [type="radio"], .filter, .category').forEach((el) => {
        const element = el as HTMLElement;
        if (element.tagName === 'SELECT') {
          const select = element as HTMLSelectElement;
          filterElements.push({
            type: 'select',
            text: select.name || select.id || 'unnamed',
            count: select.options.length
          });
        } else if (element.tagName === 'INPUT') {
          const input = element as HTMLInputElement;
          const label = document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim();
          filterElements.push({
            type: input.type,
            text: label || input.name || input.value
          });
        } else {
          filterElements.push({
            type: 'category',
            text: element.textContent?.trim() || ''
          });
        }
      });

      return filterElements;
    });

    if (filters.length === 0) {
      logger.warn('⚠️  Nenhum filtro/categoria encontrado.');
    } else {
      filters.forEach((filter) => {
        if (filter.count) {
          logger.info(`  • ${filter.type}: ${filter.text} (${filter.count} opções)`);
        } else {
          logger.info(`  • ${filter.type}: ${filter.text}`);
        }
      });
    }

    logger.info('\n');

    // 5. Verificar paginação
    logger.info('📄 PAGINAÇÃO:\n');

    const paginationInfo = await page.evaluate(() => {
      const paginationElements = document.querySelectorAll('[class*="pagination"], .page, [class*="next"], [class*="prev"]');
      return {
        hasPagination: paginationElements.length > 0,
        paginationHTML: paginationElements.length > 0 ? paginationElements[0].outerHTML : null
      };
    });

    if (paginationInfo.hasPagination) {
      logger.info('✅ Sistema de paginação detectado:');
      logger.info(paginationInfo.paginationHTML || '(HTML não disponível)');
    } else {
      logger.info('❌ Nenhum sistema de paginação detectado.');
      logger.info('   → Site usa Infinite Scroll ou tem apenas 1 página');
    }

    logger.info('\n');

    // 6. Verificar API/XHR requests
    logger.info('🌐 REQUISIÇÕES DE API:\n');

    page.on('response', (response) => {
      const url = response.url();
      if (
        url.includes('/api/') ||
        url.includes('graphql') ||
        url.includes('products') ||
        url.includes('components')
      ) {
        logger.info(`  📡 ${response.request().method()} ${url}`);
        logger.info(`     Status: ${response.status()}\n`);
      }
    });

    // Trigger scroll to capture XHR
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    logger.info('\n✅ Exploração concluída. Pressione Ctrl+C para sair.\n');

    // Manter navegador aberto para inspeção manual
    await page.waitForTimeout(60000);
  } finally {
    await browser.close();
  }
}

exploreNavigationAndCategories().catch((error) => {
  logger.error({ error }, '❌ Erro durante exploração');
  process.exit(1);
});
