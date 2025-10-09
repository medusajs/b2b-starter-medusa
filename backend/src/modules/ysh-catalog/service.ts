import { Pool, PoolClient } from "pg";

// Tipos para produtos do catálogo unificado
export interface CatalogProduct {
    id?: string;
    sku?: string;
    name?: string;
    manufacturer: string;
    category: string;
    price?: string;
    image?: string;
    source?: string;
    availability?: string;
    description?: string;
    processed_images?: {
        thumb?: string;
        medium?: string;
        large?: string;
    };
    // Campos específicos para painéis
    model?: string;
    technology?: string;
    kwp?: number;
    cells?: number;
    efficiency_pct?: number;
    dimensions_mm?: {
        length: number;
        width: number;
        thickness: number;
    };
    weight_kg?: number;
    warranty_years?: {
        product: number;
        performance: number;
    };
    // Campos específicos para inversores
    power_w?: number;
    voltage_v?: number;
    phases?: string;
    // Campos específicos para estruturas
    type?: string;
    material?: string;
    // Metadata adicional
    [key: string]: any;
}

export interface CatalogResponse {
    products: CatalogProduct[];
    total: number;
    page: number;
    limit: number;
}

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

class YshCatalogModuleService {
    private pool: Pool;

    constructor(container: any, options: any = {}) {
        // Conectar ao PostgreSQL usando variáveis de ambiente
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
     * LÃª um arquivo JSON do catÃ¡logo (usando schemas unificados quando disponÃ­veis)
     */
    private readCatalogFile(filename: string): CatalogProduct[] {
        try {
            // Primeiro tenta ler do schema unificado
            const unifiedFilename = filename.replace('.json', '_unified.json');
            const unifiedFilePath = path.join(this.unifiedSchemasPath, unifiedFilename);
            const normalizedUnifiedPath = path.join(this.unifiedSchemasPath, unifiedFilename.replace('.json', '_normalized.json'));

            // Preferir versÃ£o normalizada, se disponÃ­vel
            if (fs.existsSync(normalizedUnifiedPath)) {
                const data = fs.readFileSync(normalizedUnifiedPath, 'utf-8');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            }

            if (fs.existsSync(unifiedFilePath)) {
                console.log(`ðŸ“„ Lendo schema unificado: ${unifiedFilename}`);
                const data = fs.readFileSync(unifiedFilePath, 'utf-8');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            }

            // Fallback para arquivo original
            const originalFilePath = path.join(this.catalogPath, filename);
            if (fs.existsSync(originalFilePath)) {
                console.log(`ðŸ“„ Lendo arquivo original: ${filename}`);
                const data = fs.readFileSync(originalFilePath, 'utf-8');
                const parsed = JSON.parse(data);

                // Alguns arquivos tÃªm estrutura diferente
                if (filename === 'panels.json' && parsed.panels) {
                    return parsed.panels;
                }

                return Array.isArray(parsed) ? parsed : [];
            }

            console.warn(`Arquivo nÃ£o encontrado: ${filename} (nem unificado nem original)`);
            // Fallback adicional: tentar dentro do repositÃ³rio (src/data/catalog)
            try {
                const unifiedFilename = filename.replace('.json', '_unified.json');
                const localUnifiedPath = path.resolve(__dirname, `../../data/catalog/unified_schemas/${unifiedFilename}`);
                if (fs.existsSync(localUnifiedPath)) {
                    console.log(`ðŸ“š Lendo schema unificado (local src): ${unifiedFilename}`);
                    const data = fs.readFileSync(localUnifiedPath, 'utf-8');
                    const parsed = JSON.parse(data);
                    return Array.isArray(parsed) ? parsed : [];
                }
                const localOriginalPath = path.resolve(__dirname, `../../data/catalog/${filename}`);
                if (fs.existsSync(localOriginalPath)) {
                    console.log(`ðŸ“„ Lendo arquivo original (local src): ${filename}`);
                    const data = fs.readFileSync(localOriginalPath, 'utf-8');
                    const parsed = JSON.parse(data);
                    if (filename === 'panels.json' && (parsed as any).panels) {
                        return (parsed as any).panels;
                    }
                    return Array.isArray(parsed) ? parsed : [];
                }
            } catch { /* ignore */ }

            return [];
        } catch (error) {
            console.error(`Erro ao ler arquivo ${filename}:`, error);
            return [];
        }
    }

    /**
     * Normaliza os caminhos das imagens processadas para URLs acessÃ­veis
     */
    private normalizeImagePaths(product: CatalogProduct): CatalogProduct {
        if (!product.processed_images) {
            product.processed_images = {};
        }

        const processedImages = product.processed_images;

        // Converte caminhos relativos para caminhos absolutos acessÃ­veis via API
        Object.keys(processedImages).forEach(size => {
            const imagePath = processedImages[size as keyof typeof processedImages];
            if (imagePath && typeof imagePath === 'string') {
                // Remove 'catalog\' ou 'catalog/' do inÃ­cio se existir
                let cleanPath = imagePath.replace(/^catalog[\/\\]/, '');
                // Remove './' ou '../' do inÃ­cio
                cleanPath = cleanPath.replace(/^\.{1,2}[\/\\]/, '');
                // Converte todas as barras invertidas para barras normais
                cleanPath = cleanPath.replace(/\\/g, '/');
                // Garante que comeÃ§a com /
                if (!cleanPath.startsWith('/')) {
                    cleanPath = '/' + cleanPath;
                }
                processedImages[size as keyof typeof processedImages] = cleanPath;
            }
        });

        // Fallback para imagem original se processed_images estiver vazio
        if (!processedImages.thumb && !processedImages.medium && !processedImages.large) {
            const fallbackImage = product.image || product.image_url;
            if (fallbackImage) {
                let cleanFallback = fallbackImage;
                if (!cleanFallback.startsWith('/')) {
                    cleanFallback = '/' + cleanFallback;
                }
                processedImages.thumb = cleanFallback;
                processedImages.medium = cleanFallback;
                processedImages.large = cleanFallback;
            }
        }

        return product;
    }

    private parsePriceValue(priceStr?: string): number | undefined {
        if (!priceStr) return undefined
        // Keep only digits, dots and commas
        const cleaned = priceStr.replace(/[^0-9.,]/g, "")
        // If has both '.' and ',', assume '.' thousand sep and ',' decimal
        let normalized = cleaned
        if (cleaned.includes('.') && cleaned.includes(',')) {
            normalized = cleaned.replace(/\./g, '').replace(',', '.')
        } else if (cleaned.includes(',')) {
            normalized = cleaned.replace(',', '.')
        } // else only dot present -> already decimal
        const num = parseFloat(normalized)
        return isNaN(num) ? undefined : num
    }

    /**
     * Tenta carregar schema enriquecido por id/sku
     */
    private loadEnrichedSchema(id?: string, sku?: string): Record<string, any> | null {
        try {
            const candidates = [id, sku].filter(Boolean) as string[]
            for (const name of candidates) {
                const file = path.join(this.enrichedSchemasPath, `${name}.json`)
                if (fs.existsSync(file)) {
                    const raw = fs.readFileSync(file, 'utf-8')
                    return JSON.parse(raw)
                }
            }
            // fallback: procurar em arquivos agregados (ex.: *_enriched.json)
            const files = fs.readdirSync(this.enrichedSchemasPath).filter((f) => f.endsWith('.json'))
            for (const f of files) {
                try {
                    const p = path.join(this.enrichedSchemasPath, f)
                    const raw = fs.readFileSync(p, 'utf-8')
                    const parsed = JSON.parse(raw)
                    if (Array.isArray(parsed)) {
                        const found = parsed.find((it: any) => (it?.id && candidates.includes(it.id)) || (it?.sku && candidates.includes(it.sku)))
                        if (found) return found
                    } else if (parsed && typeof parsed === 'object') {
                        for (const key of candidates) {
                            if ((parsed as any)[key]) return (parsed as any)[key]
                        }
                    }
                } catch { }
            }
        } catch (e) {
            // ignore
        }
        return null
    }

    /**
     * Normaliza e enriquece um produto para consumo no storefront
     */
    private prepareProduct(category: string, product: CatalogProduct): CatalogProduct {
        // Normaliza imagens primeiro
        const base = this.normalizeImagePaths({ ...(product as any) }) as any

        // Campos derivados/unificados
        base.price_brl = base.price_brl ?? this.parsePriceValue(base.price)
        base.distributor = base.distributor || base.centro_distribuicao || base.manufacturer
        base.potencia_kwp = base.potencia_kwp ?? base.kwp

        if (category === 'kits') {
            base.panels = base.panels || []
            base.inverters = base.inverters || []
            base.batteries = base.batteries || []
            base.total_panels = base.total_panels ?? (Array.isArray(base.panels) ? base.panels.reduce((acc: number, x: any) => acc + (x.quantity || 0), 0) : undefined)
            base.total_inverters = base.total_inverters ?? (Array.isArray(base.inverters) ? base.inverters.reduce((acc: number, x: any) => acc + (x.quantity || 0), 0) : undefined)
            base.total_power_w = base.total_power_w ?? (Array.isArray(base.panels) ? base.panels.reduce((acc: number, x: any) => acc + ((x.power_w || 0) * (x.quantity || 0)), 0) : undefined)
        }

        // Merge de schema enriquecido (se existir)
        const enriched = this.loadEnrichedSchema(base.id, base.sku)
        if (enriched) {
            base.warranty = enriched.warranty ?? base.warranty
            base.installation = enriched.installation ?? base.installation
            base.specs = enriched.specs ?? base.specs
            base.compatibility = enriched.compatibility ?? base.compatibility
            base.datasheet_url = enriched.datasheet_url ?? base.datasheet_url
        }

        return base as CatalogProduct
    }

    /**
     * Lista produtos por categoria
     */
    async listProductsByCategory(
        category: string,
        options: {
            page?: number;
            limit?: number;
            manufacturer?: string;
            minPrice?: number;
            maxPrice?: number;
            availability?: string;
            sort?: 'price_asc' | 'price_desc';
        } = {}
    ): Promise<CatalogResponse> {
        const { page = 1, limit = 50, manufacturer, minPrice, maxPrice, availability } = options;

        let products: CatalogProduct[] = [];

        // Mapeamento de categorias para arquivos (usando schemas unificados quando disponÃ­veis)
        const categoryFiles: { [key: string]: string } = {
            kits: 'kits_unified.json',
            panels: 'panels_unified.json',
            inverters: 'inverters_unified.json',
            cables: 'cables_unified.json',
            chargers: 'ev_chargers_unified.json', // Atualizado para usar ev_chargers
            controllers: 'controllers_unified.json',
            accessories: 'accessories_unified.json',
            structures: 'structures_unified.json',
            batteries: 'batteries_unified.json',
            stringboxes: 'stringboxes_unified.json',
            posts: 'posts_unified.json',
            others: 'others_unified.json'
        };

        const filename = categoryFiles[category];
        if (!filename) {
            throw new Error(`Categoria nÃ£o suportada: ${category}`);
        }

        products = this.readCatalogFile(filename);
        // Enriquecer com SKU canÃ´nico (registry) e garantir categoria
        try {
            const registryPath = path.join(this.unifiedSchemasPath, 'sku_registry.json');
            let reg: Record<string, string> = {};
            if (fs.existsSync(registryPath)) {
                const raw = fs.readFileSync(registryPath, 'utf-8');
                const parsed = JSON.parse(raw);
                if (parsed?.map && typeof parsed.map === 'object') {
                    reg = parsed.map as Record<string, string>;
                } else if (Array.isArray(parsed?.items)) {
                    reg = Object.fromEntries(parsed.items.map((x: any) => [`${x.category}:${x.id}`, x.sku]));
                }
            }
            const toSlug = (s: string) => {
                try { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '').toUpperCase(); } catch { return s.toUpperCase(); }
            };
            const stableSku = (item: any): string => {
                if (item.sku) return String(item.sku).toUpperCase();
                const id = (item.id || '').toString();
                if (id) return id.toUpperCase();
                const brand = (item.manufacturer || 'YSH').toString();
                const model = (item.model || item.name || '').toString();
                const power = (item.potencia_kwp || item.kwp || item.power_w || item.price_brl || '').toString();
                const base = `${category}-${brand}-${model}-${power}`;
                const slug = toSlug(base);
                const crypto = require('crypto');
                const h = crypto.createHash('sha1').update(base).digest('hex').slice(0, 8).toUpperCase();
                return `${slug}-${h}`.replace(/[^A-Z0-9\-]/g, '').slice(0, 64);
            };
            products = products.map((p) => {
                const id = (p.id || '').toString();
                const key = `${category}:${id}`;
                const canonical = reg[key];
                const finalSku = (p.sku || canonical || stableSku(p)).toString().toUpperCase();
                return { ...p, sku: finalSku, category: p.category || category } as CatalogProduct;
            });
        } catch { /* ignore sku enrichment */ }

        // Aplicar filtros
        if (manufacturer) {
            products = products.filter(p =>
                p.manufacturer?.toLowerCase().includes(manufacturer.toLowerCase())
            );
        }

        if (availability) {
            products = products.filter(p =>
                p.availability?.toLowerCase().includes(availability.toLowerCase())
            );
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            products = products.filter(p => {
                const price = this.parsePriceValue(p.price)
                if (price === undefined) return false
                if (minPrice !== undefined && price < minPrice) return false
                if (maxPrice !== undefined && price > maxPrice) return false
                return true
            });
        }

        // Sorting prior to pagination
        if (options.sort) {
            products = [...products].sort((a, b) => {
                const pa = this.parsePriceValue(a.price) ?? Number.POSITIVE_INFINITY
                const pb = this.parsePriceValue(b.price) ?? Number.POSITIVE_INFINITY
                if (options.sort === 'price_asc') return pa - pb
                return pb - pa
            })
        }

        // PaginaÃ§Ã£o
        const total = products.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = products.slice(startIndex, endIndex);

        // Normalizar e enriquece
        const normalizedProducts = paginatedProducts.map(product => this.prepareProduct(category, product));

        return {
            products: normalizedProducts,
            total,
            page,
            limit
        };
    }

    /**
     * Busca produto por ID
     */
    async getProductById(category: string, id: string): Promise<CatalogProduct | null> {
        const response = await this.listProductsByCategory(category, { limit: 1000 });
        const product = response.products.find(p => p.id === id || p.sku === id);
        return product ? this.prepareProduct(category, product) : null;
    }

    /**
     * Lista todos os fabricantes disponíveis do banco unificado
     */
    async getManufacturers(): Promise<Manufacturer[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query<Manufacturer>(`
                SELECT id, name, slug, tier, country, created_at, updated_at
                FROM manufacturer
                ORDER BY name ASC
            `);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar manufacturers:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Lista SKUs com filtros opcionais
     */
    async getSKUs(filters?: {
        category?: string;
        manufacturer_id?: string;
        min_price?: number;
        max_price?: number;
        limit?: number;
        offset?: number;
    }): Promise<{ skus: SKU[]; total: number }> {
        const client = await this.pool.connect();
        try {
            let whereConditions: string[] = [];
            let queryParams: any[] = [];
            let paramIndex = 1;

            if (filters?.category) {
                whereConditions.push(`s.category = $${paramIndex++}`);
                queryParams.push(filters.category);
            }

            if (filters?.manufacturer_id) {
                whereConditions.push(`s.manufacturer_id = $${paramIndex++}`);
                queryParams.push(filters.manufacturer_id);
            }

            if (filters?.min_price !== undefined) {
                whereConditions.push(`s.lowest_price >= $${paramIndex++}`);
                queryParams.push(filters.min_price);
            }

            if (filters?.max_price !== undefined) {
                whereConditions.push(`s.lowest_price <= $${paramIndex++}`);
                queryParams.push(filters.max_price);
            }

            const whereClause = whereConditions.length > 0
                ? 'WHERE ' + whereConditions.join(' AND ')
                : '';

            // Query para contar total
            const countQuery = `SELECT COUNT(*) as total FROM sku s ${whereClause}`;
            const countResult = await client.query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Query para buscar SKUs com joins
            const limit = filters?.limit || 50;
            const offset = filters?.offset || 0;

            queryParams.push(limit, offset);
            const dataQuery = `
                SELECT 
                    s.id, s.sku_code, s.manufacturer_id, s.category, s.model_number,
                    s.description, s.technical_specs, s.lowest_price, s.highest_price,
                    s.avg_price, s.offers_count, s.created_at, s.updated_at,
                    m.id as "manufacturer.id", m.name as "manufacturer.name",
                    m.slug as "manufacturer.slug", m.tier as "manufacturer.tier"
                FROM sku s
                LEFT JOIN manufacturer m ON s.manufacturer_id = m.id
                ${whereClause}
                ORDER BY s.sku_code ASC
                LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;

            const dataResult = await client.query(dataQuery, queryParams);

            // Transformar rows flat em objetos nested
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
                } : undefined,
            }));

            return { skus, total };
        } catch (error) {
            console.error('Erro ao buscar SKUs:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Busca um SKU por ID ou SKU code
     */
    async getSKUById(id: string): Promise<SKU | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query<any>(`
                SELECT 
                    s.id, s.sku_code, s.manufacturer_id, s.category, s.model_number,
                    s.description, s.technical_specs, s.lowest_price, s.highest_price,
                    s.avg_price, s.offers_count, s.created_at, s.updated_at,
                    m.id as "manufacturer.id", m.name as "manufacturer.name",
                    m.slug as "manufacturer.slug", m.tier as "manufacturer.tier"
                FROM sku s
                LEFT JOIN manufacturer m ON s.manufacturer_id = m.id
                WHERE s.id = $1 OR s.sku_code = $1
            `, [id]);

            if (result.rows.length === 0) {
                return null;
            }

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
                    country: undefined,
                } : undefined,
            };
        } catch (error) {
            console.error('Erro ao buscar SKU:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Busca ofertas de distribuidores para um SKU
     */
    async getOffersForSKU(skuId: string): Promise<DistributorOffer[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query<DistributorOffer>(`
                SELECT id, sku_id, distributor_name, price, stock_status,
                       stock_quantity, lead_time_days, shipping_cost,
                       created_at, updated_at
                FROM distributor_offer
                WHERE sku_id = $1
                ORDER BY price ASC
            `, [skuId]);

            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar ofertas:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Lista kits com filtros opcionais
     */
    async getKits(filters?: {
        category?: string;
        min_capacity?: number;
        max_capacity?: number;
        suitable_for?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ kits: Kit[]; total: number }> {
        const client = await this.pool.connect();
        try {
            let whereConditions: string[] = [];
            let queryParams: any[] = [];
            let paramIndex = 1;

            if (filters?.category) {
                whereConditions.push(`category = $${paramIndex++}`);
                queryParams.push(filters.category);
            }

            if (filters?.min_capacity !== undefined) {
                whereConditions.push(`system_capacity_kwp >= $${paramIndex++}`);
                queryParams.push(filters.min_capacity);
            }

            if (filters?.max_capacity !== undefined) {
                whereConditions.push(`system_capacity_kwp <= $${paramIndex++}`);
                queryParams.push(filters.max_capacity);
            }

            if (filters?.suitable_for) {
                whereConditions.push(`suitable_for = $${paramIndex++}`);
                queryParams.push(filters.suitable_for);
            }

            const whereClause = whereConditions.length > 0
                ? 'WHERE ' + whereConditions.join(' AND ')
                : '';

            // Count total
            const countQuery = `SELECT COUNT(*) as total FROM kit ${whereClause}`;
            const countResult = await client.query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get kits
            const limit = filters?.limit || 50;
            const offset = filters?.offset || 0;

            queryParams.push(limit, offset);
            const dataQuery = `
                SELECT id, kit_code, name, category, system_capacity_kwp,
                       components, kit_price, suitable_for, created_at, updated_at
                FROM kit
                ${whereClause}
                ORDER BY system_capacity_kwp ASC
                LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;

            const dataResult = await client.query<Kit>(dataQuery, queryParams);

            return { kits: dataResult.rows, total };
        } catch (error) {
            console.error('Erro ao buscar kits:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Busca um kit por ID ou kit_code
     */
    async getKitById(id: string): Promise<Kit | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query<Kit>(`
                SELECT id, kit_code, name, category, system_capacity_kwp,
                       components, kit_price, suitable_for, created_at, updated_at
                FROM kit
                WHERE id = $1 OR kit_code = $1
            `, [id]);

            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Erro ao buscar kit:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Busca produtos por termo
     */
    async searchProducts(
        query: string,
        options: { category?: string; limit?: number } = {}
    ): Promise<CatalogProduct[]> {
        const { category, limit = 20 } = options;
        const categories = category ? [category] : ['kits', 'panels', 'inverters', 'cables', 'chargers', 'controllers', 'accessories', 'structures'];

        let allProducts: CatalogProduct[] = [];

        for (const cat of categories) {
            try {
                const response = await this.listProductsByCategory(cat, { limit: 1000 });
                allProducts.push(...response.products);
            } catch (error) {
                // Ignora erros de categoria nÃ£o encontrada
            }
        }

        // Filtrar por termo de busca
        const filtered = allProducts.filter(product =>
            product.name?.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase()) ||
            product.manufacturer?.toLowerCase().includes(query.toLowerCase()) ||
            product.model?.toLowerCase().includes(query.toLowerCase())
        );

        // Normalizar caminhos das imagens e limitar resultados
        return filtered.slice(0, limit).map(product => this.normalizeImagePaths(product));
    }
}

export default YshCatalogModuleService;

