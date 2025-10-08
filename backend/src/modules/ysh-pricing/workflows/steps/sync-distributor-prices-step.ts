import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { YSH_PRICING_MODULE } from "../../index";

export type SyncDistributorPricesStepInput = {
    distributor_id: string;
    catalog_data: any[];
};

/**
 * Step: Sync Distributor Prices
 * Calls the YshPricingService to sync prices from catalog data
 */
export const syncDistributorPricesStep = createStep(
    "sync-distributor-prices-step",
    async (input: SyncDistributorPricesStepInput, { container }) => {
        const { distributor_id, catalog_data } = input;

        const yshPricingService = container.resolve(YSH_PRICING_MODULE);

        const stats = await yshPricingService.syncDistributorPrices(
            distributor_id,
            catalog_data
        );

        return new StepResponse(stats, {
            distributor_id,
            synced_count: stats.created + stats.updated,
        });
    },
    async (compensateData, { container }) => {
        if (!compensateData) return;

        // Compensation: mark prices as stale if sync failed
        const yshPricingService = container.resolve(YSH_PRICING_MODULE);

        console.log(
            `⚠️ Compensating sync failure for distributor ${compensateData.distributor_id}`
        );

        // Mark recently synced prices as stale
        await yshPricingService.markStalePrices(
            compensateData.distributor_id,
            new Date()
        );
    }
);
