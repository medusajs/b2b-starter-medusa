import { MedusaService } from "@medusajs/framework/utils";
import { Manufacturer, SKU, DistributorOffer, Kit } from "./models";

/**
 * UnifiedCatalogModuleService
 * Serviço para gerenciar catálogo unificado de produtos solares
 */
class UnifiedCatalogModuleService extends MedusaService({
    Manufacturer,
    SKU,
    DistributorOffer,
    Kit,
}) {
    /**
     * Busca SKUs com filtros avançados
     */
    async searchSKUs(filters: {
        category?: string;
        manufacturer_id?: string;
        tier?: string;
        min_price?: number;
        max_price?: number;
        search?: string;
    }) {
        const queryFilters: any = {};

        if (filters.category) {
            queryFilters.category = filters.category;
        }

        if (filters.manufacturer_id) {
            queryFilters.manufacturer_id = filters.manufacturer_id;
        }

        if (filters.min_price || filters.max_price) {
            queryFilters.average_price = {};
            if (filters.min_price) queryFilters.average_price.$gte = filters.min_price;
            if (filters.max_price) queryFilters.average_price.$lte = filters.max_price;
        }

        return await this.listSKUs({ where: queryFilters });
    }

    /**
     * Obtém SKU com todas as ofertas de distribuidores
     */
    async getSKUWithOffers(skuId: string) {
        const sku = await this.retrieveSKU(skuId);

        const offers = await this.listDistributorOffers({
            where: { sku_id: skuId },
            order: { price: "ASC" },
        });

        return { sku, offers };
    }

    /**
     * Compara preços de um SKU entre distribuidores
     */
    async compareSKUPrices(skuId: string) {
        const { sku, offers } = await this.getSKUWithOffers(skuId);

        if (!offers || offers.length === 0) {
            return {
                sku,
                offers: [],
                comparison: null,
            };
        }

        const prices = offers.map(o => o.price);
        const lowest = Math.min(...prices);
        const highest = Math.max(...prices);
        const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

        const savings = highest - lowest;
        const savingsPct = ((savings / highest) * 100).toFixed(2);

        return {
            sku,
            offers: offers.map(offer => ({
                ...offer,
                is_best_price: offer.price === lowest,
                savings_vs_highest: (highest - offer.price).toFixed(2),
                price_difference_pct: (((offer.price - lowest) / lowest) * 100).toFixed(2),
            })),
            comparison: {
                lowest_price: lowest,
                highest_price: highest,
                average_price: average.toFixed(2),
                max_savings: savings.toFixed(2),
                max_savings_pct: savingsPct,
                total_offers: offers.length,
            },
        };
    }

    /**
     * Busca kits por capacidade e categoria
     */
    async searchKits(filters: {
        category?: string;
        min_capacity_kwp?: number;
        max_capacity_kwp?: number;
        target_consumer_class?: string;
        min_consumption?: number;
        max_consumption?: number;
    }) {
        const queryFilters: any = {};

        if (filters.category) {
            queryFilters.category = filters.category;
        }

        if (filters.target_consumer_class) {
            queryFilters.target_consumer_class = filters.target_consumer_class;
        }

        if (filters.min_capacity_kwp || filters.max_capacity_kwp) {
            queryFilters.system_capacity_kwp = {};
            if (filters.min_capacity_kwp) {
                queryFilters.system_capacity_kwp.$gte = filters.min_capacity_kwp;
            }
            if (filters.max_capacity_kwp) {
                queryFilters.system_capacity_kwp.$lte = filters.max_capacity_kwp;
            }
        }

        return await this.listKits({ where: queryFilters });
    }

    /**
     * Obtém kit com componentes expandidos
     */
    async getKitWithComponents(kitId: string) {
        const kit = await this.retrieveKit(kitId);

        // Components é um JSON array: [{ type, sku_id, quantity, confidence }]
        const components = (kit.components as unknown) as Array<{
            type: string;
            sku_id: string;
            quantity: number;
            confidence: number;
        }>;

        const skuIds = components.map(c => c.sku_id).filter(Boolean);

        const skus = skuIds.length > 0
            ? await this.listSKUs({ where: { sku_code: { $in: skuIds } } })
            : [];

        const skuMap = new Map(skus.map(s => [s.sku_code, s]));

        const expandedComponents = components.map(comp => ({
            ...comp,
            sku: skuMap.get(comp.sku_id) || null,
        }));

        return {
            ...kit,
            components: expandedComponents,
        };
    }

    /**
     * Atualiza estatísticas de pricing de um SKU baseado em suas ofertas
     */
    async updateSKUPricingStats(skuId: string) {
        const offers = await this.listDistributorOffers({
            where: { sku_id: skuId },
        });

        if (!offers || offers.length === 0) {
            return;
        }

        const prices = offers.map(o => o.price).sort((a, b) => a - b);
        const lowest = prices[0];
        const highest = prices[prices.length - 1];
        const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const median = prices[Math.floor(prices.length / 2)];
        const variation = ((highest - lowest) / lowest) * 100;

        await this.updateSKUs({
            id: skuId,
            lowest_price: lowest,
            highest_price: highest,
            average_price: average,
            median_price: median,
            price_variation_pct: variation,
            total_offers: offers.length,
        });
    }

    /**
     * Recomenda kits baseado em consumo mensal
     */
    async recommendKitsByConsumption(monthlyConsumptionKwh: number) {
        // Regra: 1 kWp gera ~110-130 kWh/mês no Brasil (média)
        const estimatedKwp = monthlyConsumptionKwh / 120;

        // Busca kits com capacidade +/- 20%
        const minCapacity = estimatedKwp * 0.8;
        const maxCapacity = estimatedKwp * 1.2;

        return await this.searchKits({
            min_capacity_kwp: minCapacity,
            max_capacity_kwp: maxCapacity,
        });
    }
}

export default UnifiedCatalogModuleService;
