import { MedusaContainer } from "@medusajs/framework/types";
import { YSH_PRICING_MODULE } from "../modules/ysh-pricing";
import { syncDistributorPricesWorkflow } from "../modules/ysh-pricing/workflows";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Scheduled Job: Sync All Distributor Prices
 * Runs 4 times daily (6h, 12h, 18h, 0h) to update prices from all distributors
 */
export default async function syncAllDistributorPrices(
    container: MedusaContainer
) {
    console.log("🔄 Starting scheduled distributor prices sync...");

    try {
        const yshPricingService = container.resolve(YSH_PRICING_MODULE);

        // Get all active distributors
        const distributors = await yshPricingService.listDistributors({
            is_active: true,
        });

        console.log(`📊 Found ${distributors.length} active distributors`);

        const catalogPath = process.env.YSH_CATALOG_PATH || "../../ysh-erp/data/catalog";

        for (const distributor of distributors) {
            try {
                console.log(`  🔄 Syncing ${distributor.name}...`);

                // Load catalog data for this distributor
                // In production, this would fetch from distributor API or S3
                const catalogData = loadDistributorCatalog(
                    catalogPath,
                    distributor.slug
                );

                if (!catalogData || catalogData.length === 0) {
                    console.log(`  ⚠️ No catalog data for ${distributor.name}`);
                    continue;
                }

                // Run sync workflow
                const { result } = await syncDistributorPricesWorkflow(container).run({
                    input: {
                        distributor_id: distributor.id,
                        catalog_data: catalogData,
                    },
                });

                console.log(
                    `  ✅ ${distributor.name}: ${result.created} created, ${result.updated} updated, ${result.errors} errors`
                );
            } catch (error) {
                console.error(
                    `  ❌ Failed to sync ${distributor.name}:`,
                    (error as Error).message
                );
            }
        }

        // Get updated stats
        const stats = await yshPricingService.getDistributorStats();
        console.log("📈 Distributor stats:");
        stats.forEach((stat: any) => {
            console.log(
                `  - ${stat.name}: ${stat.active_prices} active, ${stat.stale_prices} stale`
            );
        });

        console.log("✅ Scheduled distributor prices sync completed");
    } catch (error) {
        console.error(
            "❌ Scheduled distributor prices sync failed:",
            (error as Error).message
        );
    }
}

/**
 * Load catalog data for a distributor
 * In production, this would fetch from distributor API or data lake
 */
function loadDistributorCatalog(
    basePath: string,
    distributorSlug: string
): any[] {
    const categories = [
        "inverters",
        "kits",
        "panels",
        "ev_chargers",
        "batteries",
        "cables",
        "structures",
    ];

    const allProducts: any[] = [];

    for (const category of categories) {
        try {
            const filePath = join(
                basePath,
                "unified_schemas",
                `${category}_unified.json`
            );
            const rawData = JSON.parse(readFileSync(filePath, "utf-8"));

            // Filter products for this distributor
            const distributorProducts = rawData.filter((p: any) => {
                const source = (p.source || "").toLowerCase();
                const manufacturer = (p.manufacturer || "").toLowerCase();
                return (
                    source.includes(distributorSlug) ||
                    manufacturer.includes(distributorSlug)
                );
            });

            allProducts.push(...distributorProducts);
        } catch (error) {
            // Category file not found or parse error
            continue;
        }
    }

    return allProducts;
}

export const config = {
    name: "sync-all-distributor-prices",
    // Runs at 6h, 12h, 18h, 0h (4x per day)
    schedule: "0 6,12,18,0 * * *",
};
