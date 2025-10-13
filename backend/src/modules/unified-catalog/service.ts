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
    async listManufacturers(
        filters: { tier?: string; country?: string; is_active?: boolean } = {},
        config: { relations?: string[]; skip?: number; take?: number } = {}
    ) {
        const where: any = {};
        
        if (filters.tier) where.tier = filters.tier;
        if (filters.country) where.country = filters.country;
        if (filters.is_active !== undefined) where.is_active = filters.is_active;

        return await this.listManufacturers_(where, config);
    }
    
    /**
     * Lista e conta manufacturers
     */
    async listAndCountManufacturers(
        filters: { tier?: string; country?: string } = {},
        config: { skip?: number; take?: number } = {}
    ) {
        const where: any = { is_active: true };
        
        if (filters.tier) where.tier = filters.tier;
        if (filters.country) where.country = filters.country;

        return await this.listAndCountManufacturers_(where, config);
    }

    /**
     * Busca SKUs com filtros
     */
    async listSKUs(options?: { where?: any }): Promise<SKU[]> {
        const client = await this.pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (options?.where) {
                const where = options.where;

                if (where.category) {
                    conditions.push(`s.category = $${paramIndex++}`);
                    params.push(where.category);
                }

                if (where.manufacturer_id) {
                    conditions.push(`s.manufacturer_id = $${paramIndex++}`);
                    params.push(where.manufacturer_id);
                }

                if (where.sku_code?.$in) {
                    conditions.push(`s.sku_code = ANY($${paramIndex++})`);
                    params.push(where.sku_code.$in);
                }
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            const query = `
                SELECT 
                    s.*, 
                    m.id as "manufacturer.id",
                    m.name as "manufacturer.name",
                    m.slug as "manufacturer.slug",
                    m.tier as "manufacturer.tier"
                FROM sku s
                LEFT JOIN manufacturer m ON s.manufacturer_id = m.id
                ${whereClause}
                ORDER BY s.sku_code ASC
            `;

            const result = await client.query(query, params);

            return result.rows.map((row: any) => ({
                id: row.id,
                sku_code: row.sku_code,
                manufacturer_id: row.manufacturer_id,
                category: row.category,
                model_number: row.model_number,
                description: row.description,
                technical_specs: row.technical_specs,
                lowest_price: row.lowest_price,
                highest_price: row.highest_price,
                avg_price: row.avg_price,
                offers_count: row.offers_count,
                created_at: row.created_at,
                updated_at: row.updated_at,
                manufacturer: row['manufacturer.id'] ? {
                    id: row['manufacturer.id'],
                    name: row['manufacturer.name'],
                    slug: row['manufacturer.slug'],
                    tier: row['manufacturer.tier'],
                    created_at: undefined as any,
                    updated_at: undefined as any,
                } : undefined,
            }));
        } finally {
            client.release();
        }
    }

    /**
     * Lista SKUs com contagem (formato Medusa padrão)
     */
    async listAndCountSKUs(options?: {
        where?: any;
        skip?: number;
        take?: number;
    }): Promise<[SKU[], number]> {
        const client = await this.pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (options?.where) {
                const where = options.where;

                if (where.category) {
                    conditions.push(`s.category = $${paramIndex++}`);
                    params.push(where.category);
                }

                if (where.manufacturer_id) {
                    conditions.push(`s.manufacturer_id = $${paramIndex++}`);
                    params.push(where.manufacturer_id);
                }

                if (where.sku_code?.$in) {
                    conditions.push(`s.sku_code = ANY($${paramIndex++})`);
                    params.push(where.sku_code.$in);
                }
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            // Count query
            const countQuery = `
                SELECT COUNT(*) as total
                FROM sku s
                ${whereClause}
            `;
            const countResult = await client.query(countQuery, params);
            const total = parseInt(countResult.rows[0].total);

            // Data query with pagination
            const limit = options?.take || 20;
            const offset = options?.skip || 0;

            const dataQuery = `
                SELECT 
                    s.*, 
                    m.id as "manufacturer.id",
                    m.name as "manufacturer.name",
                    m.slug as "manufacturer.slug",
                    m.tier as "manufacturer.tier"
                FROM sku s
                LEFT JOIN manufacturer m ON s.manufacturer_id = m.id
                ${whereClause}
                ORDER BY s.sku_code ASC
                LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;

            const dataResult = await client.query(dataQuery, [...params, limit, offset]);

            const skus = dataResult.rows.map((row: any) => ({
                id: row.id,
                sku_code: row.sku_code,
                manufacturer_id: row.manufacturer_id,
                category: row.category,
                model_number: row.model_number,
                description: row.description,
                technical_specs: row.technical_specs,
                lowest_price: row.lowest_price,
                highest_price: row.highest_price,
                avg_price: row.avg_price,
                offers_count: row.offers_count,
                created_at: row.created_at,
                updated_at: row.updated_at,
                manufacturer: row['manufacturer.id'] ? {
                    id: row['manufacturer.id'],
                    name: row['manufacturer.name'],
                    slug: row['manufacturer.slug'],
                    tier: row['manufacturer.tier'],
                    created_at: undefined as any,
                    updated_at: undefined as any,
                } : undefined,
            }));

            return [skus, total];
        } finally {
            client.release();
        }
    }

    /**
     * Busca um SKU por ID
     */
    async retrieveSKU(skuId: string): Promise<SKU | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    s.*, 
                    m.id as "manufacturer.id",
                    m.name as "manufacturer.name",
                    m.slug as "manufacturer.slug",
                    m.tier as "manufacturer.tier"
                FROM sku s
                LEFT JOIN manufacturer m ON s.manufacturer_id = m.id
                WHERE s.id = $1 OR s.sku_code = $1
            `, [skuId]);

            if (result.rows.length === 0) return null;

            const row = result.rows[0];
            return {
                id: row.id,
                sku_code: row.sku_code,
                manufacturer_id: row.manufacturer_id,
                category: row.category,
                model_number: row.model_number,
                description: row.description,
                technical_specs: row.technical_specs,
                lowest_price: row.lowest_price,
                highest_price: row.highest_price,
                avg_price: row.avg_price,
                offers_count: row.offers_count,
                created_at: row.created_at,
                updated_at: row.updated_at,
                manufacturer: row['manufacturer.id'] ? {
                    id: row['manufacturer.id'],
                    name: row['manufacturer.name'],
                    slug: row['manufacturer.slug'],
                    tier: row['manufacturer.tier'],
                    created_at: undefined as any,
                    updated_at: undefined as any,
                } : undefined,
            };
        } finally {
            client.release();
        }
    }

    /**
     * Lista ofertas de distribuidores
     */
    async listDistributorOffers(options?: { where?: any; order?: any }): Promise<DistributorOffer[]> {
        const client = await this.pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (options?.where?.sku_id) {
                conditions.push(`sku_id = $${paramIndex++}`);
                params.push(options.where.sku_id);
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            const orderBy = options?.order?.price === 'ASC'
                ? 'ORDER BY price ASC'
                : 'ORDER BY price ASC';

            const query = `
                SELECT * FROM distributor_offer
                ${whereClause}
                ${orderBy}
            `;

            const result = await client.query<DistributorOffer>(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Lista kits
     */
    async listKits(options?: { where?: any }): Promise<Kit[]> {
        const client = await this.pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (options?.where) {
                const where = options.where;

                if (where.category) {
                    conditions.push(`category = $${paramIndex++}`);
                    params.push(where.category);
                }

                if (where.target_consumer_class) {
                    conditions.push(`suitable_for = $${paramIndex++}`);
                    params.push(where.target_consumer_class);
                }

                if (where.system_capacity_kwp?.$gte) {
                    conditions.push(`system_capacity_kwp >= $${paramIndex++}`);
                    params.push(where.system_capacity_kwp.$gte);
                }

                if (where.system_capacity_kwp?.$lte) {
                    conditions.push(`system_capacity_kwp <= $${paramIndex++}`);
                    params.push(where.system_capacity_kwp.$lte);
                }
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            const query = `
                SELECT * FROM kit
                ${whereClause}
                ORDER BY system_capacity_kwp ASC
            `;

            const result = await client.query<Kit>(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Lista kits com contagem (formato Medusa padrão)
     */
    async listAndCountKits(options?: {
        where?: any;
        skip?: number;
        take?: number;
    }): Promise<[Kit[], number]> {
        const client = await this.pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (options?.where) {
                const where = options.where;

                if (where.category) {
                    conditions.push(`category = $${paramIndex++}`);
                    params.push(where.category);
                }

                if (where.target_consumer_class) {
                    conditions.push(`suitable_for = $${paramIndex++}`);
                    params.push(where.target_consumer_class);
                }

                if (where.system_capacity_kwp?.$gte) {
                    conditions.push(`system_capacity_kwp >= $${paramIndex++}`);
                    params.push(where.system_capacity_kwp.$gte);
                }

                if (where.system_capacity_kwp?.$lte) {
                    conditions.push(`system_capacity_kwp <= $${paramIndex++}`);
                    params.push(where.system_capacity_kwp.$lte);
                }
            }

            const whereClause = conditions.length > 0
                ? 'WHERE ' + conditions.join(' AND ')
                : '';

            // Count query
            const countQuery = `
                SELECT COUNT(*) as total
                FROM kit
                ${whereClause}
            `;
            const countResult = await client.query(countQuery, params);
            const total = parseInt(countResult.rows[0].total);

            // Data query with pagination
            const limit = options?.take || 20;
            const offset = options?.skip || 0;

            const dataQuery = `
                SELECT * FROM kit
                ${whereClause}
                ORDER BY system_capacity_kwp ASC
                LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;

            const dataResult = await client.query<Kit>(dataQuery, [...params, limit, offset]);

            return [dataResult.rows, total];
        } finally {
            client.release();
        }
    }

    /**
     * Busca um kit por ID
     */
    async retrieveKit(kitId: string): Promise<Kit | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query<Kit>(`
                SELECT * FROM kit
                WHERE id = $1 OR kit_code = $1
            `, [kitId]);

            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }

    /**
     * Atualiza um SKU
     */
    async updateSKUs(data: any): Promise<void> {
        const client = await this.pool.connect();
        try {
            const fields = Object.keys(data).filter(k => k !== 'id');
            const values = fields.map((_, i) => `$${i + 2}`);
            const sets = fields.map((f, i) => `${f} = $${i + 2}`);

            const query = `
                UPDATE sku
                SET ${sets.join(', ')}, updated_at = NOW()
                WHERE id = $1
            `;

            await client.query(query, [data.id, ...fields.map(f => data[f])]);
        } finally {
            client.release();
        }
    }

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
    }): Promise<SKU[]> {
        const where: any = {};

        if (filters.category) where.category = filters.category;
        if (filters.manufacturer_id) where.manufacturer_id = filters.manufacturer_id;

        return await this.listSKUs({ where });
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
    }): Promise<Kit[]> {
        const where: any = {};

        if (filters.category) where.category = filters.category;
        if (filters.target_consumer_class) where.target_consumer_class = filters.target_consumer_class;

        if (filters.min_capacity_kwp || filters.max_capacity_kwp) {
            where.system_capacity_kwp = {};
            if (filters.min_capacity_kwp) where.system_capacity_kwp.$gte = filters.min_capacity_kwp;
            if (filters.max_capacity_kwp) where.system_capacity_kwp.$lte = filters.max_capacity_kwp;
        }

        return await this.listKits({ where });
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

        await this.updateSKUs({
            id: skuId,
            lowest_price: lowest,
            highest_price: highest,
            avg_price: average,
            offers_count: offers.length,
        });
    }

    /**
     * Recomenda kits baseado em consumo mensal
     */
    async recommendKitsByConsumption(monthlyConsumptionKwh: number): Promise<Kit[]> {
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
