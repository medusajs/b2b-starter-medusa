/**
 * Script de teste para o agente Fortlev
 * Aciona o workflow de sincronização e monitora o resultado
 */

import { Connection, Client } from '@temporalio/client';
import { syncDistributorWorkflow } from './orchestrator/workflows/sync-distributors.js';
import * as dotenv from 'dotenv';
import pino from 'pino';

// Carregar variáveis de ambiente
dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

async function testFortlevAgent() {
  logger.info('🚀 Iniciando teste do agente Fortlev...');

  try {
    // Conectar ao Temporal Server
    logger.info('Conectando ao Temporal Server...');
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });

    const client = new Client({
      connection,
      namespace: 'default',
    });

    logger.info('✅ Conectado ao Temporal Server');

    // Iniciar o workflow
    const workflowId = `fortlev-test-${Date.now()}`;
    logger.info(`📋 Iniciando workflow com ID: ${workflowId}`);

    const handle = await client.workflow.start(syncDistributorWorkflow, {
      taskQueue: 'distributor-sync',
      workflowId,
      args: [
        {
          distributor: 'fortlev',
          mode: 'full',
          categories: undefined,
        },
      ],
    });

    logger.info(`🔄 Workflow iniciado. Aguardando conclusão...`);
    logger.info(`📊 Painel Temporal: http://localhost:8233/namespaces/default/workflows/${workflowId}`);

    // Aguardar resultado
    const result = await handle.result();

    // Exibir resultado
    logger.info('✅ Workflow concluído com sucesso!');
    logger.info('📈 Resultados:');
    logger.info(`   - Status: ${result.status}`);
    logger.info(`   - Produtos extraídos: ${result.productsExtracted}`);
    logger.info(`   - Produtos criados: ${result.productsCreated}`);
    logger.info(`   - Produtos atualizados: ${result.productsUpdated}`);
    logger.info(`   - Erros: ${result.errors}`);
    logger.info(`   - Duração: ${(result.duration / 1000).toFixed(2)}s`);

    if (result.status === 'success') {
      logger.info('🎉 Teste do agente Fortlev concluído com sucesso!');
      process.exit(0);
    } else {
      logger.warn('⚠️ Teste concluído com status parcial ou falha');
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
testFortlevAgent().catch((error) => {
  logger.fatal({ error }, 'Erro fatal');
  process.exit(1);
});
