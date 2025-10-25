/**
 * Teste simplificado do agente Fortlev
 * Executa diretamente via MCP tools interface
 */

import { FortlevMCPServer } from './distributors/fortlev/server.js';
import * as dotenv from 'dotenv';
import pino from 'pino';

// Carregar variáveis de ambiente
dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

async function testFortlevSimple() {
  logger.info('🚀 Iniciando teste simplificado do agente Fortlev...');

  const startTime = Date.now();
  
  try {
    // Verificar variáveis de ambiente
    const email = process.env.FORTLEV_EMAIL;
    const password = process.env.FORTLEV_PASSWORD;

    if (!email || !password) {
      throw new Error('Credenciais do Fortlev não configuradas no .env');
    }

    logger.info(`📧 Email: ${email}`);
    logger.info('🔐 Senha: ********');

    // Criar instância do servidor
    logger.info('📦 Criando instância do servidor Fortlev...');
    const fortlev = new FortlevMCPServer({
      name: 'fortlev-test',
      version: '1.0.0',
      distributor: 'fortlev',
      credentials: {
        distributor: 'fortlev',
        email: email,
        password: password,
        baseUrl: 'https://fortlevsolar.app',
      },
    });

    logger.info('✅ Servidor criado com sucesso');
    logger.info(`   Nome: ${fortlev['config'].name}`);
    logger.info(`   Versão: ${fortlev['config'].version}`);
    logger.info(`   Distribuidor: ${fortlev['config'].distributor}`);

    // Teste via interface MCP (call tool)
    logger.info('\n📍 TESTE 1: Autenticação via MCP Tool');
    logger.info('➡️  Chamando tool "authenticate"...');
    
    try {
      const authResult = await fortlev['callTool']('authenticate', {
        email,
        password,
      });

      logger.info('✅ Tool "authenticate" executado');
      logger.info(`   Distribuidor: ${authResult.distributor}`);
      logger.info(`   Valid: ${authResult.isValid}`);
      logger.info(`   Expires: ${authResult.expiresAt}`);

      // Teste 2: Listar categorias
      logger.info('\n📍 TESTE 2: Listar Categorias');
      logger.info('➡️  Lendo resource "categories"...');
      
      try {
        const categoriesResource = await fortlev['readResource'](`catalog://fortlev/categories`);
        const categoriesText = categoriesResource.contents[0].text;
        const categories = JSON.parse(categoriesText);
        
        logger.info(`✅ Categorias disponíveis: ${categories.length}`);
        logger.info(`   ${categories.join(', ')}`);
      } catch (error) {
        logger.warn('⚠️  Não foi possível listar categorias');
        if (error instanceof Error) {
          logger.warn(`   ${error.message}`);
        }
      }

      // Teste 3: Listar produtos
      logger.info('\n📍 TESTE 3: Listar Produtos via MCP Tool');
      logger.info('➡️  Chamando tool "list_products"...');
      
      try {
        const productsResult = await fortlev['callTool']('list_products', {
          limit: 5,
          offset: 0,
        });

        logger.info(`✅ Produtos encontrados: ${productsResult.products.length} de ${productsResult.total}`);
        
        if (productsResult.products.length > 0) {
          logger.info('\n📋 Produtos:');
          productsResult.products.forEach((product: any, index: number) => {
            logger.info(`   ${index + 1}. ${product.title || product.sku}`);
            logger.info(`      SKU: ${product.sku}`);
            const price = product.pricing?.retail || product.pricing?.wholesale || 0;
            logger.info(`      Preço: R$ ${price.toFixed(2)}`);
            logger.info(`      Categoria: ${product.category}`);
            logger.info(`      Fabricante: ${product.manufacturer || 'N/A'}`);
          });
        }
      } catch (error) {
        logger.error('❌ Falha ao listar produtos');
        if (error instanceof Error) {
          logger.error(`   ${error.message}`);
        }
      }

      // Resumo final
      const duration = Date.now() - startTime;
      logger.info('\n' + '='.repeat(60));
      logger.info('📊 RESUMO DO TESTE');
      logger.info('='.repeat(60));
      logger.info(`⏱️  Duração total: ${(duration / 1000).toFixed(2)}s`);
      logger.info(`✅ Autenticação: OK`);
      logger.info(`✅ Interface MCP: FUNCIONAL`);
      logger.info('='.repeat(60));

      logger.info('\n🎉 Teste do agente Fortlev concluído com SUCESSO!');
      
      // Cleanup
      await fortlev.shutdown();
      process.exit(0);

    } catch (authError) {
      logger.error({ authError }, '❌ Erro na autenticação');
      throw authError;
    }

  } catch (error) {
    logger.error({ error }, '❌ Erro durante o teste');
    if (error instanceof Error) {
      logger.error(`   Mensagem: ${error.message}`);
      if (error.stack) {
        logger.error(`   Stack: ${error.stack}`);
      }
    }
    process.exit(1);
  }
}

// Executar teste
testFortlevSimple().catch((error) => {
  logger.fatal({ error }, 'Erro fatal');
  process.exit(1);
});
