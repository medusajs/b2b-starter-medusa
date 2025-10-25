/**
 * Temporal Workflow para sincronização de distribuidores
 */

import { proxyActivities, defineQuery, setHandler } from '@temporalio/workflow';
import type * as activities from '../activities/distributor-sync.js';

const { 
  authenticateDistributor,
  extractCatalog,
  saveProducts,
  sendNotification
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    initialInterval: '1s',
    maximumInterval: '30s',
    maximumAttempts: 3,
  },
});

export interface SyncDistributorInput {
  distributor: string;
  mode: 'full' | 'incremental' | 'price-only';
  categories?: string[];
}

export interface SyncDistributorResult {
  distributor: string;
  status: 'success' | 'failed' | 'partial';
  productsExtracted: number;
  productsCreated: number;
  productsUpdated: number;
  errors: number;
  duration: number;
}

// Query para obter status em tempo real
const statusQuery = defineQuery<SyncDistributorResult | null>('status');

export async function syncDistributorWorkflow(
  input: SyncDistributorInput
): Promise<SyncDistributorResult> {
  let currentStatus: SyncDistributorResult | null = null;
  
  // Setup query handler
  setHandler(statusQuery, () => currentStatus);

  const startTime = Date.now();

  try {
    // Step 1: Authenticate
    await authenticateDistributor(input.distributor);

    // Step 2: Extract catalog
    const extractionResult = await extractCatalog({
      distributor: input.distributor,
      mode: input.mode,
      categories: input.categories,
      batchSize: 50,
      concurrency: 3,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    });

    // Step 3: Save to database
    await saveProducts(input.distributor, extractionResult);

    // Step 4: Send success notification
    await sendNotification({
      type: 'success',
      distributor: input.distributor,
      message: `Extracted ${extractionResult.productsExtracted} products`,
    });

    currentStatus = {
      distributor: input.distributor,
      status: extractionResult.status,
      productsExtracted: extractionResult.productsExtracted,
      productsCreated: extractionResult.productsCreated,
      productsUpdated: extractionResult.productsUpdated,
      errors: extractionResult.productsError,
      duration: Date.now() - startTime,
    };

    return currentStatus;
  } catch (error) {
    // Send error notification
    await sendNotification({
      type: 'error',
      distributor: input.distributor,
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Workflow para sincronizar todos os distribuidores
 */
export async function syncAllDistributorsWorkflow(): Promise<SyncDistributorResult[]> {
  const distributors = [
    'fortlev',
    'neosolar',
    'solfacil',
    'fotus',
    'odex',
    'edeltec',
    'dynamis',
  ];

  const results = await Promise.allSettled(
    distributors.map((distributor) =>
      syncDistributorWorkflow({
        distributor,
        mode: 'incremental',
      })
    )
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        distributor: distributors[index],
        status: 'failed' as const,
        productsExtracted: 0,
        productsCreated: 0,
        productsUpdated: 0,
        errors: 1,
        duration: 0,
      };
    }
  });
}
