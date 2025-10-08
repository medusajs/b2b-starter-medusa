import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { syncDistributorPricesStep } from "./steps/sync-distributor-prices-step";

export type SyncDistributorPricesInput = {
    distributor_id: string;
    catalog_data: any[];
};

/**
 * Workflow: Sync Distributor Prices
 * Synchronizes product prices from a distributor's catalog
 */
export const syncDistributorPricesWorkflow = createWorkflow(
    "sync-distributor-prices",
    (input: SyncDistributorPricesInput) => {
        const result = syncDistributorPricesStep(input);

        return new WorkflowResponse(result);
    }
);
