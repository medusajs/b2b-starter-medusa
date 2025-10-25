/**
 * Temporal Schedule Client para agendar sincronizações automáticas
 */

import { Connection, Client } from '@temporalio/client';
import pino from 'pino';

const logger = pino({ name: 'temporal-scheduler' });

async function setupSchedules() {
  try {
    // Connect to Temporal
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });

    const client = new Client({ connection });

    logger.info('Setting up Temporal schedules');

    // Full sync - Daily at 2 AM BRT
    await client.schedule.create({
      scheduleId: 'full-sync-daily',
      spec: {
        cronExpressions: ['0 5 * * *'], // 2 AM BRT = 5 AM UTC
      },
      action: {
        type: 'startWorkflow',
        workflowType: 'syncAllDistributorsWorkflow',
        args: [],
        taskQueue: 'distributor-sync',
      },
    });

    logger.info('✓ Created schedule: full-sync-daily (Daily 2 AM BRT)');

    // Incremental sync - Every 4 hours
    await client.schedule.create({
      scheduleId: 'incremental-sync-4h',
      spec: {
        intervals: [{ every: '4h' }],
      },
      action: {
        type: 'startWorkflow',
        workflowType: 'syncAllDistributorsWorkflow',
        args: [{ mode: 'incremental' }],
        taskQueue: 'distributor-sync',
      },
    });

    logger.info('✓ Created schedule: incremental-sync-4h (Every 4 hours)');

    // Price sync - Every hour during business hours (9 AM - 6 PM BRT)
    await client.schedule.create({
      scheduleId: 'price-sync-hourly',
      spec: {
        cronExpressions: ['0 12-21 * * *'], // 9 AM - 6 PM BRT = 12-21 UTC
      },
      action: {
        type: 'startWorkflow',
        workflowType: 'syncAllDistributorsWorkflow',
        args: [{ mode: 'price-only' }],
        taskQueue: 'distributor-sync',
      },
    });

    logger.info('✓ Created schedule: price-sync-hourly (Hourly 9 AM - 6 PM BRT)');

    // Stock check - Every 30 minutes during business hours
    await client.schedule.create({
      scheduleId: 'stock-check-30min',
      spec: {
        cronExpressions: ['*/30 12-21 * * *'], // Every 30min 9 AM - 6 PM BRT
      },
      action: {
        type: 'startWorkflow',
        workflowType: 'checkStockAllDistributorsWorkflow',
        args: [],
        taskQueue: 'distributor-sync',
      },
    });

    logger.info('✓ Created schedule: stock-check-30min (Every 30min business hours)');

    logger.info('All schedules created successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Failed to setup schedules');
    process.exit(1);
  }
}

setupSchedules();
