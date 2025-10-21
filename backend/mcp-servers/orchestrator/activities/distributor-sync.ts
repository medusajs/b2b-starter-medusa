/**
 * Temporal Activities para sincronização de distribuidores
 */

import { ApplicationFailure } from '@temporalio/activity';
import type {
  ExtractionConfig,
  ExtractionResult,
} from '../../shared/types/distributor.js';
import { Pool } from 'pg';
import { createClient } from 'redis';
import pino from 'pino';

const logger = pino({ name: 'distributor-activities' });
const pgPool = new Pool({ connectionString: process.env.POSTGRES_URL });
const redisClient = createClient({ url: process.env.REDIS_URL });

await redisClient.connect();

/**
 * Authenticate with distributor
 */
export async function authenticateDistributor(distributor: string): Promise<void> {
  logger.info({ distributor }, 'Authenticating with distributor');

  try {
    // Check if session exists in Redis
    const sessionKey = `session:${distributor}`;
    const existingSession = await redisClient.get(sessionKey);

    if (existingSession) {
      const session = JSON.parse(existingSession);
      const expiresAt = new Date(session.expiresAt);

      if (expiresAt > new Date()) {
        logger.info({ distributor }, 'Using cached session');
        return;
      }
    }

    // Authenticate via MCP server
    // This would call the MCP server's authenticate tool
    logger.info({ distributor }, 'Creating new session');

    // Store session in Redis with 24h TTL
    await redisClient.setEx(
      sessionKey,
      24 * 60 * 60,
      JSON.stringify({
        distributor,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isValid: true,
      })
    );
  } catch (error) {
    logger.error({ error, distributor }, 'Authentication failed');
    throw ApplicationFailure.create({
      message: `Failed to authenticate with ${distributor}`,
      cause: error,
      nonRetryable: false,
    });
  }
}

/**
 * Extract catalog from distributor
 */
export async function extractCatalog(
  config: ExtractionConfig
): Promise<ExtractionResult> {
  logger.info({ config }, 'Extracting catalog');

  try {
    // This would call the MCP server's extract_catalog tool
    // For now, return mock data
    const result: ExtractionResult = {
      distributor: config.distributor,
      status: 'success',
      productsExtracted: 100,
      productsUpdated: 80,
      productsCreated: 20,
      productsError: 0,
      errors: [],
      duration: 30000,
      timestamp: new Date().toISOString(),
    };

    // Cache result
    const cacheKey = `extraction:${config.distributor}:${config.mode}`;
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    return result;
  } catch (error) {
    logger.error({ error, config }, 'Catalog extraction failed');
    throw ApplicationFailure.create({
      message: `Failed to extract catalog from ${config.distributor}`,
      cause: error,
      nonRetryable: false,
    });
  }
}

/**
 * Save products to database
 */
export async function saveProducts(
  distributor: string,
  result: ExtractionResult
): Promise<void> {
  logger.info({ distributor, count: result.productsExtracted }, 'Saving products');

  const client = await pgPool.connect();

  try {
    await client.query('BEGIN');

    // Create extraction log
    await client.query(
      `
      INSERT INTO distributor_extractions 
        (distributor, status, products_extracted, products_created, products_updated, errors, duration, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        result.distributor,
        result.status,
        result.productsExtracted,
        result.productsCreated,
        result.productsUpdated,
        result.productsError,
        result.duration,
        result.timestamp,
      ]
    );

    // Products would be saved here
    // This would integrate with Medusa.js product import workflow

    await client.query('COMMIT');
    logger.info({ distributor }, 'Products saved successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, distributor }, 'Failed to save products');
    throw ApplicationFailure.create({
      message: `Failed to save products from ${distributor}`,
      cause: error,
      nonRetryable: false,
    });
  } finally {
    client.release();
  }
}

/**
 * Send notification
 */
export async function sendNotification(notification: {
  type: 'success' | 'error' | 'warning';
  distributor: string;
  message: string;
}): Promise<void> {
  logger.info(notification, 'Sending notification');

  try {
    // Publish to Redpanda/Kafka
    await redisClient.publish(
      'distributor:notifications',
      JSON.stringify({
        ...notification,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    logger.warn({ error, notification }, 'Failed to send notification');
    // Don't throw - notifications are best effort
  }
}

/**
 * Cleanup on shutdown
 */
process.on('SIGINT', async () => {
  await redisClient.disconnect();
  await pgPool.end();
});

process.on('SIGTERM', async () => {
  await redisClient.disconnect();
  await pgPool.end();
});
