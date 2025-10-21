/**
 * Script para extração COMPLETA do catálogo Fortlev
 * Inclui paginação, persistência e retry logic
 */

import { FortlevMCPServer } from './distributors/fortlev/server.js';
import { pino } from 'pino';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config();

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

async function extractFullCatalog() {
  const startTime = Date.now();
  logger.info('🚀 Iniciando extração COMPLETA do catálogo Fortlev...\n');

  const email = process.env.FORTLEV_EMAIL!;
  const password = process.env.FORTLEV_PASSWORD!;

  // Criar servidor Fortlev
  const server = new FortlevMCPServer({
    name: 'fortlev-full-extraction',
    version: '1.0.0',
    distributor: 'fortlev',
    credentials: {
      distributor: 'fortlev',
      email,
      password,
      baseUrl: 'https://fortlevsolar.app/',
    },
  });

  try {
    // 1. Autenticar
    logger.info('🔐 ETAPA 1: Autenticação');
    logger.info(`   Email: ${email}`);
    const authResult = await (server as any).callTool('authenticate', { email, password });
    
    if (!authResult.isValid) {
      throw new Error('Falha na autenticação');
    }
    
    logger.info('✅ Autenticado com sucesso');
    logger.info(`   Sessão válida até: ${authResult.expiresAt}\n`);

    // 2. Extrair todas as páginas com scroll infinito
    logger.info('📦 ETAPA 2: Extração com Paginação');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Restaurar cookies de autenticação
    if (authResult.cookies) {
      const cookies = Object.entries(authResult.cookies).map(([name, value]) => ({
        name,
        value: value as string,
        domain: 'fortlevsolar.app',
        path: '/',
      }));
      await context.addCookies(cookies);
    }

    // Navegar para catálogo
    await page.goto('https://fortlevsolar.app/produto-avulso', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);

    let allProducts: any[] = [];
    let previousCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 50; // Máximo de tentativas de scroll

    logger.info('   🔄 Iniciando scroll infinito...');

    while (scrollAttempts < maxScrollAttempts) {
      // Extrair produtos da página atual
      const currentProducts = await page.$$eval('.card', (elements) =>
        elements.map((el) => {
          const codeEl = el.querySelector('.card-title small span');
          const code = codeEl?.textContent?.trim() || '';

          const titleEl = el.querySelector('.content-single-products-card .title-info .fw-semibold');
          const title = titleEl?.textContent?.trim() || '';

          const priceEl = el.querySelector('.text-orders-price p span');
          const price = priceEl?.textContent?.trim() || '';

          const imageEl = el.querySelector('.img-content-orders img');
          const image = (imageEl as HTMLImageElement)?.src || '';

          const buttonEl = el.querySelector('button[type="button"]');
          const onClickAttr = buttonEl?.getAttribute('@click') || buttonEl?.getAttribute('onclick') || '';
          
          let componentData: any = {};
          try {
            const jsonMatch = onClickAttr.match(/addCart\((\{.*?\})\)/);
            if (jsonMatch) {
              const jsonStr = jsonMatch[1]
                .replace(/&quot;/g, '"')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ');
              componentData = JSON.parse(jsonStr);
            }
          } catch (e) {
            // Ignore
          }

          return {
            code,
            title,
            price,
            image,
            componentId: componentData?.component?.id || '',
            manufacturer: componentData?.component?.manufacturer || null,
            family: componentData?.component?.family || '',
            step: componentData?.component?.step || 1,
            fullPrice: componentData?.full_price || 0,
            finalPrice: componentData?.final_price || 0,
          };
        })
      );

      // Filtrar produtos válidos
      const validProducts = currentProducts.filter(p => p.code && p.title);
      
      // Adicionar produtos novos (evitar duplicatas)
      const newProducts = validProducts.filter(
        newP => !allProducts.some(existingP => existingP.code === newP.code)
      );
      
      allProducts = [...allProducts, ...newProducts];

      logger.info(`   📊 Produtos acumulados: ${allProducts.length} (+${newProducts.length} novos)`);

      // Verificar se há novos produtos
      if (allProducts.length === previousCount) {
        logger.info('   ℹ️  Nenhum produto novo encontrado, finalizando...');
        break;
      }

      previousCount = allProducts.length;
      scrollAttempts++;

      // Scroll para carregar mais produtos (HTMX)
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Aguardar carregamento de novos produtos
      await page.waitForTimeout(2000);

      // Verificar se atingiu o final da página
      const hasMoreContent = await page.evaluate(() => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const totalHeight = document.body.scrollHeight;
        return scrollPosition < totalHeight - 100; // 100px de tolerância
      });

      if (!hasMoreContent && allProducts.length === previousCount) {
        logger.info('   ✅ Final da página alcançado');
        break;
      }
    }

    await browser.close();

    logger.info(`\n✅ EXTRAÇÃO CONCLUÍDA`);
    logger.info(`   Total de produtos: ${allProducts.length}`);
    logger.info(`   Tentativas de scroll: ${scrollAttempts}`);

    // 3. Estatísticas por categoria
    logger.info('\n📊 ETAPA 3: Análise de Categorias');
    
    const categoryCounts = allProducts.reduce((acc, p) => {
      const family = p.family || 'unknown';
      acc[family] = (acc[family] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categoryCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .forEach(([family, count]) => {
        logger.info(`   ${family.padEnd(20)}: ${count} produtos`);
      });

    // 4. Estatísticas de preço
    logger.info('\n💰 ETAPA 4: Análise de Preços');
    
    const prices = allProducts
      .map(p => p.finalPrice)
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    if (prices.length > 0) {
      const minPrice = prices[0];
      const maxPrice = prices[prices.length - 1];
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const medianPrice = prices[Math.floor(prices.length / 2)];

      logger.info(`   Mínimo: R$ ${minPrice.toFixed(2)}`);
      logger.info(`   Máximo: R$ ${maxPrice.toFixed(2)}`);
      logger.info(`   Média: R$ ${avgPrice.toFixed(2)}`);
      logger.info(`   Mediana: R$ ${medianPrice.toFixed(2)}`);
    }

    // 5. Salvar dados em JSON
    logger.info('\n💾 ETAPA 5: Salvando Dados');
    
    const fs = await import('fs/promises');
    const outputPath = './fortlev-catalog-full.json';
    
    await fs.writeFile(
      outputPath,
      JSON.stringify({
        distributor: 'fortlev',
        extractedAt: new Date().toISOString(),
        totalProducts: allProducts.length,
        categoryCounts,
        priceStats: prices.length > 0 ? {
          min: prices[0],
          max: prices[prices.length - 1],
          avg: prices.reduce((sum, p) => sum + p, 0) / prices.length,
          median: prices[Math.floor(prices.length / 2)],
        } : null,
        products: allProducts,
      }, null, 2)
    );

    logger.info(`   ✅ Dados salvos em: ${outputPath}`);

    // 6. Exportar CSV para análise
    const csvPath = './fortlev-catalog-full.csv';
    const csvHeader = 'SKU,Título,Preço,Família,Fabricante,ComponentID,Step,Imagem\n';
    const csvRows = allProducts.map(p => 
      `"${p.code}","${p.title.replace(/"/g, '""')}","${p.finalPrice}","${p.family}","${p.manufacturer || ''}","${p.componentId}","${p.step}","${p.image}"`
    ).join('\n');
    
    await fs.writeFile(csvPath, csvHeader + csvRows);
    logger.info(`   ✅ CSV exportado em: ${csvPath}`);

    // Resumo final
    const duration = Date.now() - startTime;
    logger.info('\n' + '='.repeat(70));
    logger.info('🎉 RESUMO FINAL');
    logger.info('='.repeat(70));
    logger.info(`✅ Produtos extraídos: ${allProducts.length}`);
    logger.info(`✅ Categorias únicas: ${Object.keys(categoryCounts).length}`);
    logger.info(`✅ Duração total: ${(duration / 1000).toFixed(2)}s`);
    logger.info(`✅ Taxa média: ${(allProducts.length / (duration / 1000)).toFixed(2)} produtos/s`);
    logger.info('='.repeat(70));

    logger.info('\n🎊 Extração completa do catálogo Fortlev CONCLUÍDA COM SUCESSO!');

  } catch (error) {
    logger.error({ error }, '❌ Erro durante extração');
    throw error;
  } finally {
    await server.shutdown();
  }
}

// Executar
extractFullCatalog().catch(console.error);
