import { Pool } from "pg";

// Tipos para o catálogo unificado
export interface Manufacturer {
    id: string;
    name: string;
    slug: string;
    tier?: string;
    country?: string;
    created_at: Date;
    updated_at: Date;
}

export interface SKU {
    id: string;
    sku_code: string;
    manufacturer_id: string;
    manufacturer?: Manufacturer;
    category: string;
    model_number: string;
    description?: string;
    technical_specs: any;
    lowest_price?: number;
    highest_price?: number;
    avg_price?: number;
    offers_count?: number;
    created_at: Date;
    updated_at: Date;
}

export interface DistributorOffer {
    id: string;
    sku_id: string;
    distributor_name: string;
    price: number;
    stock_status: 'in_stock' | 'out_of_stock' | 'limited' | 'on_order';
    stock_quantity?: number;
    lead_time_days?: number;
    shipping_cost?: number;
    created_at: Date;
    updated_at: Date;
}

export interface Kit {
    id: string;
    kit_code: string;
    name: string;
    category: string;
    system_capacity_kwp: number;
    components: any;
    kit_price: number;
    suitable_for?: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * UnifiedCatalogModuleService
 * Serviço para gerenciar catálogo unificado de produtos solares via PostgreSQL
 */
class UnifiedCatalogModuleService {
    private pool: Pool;

    constructor(container: any, options: any = {}) {
        // Conectar ao PostgreSQL
        this.pool = new Pool({
            host: process.env.POSTGRES_HOST || 'postgres',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            database: process.env.POSTGRES_DB || 'medusa_db',
            user: process.env.POSTGRES_USER || 'medusa_user',
            password: process.env.POSTGRES_PASSWORD || 'medusa_password',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    async __onDestroy__() {
        await this.pool.end();
    }

    /**
     * Lista manufacturers
     */
    async listManufacturers(filters?: { tier?: string }): Promise<Manufacturer[]> {
        const client = await this.pool.connect();
        try {
            let query = 'SELECT * FROM manufacturer';
            const params: any[] = [];
            
            if (filters?.tier) {
                query += ' WHERE tier = $1';
                params.push(filters.tier);
            }
            
            query += ' ORDER BY name ASC';
            
            const result = await client.query<Manufacturer>(query, params);
            return result.rows;
        } finally {
            client.release();
        }
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
