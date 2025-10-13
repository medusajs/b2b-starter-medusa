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
     * Lista manufacturers com filtros
     */
    async listManufacturersWithFilters(
        filters: { tier?: string; country?: string; is_active?: boolean } = {},
        config: { relations?: string[]; skip?: number; take?: number } = {}
    ) {
        const where: any = {};

        if (filters.tier) where.tier = filters.tier;
        if (filters.country) where.country = filters.country;
        if (filters.is_active !== undefined) where.is_active = filters.is_active;

        return await this.listManufacturers(where, config);
    }

    /**
     * Lista e conta manufacturers
     */
    async listAndCountManufacturersWithFilters(
        filters: { tier?: string; country?: string } = {},
        config: { skip?: number; take?: number } = {}
    ) {
        const where: any = { is_active: true };

        if (filters.tier) where.tier = filters.tier;
        if (filters.country) where.country = filters.country;

        return await this.listAndCountManufacturers(where, config);
    }

    /**
     * Busca SKUs com filtros e relações
     */
    async listSKUsWithFilters(
        filters: {
            category?: string;
            manufacturer_id?: string;
            sku_code?: string | string[];
            is_active?: boolean;
        } = {},
        config: { relations?: string[]; skip?: number; take?: number } = {}
    ) {
        const where: any = {};

        if (filters.category) where.category = filters.category;
        if (filters.manufacturer_id) where.manufacturer_id = filters.manufacturer_id;
        if (filters.sku_code) {
            where.sku_code = Array.isArray(filters.sku_code)
                ? { $in: filters.sku_code }
                : filters.sku_code;
        }
        if (filters.is_active !== undefined) where.is_active = filters.is_active;

        // Por padrão incluir manufacturer
        const relations = config.relations || ["manufacturer"];

        return await this.listSKUs(where, { ...config, relations });
    }

    /**
     * Lista SKUs com contagem (formato Medusa padrão)
     */
    async listAndCountSKUsWithFilters(
        filters: {
            category?: string;
            manufacturer_id?: string;
            min_price?: number;
            max_price?: number;
            is_active?: boolean;
        } = {},
        config: { skip?: number; take?: number; relations?: string[] } = {}
    ) {
        const where: any = { is_active: true };

        if (filters.category) where.category = filters.category;
        if (filters.manufacturer_id) where.manufacturer_id = filters.manufacturer_id;
        if (filters.is_active !== undefined) where.is_active = filters.is_active;

        // Price range filters
        if (filters.min_price !== undefined || filters.max_price !== undefined) {
            where.lowest_price = {};
            if (filters.min_price !== undefined) where.lowest_price.$gte = filters.min_price;
            if (filters.max_price !== undefined) where.lowest_price.$lte = filters.max_price;
        }

        const relations = config.relations || ["manufacturer"];

        return await this.listAndCountSKUs(where, { ...config, relations });
    }

    /**
     * Busca um SKU por ID ou código
     */
    async retrieveSKUByIdOrCode(skuId: string, config: { relations?: string[] } = {}) {
        const relations = config.relations || ["manufacturer", "offers"];

        // Try by ID first
        let sku = await this.retrieveSKU(skuId, { relations }).catch(() => null);

        // If not found, try by sku_code
        if (!sku) {
            const skus = await this.listSKUs(
                { sku_code: skuId },
                { relations, take: 1 }
            );
            sku = skus[0] || null;
        }

        return sku;
    }

    /**
     * Lista ofertas de distribuidores
     */
    async listDistributorOffersWithFilters(
        filters: {
            sku_id?: string;
            distributor_slug?: string;
            stock_status?: string;
        } = {},
        config: { orderBy?: Record<string, "ASC" | "DESC"> } = {}
    ) {
        const where: any = {};

        if (filters.sku_id) where.sku_id = filters.sku_id;
        if (filters.distributor_slug) where.distributor_slug = filters.distributor_slug;
        if (filters.stock_status) where.stock_status = filters.stock_status;

        const orderBy = config.orderBy || { price: "ASC" };

        return await this.listDistributorOffers(where, { orderBy });
    }

    /**
     * Lista kits com filtros
     */
    async listKits(
        filters: {
            category?: string;
            target_consumer_class?: string;
            min_capacity?: number;
            max_capacity?: number;
        } = {},
        config: { skip?: number; take?: number } = {}
    ) {
        const where: any = { is_active: true };

        if (filters.category) where.category = filters.category;
        if (filters.target_consumer_class) where.target_consumer_class = filters.target_consumer_class;

        if (filters.min_capacity !== undefined || filters.max_capacity !== undefined) {
            where.system_capacity_kwp = {};
            if (filters.min_capacity) where.system_capacity_kwp.$gte = filters.min_capacity;
            if (filters.max_capacity) where.system_capacity_kwp.$lte = filters.max_capacity;
        }

        return await this.listKits_(where, config);
    }

    /**
     * Lista kits com contagem (formato Medusa padrão)
     */
    async listAndCountKits(
        filters: {
            category?: string;
            target_consumer_class?: string;
            min_capacity?: number;
            max_capacity?: number;
        } = {},
        config: { skip?: number; take?: number } = {}
    ) {
        const where: any = { is_active: true };

        if (filters.category) where.category = filters.category;
        if (filters.target_consumer_class) where.target_consumer_class = filters.target_consumer_class;

        if (filters.min_capacity !== undefined || filters.max_capacity !== undefined) {
            where.system_capacity_kwp = {};
            if (filters.min_capacity) where.system_capacity_kwp.$gte = filters.min_capacity;
            if (filters.max_capacity) where.system_capacity_kwp.$lte = filters.max_capacity;
        }

        return await this.listAndCountKits_(where, config);
    }

    /**
     * Busca um kit por ID ou código
     */
    async retrieveKit(kitId: string) {
        // Try by ID first
        let kit = await this.retrieveKit_(kitId).catch(() => null);

        // If not found, try by kit_code
        if (!kit) {
            const kits = await this.listKits_(
                { kit_code: kitId },
                { take: 1 }
            );
            kit = kits[0] || null;
        }

        return kit;
    }

    /**
     * Atualiza estatísticas de pricing de um SKU
     */
    async updateSKUPricingStats(skuId: string) {
        const offers = await this.listDistributorOffers({ sku_id: skuId });

        if (!offers || offers.length === 0) {
            return;
        }

        const prices = offers.map(o => o.price).sort((a, b) => a - b);
        const lowest = prices[0];
        const highest = prices[prices.length - 1];
        const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

        // Calculate median
        const mid = Math.floor(prices.length / 2);
        const median = prices.length % 2 === 0
            ? (prices[mid - 1] + prices[mid]) / 2
            : prices[mid];

        await this.updateSKUs_([{
            id: skuId,
            lowest_price: lowest,
            highest_price: highest,
            average_price: average,
            median_price: median,
            total_offers: offers.length,
            price_variation_pct: highest > 0 ? ((highest - lowest) / highest) * 100 : 0,
        }]);
    }

    /**
     * Busca SKUs com filtros avançados
     */
    async searchSKUs(filters: {
        category?: string;
        manufacturer_id?: string;
        min_price?: number;
        max_price?: number;
        search?: string;
    }) {
        return await this.listSKUs(filters, { relations: ["manufacturer"] });
    }

    /**
     * Obtém SKU com todas as ofertas de distribuidores
     */
    async getSKUWithOffers(skuId: string) {
        const sku = await this.retrieveSKU(skuId, { relations: ["manufacturer"] });
        const offers = await this.listDistributorOffers(
            { sku_id: sku?.id },
            { orderBy: { price: "ASC" } }
        );

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
        min_capacity?: number;
        max_capacity?: number;
        target_consumer_class?: string;
    }) {
        return await this.listKits({
            category: filters.category,
            target_consumer_class: filters.target_consumer_class,
            min_capacity: filters.min_capacity,
            max_capacity: filters.max_capacity,
        });
    }

    /**
     * Obtém kit com componentes expandidos
     */
    async getKitWithComponents(kitId: string) {
        const kit = await this.retrieveKit(kitId);

        if (!kit) return null;

        // Components é um JSON array
        const components = kit.components as any[];
        const skuIds = components.map(c => c.sku_id).filter(Boolean);

        const skus = skuIds.length > 0
            ? await this.listSKUs({ sku_code: skuIds })
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
     * Recomenda kits baseado em consumo mensal
     */
    async recommendKitsByConsumption(monthlyConsumptionKwh: number) {
        // Regra: 1 kWp gera ~110-130 kWh/mês no Brasil (média)
        const estimatedKwp = monthlyConsumptionKwh / 120;

        // Busca kits com capacidade +/- 20%
        const minCapacity = estimatedKwp * 0.8;
        const maxCapacity = estimatedKwp * 1.2;

        return await this.searchKits({
            min_capacity: minCapacity,
            max_capacity: maxCapacity,
        });
    }
}

export default UnifiedCatalogModuleService;
