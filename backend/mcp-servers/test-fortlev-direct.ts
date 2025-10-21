/**
 * Teste direto do agente Fortlev (sem Temporal)
 * Executa as operações de autenticação e extração diretamente
 */

import { FortlevMCPServer } from './distributors/fortlev/server.js';
import type { Product } from './shared/types/distributor.js';
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

async function testFortlevDirect() {
  logger.info('🚀 Iniciando teste direto do agente Fortlev...');

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
      name: 'fortlev',
      version: '1.0.0',
      description: 'Fortlev Solar MCP Server',
    });

    // Teste 1: Autenticação
    logger.info('\n📍 TESTE 1: Autenticação');
    logger.info('➡️  Tentando autenticar...');
    
    const authResult = await fortlev.authenticate({
      username: email,
      password: password,
    });

    if (authResult.success) {
      logger.info('✅ Autenticação bem-sucedida!');
      logger.info(`   Session ID: ${authResult.sessionId}`);
      logger.info(`   Expires: ${authResult.expiresAt ? new Date(authResult.expiresAt).toISOString() : 'N/A'}`);
    } else {
      logger.error('❌ Falha na autenticação');
      logger.error(`   Erro: ${authResult.error}`);
      process.exit(1);
    }

    // Teste 2: Listar Produtos
    logger.info('\n📍 TESTE 2: Listagem de Produtos');
    logger.info('➡️  Buscando lista de produtos...');
    
    const productsResult = await fortlev.listProducts({
      sessionId: authResult.sessionId!,
      category: undefined,
      limit: 10, // Limitar a 10 produtos no teste
    });

    if (productsResult.success) {
      logger.info(`✅ Produtos encontrados: ${productsResult.products?.length || 0}`);
      
      if (productsResult.products && productsResult.products.length > 0) {
        logger.info('\n📋 Primeiros produtos:');
        productsResult.products.slice(0, 3).forEach((product: Product, index: number) => {
          logger.info(`   ${index + 1}. ${product.name}`);
          logger.info(`      SKU: ${product.sku}`);
          logger.info(`      Preço: R$ ${product.price.toFixed(2)}`);
          logger.info(`      Categoria: ${product.category}`);
          logger.info(`      Estoque: ${product.stock > 0 ? 'Disponível' : 'Indisponível'}`);
        });
      }
    } else {
      logger.error('❌ Falha ao listar produtos');
      logger.error(`   Erro: ${productsResult.error}`);
    }

    // Teste 3: Extrair Catálogo Completo (opcional - comentado por padrão)
    /*
    logger.info('\n📍 TESTE 3: Extração Completa do Catálogo');
    logger.info('➡️  Extraindo catálogo completo...');
    
    const catalogResult = await fortlev.extractCatalog({
      sessionId: authResult.sessionId!,
      mode: 'full',
      batchSize: 50,
      concurrency: 2,
    });

    if (catalogResult.success) {
      logger.info(`✅ Catálogo extraído com sucesso!`);
      logger.info(`   Total de produtos: ${catalogResult.totalProducts}`);
      logger.info(`   Produtos extraídos: ${catalogResult.extractedProducts}`);
      logger.info(`   Produtos com erro: ${catalogResult.failedProducts}`);
    } else {
      logger.error('❌ Falha ao extrair catálogo');
      logger.error(`   Erro: ${catalogResult.error}`);
    }
    */

    // Resumo final
    const duration = Date.now() - startTime;
    logger.info('\n' + '='.repeat(60));
    logger.info('📊 RESUMO DO TESTE');
    logger.info('='.repeat(60));
    logger.info(`⏱️  Duração total: ${(duration / 1000).toFixed(2)}s`);
    logger.info(`✅ Autenticação: ${authResult.success ? 'OK' : 'FALHOU'}`);
    logger.info(`✅ Listagem de produtos: ${productsResult.success ? 'OK' : 'FALHOU'}`);
    logger.info(`📦 Produtos encontrados: ${productsResult.products?.length || 0}`);
    logger.info('='.repeat(60));

    if (authResult.success && productsResult.success) {
      logger.info('\n🎉 Teste do agente Fortlev concluído com SUCESSO!');
      process.exit(0);
    } else {
      logger.warn('\n⚠️  Teste concluído com falhas parciais');
      process.exit(1);
    }

  } catch (error) {
    logger.error({ error }, '❌ Erro durante o teste');
    if (error instanceof Error) {
      logger.error(`   Mensagem: ${error.message}`);
      logger.error(`   Stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Executar teste
testFortlevDirect().catch((error) => {
  logger.fatal({ error }, 'Erro fatal');
  process.exit(1);
});
