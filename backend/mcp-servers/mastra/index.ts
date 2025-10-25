/**
 * Mastra Instance - Core Configuration
 * 
 * Centraliza agentes, workflows, tools e configurações do Mastra AI Framework
 * para extração de catálogos de distribuidores solares
 */

import { Mastra } from '@mastra/core';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';
import { logger } from '../shared/utils/logger';

// Importar agentes
import { fortlevAgent } from './agents/fortlev';
import { neosolarAgent } from './agents/neosolar';
import { solfacilAgent } from './agents/solfacil';
import { fotusAgent } from './agents/fotus';
import { odexAgent } from './agents/odex';
import { edeltecAgent } from './agents/edeltec';
import { dynamisAgent } from './agents/dynamis';

// Importar workflows
import { extractionWorkflow } from './workflows/extraction';
import { validationWorkflow } from './workflows/validation';
import { syncWorkflow } from './workflows/sync';

// Database URLs
const libSqlUrl = process.env.LIBSQL_URL || 'file:./mastra.db';

/**
 * Mastra Instance
 * 
 * Configuração central para todos os agentes e workflows de extração
 */
export const mastra = new Mastra({
  // Storage para memória dos agentes
  storage: new LibSQLStore({
    url: libSqlUrl,
  }),

  // Vector store para semantic search
  vector: new LibSQLVector({
    connectionUrl: libSqlUrl,
  }),

  // Embedder para semantic recall
  embedder: openai.embedding('text-embedding-3-small'),

  // Agentes especializados por distribuidor
  agents: {
    fortlevAgent,
    neosolarAgent,
    solfacilAgent,
    fotusAgent,
    odexAgent,
    edeltecAgent,
    dynamisAgent,
  },

  // Workflows Mastra
  workflows: {
    extractionWorkflow,
    validationWorkflow,
    syncWorkflow,
  },

  // Logger customizado
  logger: {
    info: (msg: string, ...args: any[]) => logger.info(msg, ...args),
    error: (msg: string, ...args: any[]) => logger.error(msg, ...args),
    warn: (msg: string, ...args: any[]) => logger.warn(msg, ...args),
    debug: (msg: string, ...args: any[]) => logger.debug(msg, ...args),
  },
});

// Health check
export async function checkMastraHealth(): Promise<{ status: string; agents: number; workflows: number }> {
  try {
    const agentCount = Object.keys(mastra.agents || {}).length;
    const workflowCount = Object.keys(mastra.workflows || {}).length;

    return {
      status: 'healthy',
      agents: agentCount,
      workflows: workflowCount,
    };
  } catch (error) {
    logger.error('Mastra health check failed', error);
    return {
      status: 'unhealthy',
      agents: 0,
      workflows: 0,
    };
  }
}

// Graceful shutdown
export async function shutdownMastra(): Promise<void> {
  logger.info('Shutting down Mastra instance...');
  // Cleanup resources if needed
  logger.info('Mastra instance shutdown complete');
}

// Error handling
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection in Mastra', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in Mastra', error);
  process.exit(1);
});
