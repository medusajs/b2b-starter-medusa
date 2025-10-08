import { MedusaService } from "@medusajs/framework/utils";
import { Distributor } from "./models/distributor";
import { DistributorPrice } from "./models/distributor-price";
import type {
    PricingTier,
    ProductPricing,
    DistributorConfig,
    InventoryData,
    SyncStats,
} from "./types/common";

type YshPricingServiceProps = {
    catalogPath?: string;
};

/**
 * YSH Pricing Service
 * Handles multi-distributor pricing logic consolidated from YSH ERP
 */
export default class YshPricingService extends MedusaService({
    Distributor,
    DistributorPrice,
}) {
    private priceCache: Map<string, ProductPricing>;
    private inventoryCache: Map<string, InventoryData[]>;
    private readonly CACHE_TTL = 3600000; // 1 hour in ms

    constructor(container: any, options: YshPricingServiceProps = {}) {
        super(...arguments);
        this.priceCache = new Map();
        this.inventoryCache = new Map();
    }

    /**
     * Get multi-distributor pricing for a variant
     * Returns all pricing tiers sorted by best price
     */
    async getMultiDistributorPricing(
        variantId: string,
        currencyCode: string = "BRL",
        companyName?: string
    ): Promise<ProductPricing | null> {
        const cacheKey = `${variantId}-${currencyCode}-${companyName || "all"}`;

        // Check cache first
        const cached = this.priceCache.get(cacheKey);
        if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_TTL) {
            return cached;
        }

        // Fetch from database
        const prices = await this.listDistributorPrices({
            variant_id: variantId,
            currency_code: currencyCode,
        });

        if (!prices || prices.length === 0) {
            return null;
        }

        // Convert to pricing tiers
        const tiers: PricingTier[] = await Promise.all(
            prices.map(async (price) => {
                const distributor = await this.retrieveDistributor(
                    price.distributor_id
                );

                if (!distributor) {
                    return null;
                }

                // Filter by company if specified
                if (companyName && distributor.allowed_companies) {
                    const allowedCompanies =
                        distributor.allowed_companies as unknown as string[];
                    if (
                        !allowedCompanies.includes(companyName) &&
                        allowedCompanies.length > 0
                    ) {
                        return null;
                    }
                }

                return {
                    distributor: distributor.name,
                    distributor_id: distributor.id,
                    basePrice: price.base_price,
                    finalPrice: price.final_price,
                    markup: distributor.price_markup,
                    availability: price.availability,
                    leadTime: price.lead_time_days || distributor.default_lead_time_days,
                    minQuantity: price.min_quantity,
                    qtyAvailable: price.qty_available,
                } as PricingTier;
            })
        );

        // Filter out nulls and sort by final price
        const validTiers = tiers.filter(
            (t): t is PricingTier => t !== null
        ) as PricingTier[];

        if (validTiers.length === 0) {
            return null;
        }

        validTiers.sort((a, b) => a.finalPrice - b.finalPrice);

        const pricing: ProductPricing = {
            variantId,
            variantExternalId: prices[0]?.variant_external_id || undefined,
            currency: currencyCode,
            tiers: validTiers,
            bestOffer: validTiers[0],
            lastUpdated: new Date(),
        };

        // Cache the result
        this.priceCache.set(cacheKey, pricing);

        return pricing;
    }

    /**
     * Compare prices across all distributors
     */
    async compareDistributorPrices(
        variantId: string,
        currencyCode: string = "BRL"
    ) {
        const pricing = await this.getMultiDistributorPricing(
            variantId,
            currencyCode
        );

        if (!pricing) {
            return {
                variantId,
                available: false,
                tiers: [],
            };
        }

        return {
            variantId,
            available: true,
            tiers: pricing.tiers,
            priceDiff: {
                min: pricing.bestOffer.finalPrice,
                max: pricing.tiers[pricing.tiers.length - 1].finalPrice,
                savings:
                    pricing.tiers[pricing.tiers.length - 1].finalPrice -
                    pricing.bestOffer.finalPrice,
                savingsPercent:
                    ((pricing.tiers[pricing.tiers.length - 1].finalPrice -
                        pricing.bestOffer.finalPrice) /
                        pricing.tiers[pricing.tiers.length - 1].finalPrice) *
                    100,
            },
        };
    }

    /**
     * Get aggregated inventory from multiple distributors
     */
    async getMultiDistributorInventory(
        variantId: string
    ): Promise<InventoryData[]> {
        const cacheKey = `inv-${variantId}`;

        // Check cache
        const cached = this.inventoryCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const prices = await this.listDistributorPrices({
            variant_id: variantId,
        });

        const inventory: InventoryData[] = await Promise.all(
            prices.map(async (price) => {
                const distributor = await this.retrieveDistributor(
                    price.distributor_id
                );

                return {
                    distributor: distributor?.name || "Unknown",
                    qty_available: price.qty_available,
                    qty_reserved: price.qty_reserved,
                    allow_backorder: price.allow_backorder,
                    restock_date: price.restock_date || undefined,
                    warehouse_location: price.warehouse_location || undefined,
                };
            })
        );

        // Cache for shorter period (inventory changes more frequently)
        this.inventoryCache.set(cacheKey, inventory);
        setTimeout(() => this.inventoryCache.delete(cacheKey), 300000); // 5 min

        return inventory;
    }

    /**
     * Sync prices from a distributor's catalog
     * This replaces the ERP sync logic
     */
    async syncDistributorPrices(
        distributorId: string,
        catalogData: any[]
    ): Promise<SyncStats> {
        const startTime = Date.now();
        const stats: SyncStats = {
            total: catalogData.length,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0,
            duration_ms: 0,
        };

        const distributor = await this.retrieveDistributor(distributorId);
        if (!distributor) {
            throw new Error(`Distributor ${distributorId} not found`);
        }

        for (const product of catalogData) {
            try {
                const variantId = product.variant_id;
                const variantExternalId = product.sku || product.external_id;
                const basePrice = parseFloat(product.price || product.base_price || 0);

                if (!variantId || basePrice <= 0) {
                    stats.skipped++;
                    continue;
                }

                // Calculate final price with markup
                const finalPrice = basePrice * distributor.price_markup;

                // Check if price already exists
                const existing = await this.listDistributorPrices({
                    variant_id: variantId,
                    distributor_id: distributorId,
                });

                const priceData = {
                    distributor_id: distributorId,
                    variant_id: variantId,
                    variant_external_id: variantExternalId,
                    base_price: basePrice,
                    final_price: finalPrice,
                    currency_code: product.currency_code || "BRL",
                    availability: product.availability || "in_stock",
                    qty_available: product.qty_available || 0,
                    qty_reserved: product.qty_reserved || 0,
                    allow_backorder: product.allow_backorder || false,
                    lead_time_days: product.lead_time_days || null,
                    min_quantity: product.min_quantity || 1,
                    warehouse_location: product.warehouse_location || null,
                    last_updated_at: new Date(),
                    is_stale: false,
                };

                if (existing && existing.length > 0) {
                    // Update existing price
                    await this.updateDistributorPrices({
                        id: existing[0].id,
                        ...priceData,
                    });
                    stats.updated++;
                } else {
                    // Create new price
                    await this.createDistributorPrices(priceData);
                    stats.created++;
                }
            } catch (error) {
                console.error(
                    `Error syncing product ${product.sku}:`,
                    (error as Error).message
                );
                stats.errors++;
            }
        }

        // Update distributor last sync time
        await this.updateDistributors({
            id: distributorId,
            last_sync_at: new Date(),
        });

        // Clear cache after sync
        this.clearPriceCache();

        stats.duration_ms = Date.now() - startTime;
        return stats;
    }

    /**
     * Mark stale prices (not updated in last sync)
     */
    async markStalePrices(distributorId: string, updatedBefore: Date) {
        const stalePrices = await this.listDistributorPrices({
            distributor_id: distributorId,
            // Add filter for last_updated_at < updatedBefore when supported
        });

        for (const price of stalePrices) {
            if (price.last_updated_at < updatedBefore) {
                await this.updateDistributorPrices({
                    id: price.id,
                    is_stale: true,
                });
            }
        }
    }

    /**
     * Clear price cache
     */
    clearPriceCache() {
        this.priceCache.clear();
    }

    /**
     * Clear inventory cache
     */
    clearInventoryCache() {
        this.inventoryCache.clear();
    }

    /**
     * Get distributor statistics
     */
    async getDistributorStats() {
        const distributors = await this.listDistributors({});

        return Promise.all(
            distributors.map(async (dist) => {
                const prices = await this.listDistributorPrices({
                    distributor_id: dist.id,
                });

                const activePrices = prices.filter((p) => !p.is_stale);
                const stalePrices = prices.filter((p) => p.is_stale);

                return {
                    id: dist.id,
                    name: dist.name,
                    active: dist.is_active,
                    total_prices: prices.length,
                    active_prices: activePrices.length,
                    stale_prices: stalePrices.length,
                    last_sync: dist.last_sync_at,
                    priority: dist.priority,
                };
            })
        );
    }
}
