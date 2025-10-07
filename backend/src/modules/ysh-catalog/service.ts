import { MedusaService } from "@medusajs/framework/utils";
import fs from "fs";
import path from "path";

// Tipos para produtos do catálogo
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

class YshCatalogModuleService extends MedusaService({
    // Define entities if needed
}) {
    private catalogPath: string;
    private unifiedSchemasPath: string;
    private imagesProcessedPath: string;

    constructor() {
        super();
        // Caminhos para os dados do catálogo - caminhos absolutos
        this.catalogPath = path.resolve(__dirname, '../../../../../data/catalog');
        this.unifiedSchemasPath = path.join(this.catalogPath, 'unified_schemas');
        this.imagesProcessedPath = path.join(this.catalogPath, 'images_processed');
    }

    /**
     * Lê um arquivo JSON do catálogo (usando schemas unificados quando disponíveis)
     */
    private readCatalogFile(filename: string): CatalogProduct[] {
        try {
            // Primeiro tenta ler do schema unificado
            const unifiedFilename = filename.replace('.json', '_unified.json');
            const unifiedFilePath = path.join(this.unifiedSchemasPath, unifiedFilename);

            if (fs.existsSync(unifiedFilePath)) {
                console.log(`📄 Lendo schema unificado: ${unifiedFilename}`);
                const data = fs.readFileSync(unifiedFilePath, 'utf-8');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            }

            // Fallback para arquivo original
            const originalFilePath = path.join(this.catalogPath, filename);
            if (fs.existsSync(originalFilePath)) {
                console.log(`📄 Lendo arquivo original: ${filename}`);
                const data = fs.readFileSync(originalFilePath, 'utf-8');
                const parsed = JSON.parse(data);

                // Alguns arquivos têm estrutura diferente
                if (filename === 'panels.json' && parsed.panels) {
                    return parsed.panels;
                }

                return Array.isArray(parsed) ? parsed : [];
            }

            console.warn(`Arquivo não encontrado: ${filename} (nem unificado nem original)`);
            return [];
        } catch (error) {
            console.error(`Erro ao ler arquivo ${filename}:`, error);
            return [];
        }
    }

    /**
     * Normaliza os caminhos das imagens processadas para URLs acessíveis
     */
    private normalizeImagePaths(product: CatalogProduct): CatalogProduct {
        if (!product.processed_images) {
            product.processed_images = {};
        }

        const processedImages = product.processed_images;

        // Converte caminhos relativos para caminhos absolutos acessíveis via API
        Object.keys(processedImages).forEach(size => {
            const imagePath = processedImages[size as keyof typeof processedImages];
            if (imagePath && typeof imagePath === 'string') {
                // Remove 'catalog\' do início se existir e converte para URL
                const cleanPath = imagePath.replace(/^catalog[\/\\]/, '');
                // Converte barras para o formato da web
                processedImages[size as keyof typeof processedImages] = cleanPath.replace(/\\/g, '/');
            }
        });

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

        // Mapeamento de categorias para arquivos (usando schemas unificados quando disponíveis)
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
            throw new Error(`Categoria não suportada: ${category}`);
        }

        products = this.readCatalogFile(filename);

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

        // Paginação
        const total = products.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = products.slice(startIndex, endIndex);

        // Normalizar caminhos das imagens
        const normalizedProducts = paginatedProducts.map(product => this.normalizeImagePaths(product));

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
        return product ? this.normalizeImagePaths(product) : null;
    }

    /**
     * Lista todos os fabricantes disponíveis
     */
    async getManufacturers(): Promise<string[]> {
        const categories = ['kits', 'panels', 'inverters', 'cables', 'chargers', 'controllers', 'accessories', 'structures'];
        const manufacturers = new Set<string>();

        for (const category of categories) {
            try {
                const response = await this.listProductsByCategory(category, { limit: 1000 });
                response.products.forEach(product => {
                    if (product.manufacturer) {
                        manufacturers.add(product.manufacturer);
                    }
                });
            } catch (error) {
                // Ignora erros de categoria não encontrada
            }
        }

        return Array.from(manufacturers).sort();
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
                // Ignora erros de categoria não encontrada
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
