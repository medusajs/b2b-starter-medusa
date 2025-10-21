/**
 * Temporal Worker para processar workflows de distribuidores
 */

import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities/distributor-sync.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pino from 'pino';

const logger = pino({ name: 'temporal-worker' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  try {
    // Connect to Temporal server
    const connection = await NativeConnection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });

    logger.info({ address: connection.options.address }, 'Connected to Temporal');

    // Create worker
    const worker = await Worker.create({
      connection,
      namespace: 'default',
      taskQueue: 'distributor-sync',
      workflowsPath: join(__dirname, 'workflows'),
      activities,
      maxConcurrentActivityTaskExecutions: 10,
      maxConcurrentWorkflowTaskExecutions: 10,
    });

    logger.info({ taskQueue: worker.options.taskQueue }, 'Worker created');

    // Start worker
    await worker.run();
  } catch (error) {
    logger.fatal({ error }, 'Worker failed to start');
    process.exit(1);
  }
}

run().catch((error) => {
  logger.fatal({ error }, 'Unhandled error');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down');
  process.exit(0);
});
