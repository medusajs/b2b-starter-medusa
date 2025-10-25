import { MedusaService } from "@medusajs/framework/utils";
import { Manufacturer, SKU, DistributorOffer, Kit } from "./models";
import { CacheManager } from "../../utils/cache-manager";

/**
 * UnifiedCatalogModuleService
 * Serviço para gerenciar catálogo unificado de produtos solares
 * com otimizações de performance e cache Redis
 */
class UnifiedCatalogModuleService extends MedusaService({
    Manufacturer,
    SKU,
    DistributorOffer,
    Kit,
}) {
    private cacheManager: CacheManager;

    constructor(container: any, config: any) {
        super(container, config);
        this.cacheManager = CacheManager.getInstance({
            keyPrefix: 'ysh:catalog:',
            defaultTTL: 1800, // 30 minutos para dados de catálogo
        });
    }

    // ============================================================================
    // CACHE KEY GENERATORS
    // ============================================================================

    private getManufacturersCacheKey(filters: any, config: any): string {
        return `manufacturers:${JSON.stringify(filters)}:${JSON.stringify(config)}`;
    }

    private getSKUsCacheKey(filters: any, config: any): string {
        return `skus:${JSON.stringify(filters)}:${JSON.stringify(config)}`;
    }

    private getKitsCacheKey(filters: any, config: any): string {
        return `kits:${JSON.stringify(filters)}:${JSON.stringify(config)}`;
    }

    private getSKUDetailCacheKey(skuId: string): string {
        return `sku:detail:${skuId}`;
    }

    private getKitDetailCacheKey(kitId: string): string {
        return `kit:detail:${kitId}`;
    }

    // ============================================================================
    // MANUFACTURERS WITH CACHE
    // ============================================================================

    /**
     * Lista manufacturers com filtros e cache
     */
    async listManufacturersWithFilters(
        filters: { tier?: string; country?: string; is_active?: boolean } = {},
        config: { relations?: string[]; skip?: number; take?: number } = {}
    ) {
        const cacheKey = this.getManufacturersCacheKey(filters, config);

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
                const where: any = {};

                if (filters.tier) where.tier = filters.tier;
                if (filters.country) where.country = filters.country;
                if (filters.is_active !== undefined) where.is_active = filters.is_active;

                return await this.listManufacturers(where, config);
            },
            3600 // 1 hora para manufacturers
        );
    }

    /**
     * Lista e conta manufacturers com cache
     */
    async listAndCountManufacturersWithFilters(
        filters: { tier?: string; country?: string } = {},
        config: { skip?: number; take?: number } = {}
    ) {
        const cacheKey = `manufacturers:count:${JSON.stringify(filters)}:${JSON.stringify(config)}`;

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
                const where: any = { is_active: true };

                if (filters.tier) where.tier = filters.tier;
                if (filters.country) where.country = filters.country;

                return await this.listAndCountManufacturers(where, config);
            },
            1800 // 30 minutos para contagens
        );
    }

    // ============================================================================
    // SKUS WITH CACHE AND OPTIMIZATIONS
    // ============================================================================

    /**
     * Busca SKUs com filtros, relações e cache inteligente
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
        const cacheKey = this.getSKUsCacheKey(filters, config);

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
                const where: any = {};

                if (filters.category) where.category = filters.category;
                if (filters.manufacturer_id) where.manufacturer_id = filters.manufacturer_id;
                if (filters.sku_code) {
                    where.sku_code = Array.isArray(filters.sku_code)
                        ? { $in: filters.sku_code }
                        : filters.sku_code;
                }
                if (filters.is_active !== undefined) where.is_active = filters.is_active;

                // Otimizar relações - incluir apenas manufacturer por padrão
                const relations = config.relations || ["manufacturer"];

                return await this.listSKUs(where, { ...config, relations });
            },
            1800 // 30 minutos para listagens de SKUs
        );
    }

    /**
     * Lista SKUs com contagem otimizada
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
        const cacheKey = `skus:count:${JSON.stringify(filters)}:${JSON.stringify(config)}`;

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
                const where: any = { is_active: true };

                if (filters.category) where.category = filters.category;
                if (filters.manufacturer_id) where.manufacturer_id = filters.manufacturer_id;
                if (filters.is_active !== undefined) where.is_active = filters.is_active;

                // Otimizar filtros de preço
                if (filters.min_price !== undefined || filters.max_price !== undefined) {
                    where.lowest_price = {};
                    if (filters.min_price !== undefined) where.lowest_price.$gte = filters.min_price;
                    if (filters.max_price !== undefined) where.lowest_price.$lte = filters.max_price;
                }

                const relations = config.relations || ["manufacturer"];

                return await this.listAndCountSKUs(where, { ...config, relations });
            },
            900 // 15 minutos para contagens (dados mais dinâmicos)
        );
    }

    /**
     * Busca um SKU por ID ou código com cache
     */
    async retrieveSKUByIdOrCode(skuId: string, config: { relations?: string[] } = {}) {
        const cacheKey = this.getSKUDetailCacheKey(skuId);

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
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
            },
            3600 // 1 hora para detalhes de SKU
        );
    }

    // ============================================================================
    // KITS WITH CACHE AND OPTIMIZATIONS
    // ============================================================================

    /**
     * Lista kits com filtros e cache
     */
    async listKitsWithFilters(
        filters: {
            category?: string;
            target_consumer_class?: string;
            min_capacity?: number;
            max_capacity?: number;
        } = {},
        config: { skip?: number; take?: number } = {}
    ) {
        const cacheKey = this.getKitsCacheKey(filters, config);

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
                const where: any = { is_active: true };

                if (filters.category) where.category = filters.category;
                if (filters.target_consumer_class) where.target_consumer_class = filters.target_consumer_class;

                if (filters.min_capacity !== undefined || filters.max_capacity !== undefined) {
                    where.system_capacity_kwp = {};
                    if (filters.min_capacity) where.system_capacity_kwp.$gte = filters.min_capacity;
                    if (filters.max_capacity) where.system_capacity_kwp.$lte = filters.max_capacity;
                }

                return await this.listKits(where, config);
            },
            1800 // 30 minutos para kits
        );
    }

    /**
     * Lista kits com contagem otimizada
     */
    async listAndCountKitsWithFilters(
        filters: {
            category?: string;
            target_consumer_class?: string;
            min_capacity?: number;
            max_capacity?: number;
        } = {},
        config: { skip?: number; take?: number } = {}
    ) {
        const cacheKey = `kits:count:${JSON.stringify(filters)}:${JSON.stringify(config)}`;

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
                const where: any = { is_active: true };

                if (filters.category) where.category = filters.category;
                if (filters.target_consumer_class) where.target_consumer_class = filters.target_consumer_class;

                if (filters.min_capacity !== undefined || filters.max_capacity !== undefined) {
                    where.system_capacity_kwp = {};
                    if (filters.min_capacity) where.system_capacity_kwp.$gte = filters.min_capacity;
                    if (filters.max_capacity) where.system_capacity_kwp.$lte = filters.max_capacity;
                }

                return await this.listAndCountKits(where, config);
            },
            900 // 15 minutos para contagens de kits
        );
    }

    /**
     * Busca um kit por ID ou código com cache
     */
    async retrieveKitByIdOrCode(kitId: string) {
        const cacheKey = this.getKitDetailCacheKey(kitId);

        return await this.cacheManager.getOrSet(
            cacheKey,
            async () => {
                // Try by ID first
                let kit = await this.retrieveKit(kitId).catch(() => null);

                // If not found, try by kit_code using a different approach
                if (!kit) {
                    const kits = await this.listKitsWithFilters(
                        {}, // No filters, we'll filter manually
                        { take: 100 } // Reasonable limit
                    );
                    kit = kits.find(k => k.kit_code === kitId) || null;
                }

                return kit;
            },
            3600 // 1 hora para detalhes de kit
        );
    }

    // ============================================================================
    // CACHE MANAGEMENT METHODS
    // ============================================================================

    /**
     * Limpa cache relacionado a manufacturers
     */
    async clearManufacturersCache(): Promise<void> {
        await this.cacheManager.invalidateByPattern('manufacturers:*');
    }

    /**
     * Limpa cache relacionado a SKUs
     */
    async clearSKUsCache(): Promise<void> {
        await this.cacheManager.invalidateByPattern('skus:*');
        await this.cacheManager.invalidateByPattern('sku:detail:*');
    }

    /**
     * Limpa cache relacionado a kits
     */
    async clearKitsCache(): Promise<void> {
        await this.cacheManager.invalidateByPattern('kits:*');
        await this.cacheManager.invalidateByPattern('kit:detail:*');
    }

    /**
     * Limpa todo o cache do catálogo
     */
    async clearAllCache(): Promise<void> {
        await this.cacheManager.invalidateByPattern('ysh:catalog:*');
    }

    /**
        // Components é um JSON array
        const components = kit.components as any[];
        const skuIds = components.map(c => c.sku_id).filter(Boolean);

        const skus = skuIds.length > 0
            ? await this.listSKUsWithFilters({ sku_code: skuIds })
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
