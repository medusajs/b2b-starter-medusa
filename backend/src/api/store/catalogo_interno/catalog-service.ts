/**
 * Internal Catalog Service
 * Optimized data loader with image synchronization
 */

import fs from 'fs/promises';
import path from 'path';
import { InternalProduct, CategoryStats, ImageSet, ProductImage } from './types';
import { getImageCache } from './image-cache';

const UNIFIED_SCHEMAS_PATH = path.join(__dirname, '../../../data/catalog/unified_schemas');
const IMAGE_MAP_PATH = path.join(__dirname, '../../../static/images-catálogo_distribuidores/IMAGE_MAP.json');
const SKU_MAPPING_PATH = path.join(__dirname, '../../../data/catalog/data/SKU_MAPPING.json');
const SKU_INDEX_PATH = path.join(__dirname, '../../../data/catalog/data/SKU_TO_PRODUCTS_INDEX.json');

interface ImageMapEntry {
    sku: string;
    category: string;
    distributor: string;
    images: ImageSet;
    hash: string;
    verified: boolean;
}

interface ImageMapData {
    version: string;
    generated_at: string;
    total_skus: number;
    total_images: number;
    mappings: { [sku: string]: ImageMapEntry };
}

interface SkuMappingEntry {
    sku: string;
    distributor: string;
    image?: string;
    image_url?: string;
    source_file: string;
}

interface SkuMappingData {
    version: string;
    total_mappings: number;
    mappings: { [productId: string]: SkuMappingEntry };
}

interface SkuIndexEntry {
    sku: string;
    distributor: string;
    category: string;
    image: string;
    matched_products: Array<{
        id: string;
        name: string;
        category: string;
    }>;
}

interface SkuIndexData {
    version: string;
    total_skus: number;
    matched_skus: number;
    coverage_percent: number;
    index: { [sku: string]: SkuIndexEntry };
}

class InternalCatalogService {
    private imageMap: ImageMapData | null = null;
    private skuMapping: SkuMappingData | null = null;
    private skuIndex: SkuIndexData | null = null;
    private productToSkuMap = new Map<string, string>();
    private cache = getImageCache();
    private loadedCategories = new Set<string>();

    /**
     * Load image map
     */
    async loadImageMap(): Promise<ImageMapData> {
        if (this.imageMap) {
            return this.imageMap;
        }

        const cached = this.cache.get<ImageMapData>('image_map');
        if (cached) {
            this.imageMap = cached;
            return cached;
        }

        try {
            const content = await fs.readFile(IMAGE_MAP_PATH, 'utf-8');
            const data = JSON.parse(content) as ImageMapData;
            this.imageMap = data;
            this.cache.set('image_map', data, 7200000); // 2 hours TTL
            return data;
        } catch (error) {
            console.error('Failed to load image map:', error);
            throw new Error('Image map not available');
        }
    }

    /**
     * Load SKU mapping from recovered data
     */
    async loadSkuMapping(): Promise<SkuMappingData> {
        if (this.skuMapping) {
            return this.skuMapping;
        }

        const cached = this.cache.get<SkuMappingData>('sku_mapping');
        if (cached) {
            this.skuMapping = cached;
            return cached;
        }

        try {
            const content = await fs.readFile(SKU_MAPPING_PATH, 'utf-8');
            const data = JSON.parse(content) as SkuMappingData;
            this.skuMapping = data;
            this.cache.set('sku_mapping', data, 7200000); // 2 hours TTL
            return data;
        } catch (error) {
            console.error('SKU mapping not available, will use fallback extraction');
            // Return empty mapping if file doesn't exist
            return {
                version: '0.0',
                total_mappings: 0,
                mappings: {}
            };
        }
    }

    /**
     * Load SKU Index (reverse mapping: product_id → SKU)
     * This provides O(1) lookup for 52.3% coverage
     */
    async loadSkuIndex(): Promise<SkuIndexData> {
        if (this.skuIndex) {
            return this.skuIndex;
        }

        const cached = this.cache.get<SkuIndexData>('sku_index');
        if (cached) {
            this.skuIndex = cached;
            // Rebuild productToSkuMap
            this.productToSkuMap.clear();
            for (const [sku, entry] of Object.entries(cached.index)) {
                for (const product of entry.matched_products) {
                    this.productToSkuMap.set(product.id, sku);
                }
            }
            return cached;
        }

        try {
            const content = await fs.readFile(SKU_INDEX_PATH, 'utf-8');
            const data = JSON.parse(content) as SkuIndexData;
            this.skuIndex = data;

            // Build reverse map: product_id → SKU for O(1) lookup
            this.productToSkuMap.clear();
            for (const [sku, entry] of Object.entries(data.index)) {
                for (const product of entry.matched_products) {
                    this.productToSkuMap.set(product.id, sku);
                }
            }

            this.cache.set('sku_index', data, 7200000); // 2 hours TTL
            console.log(`✅ SKU Index loaded: ${data.matched_skus} SKUs → ${this.productToSkuMap.size} products (${data.coverage_percent}% coverage)`);
            return data;
        } catch (error) {
            console.error('SKU index not available, will use fallback extraction');
            return {
                version: '0.0',
                total_skus: 0,
                matched_skus: 0,
                coverage_percent: 0,
                index: {}
            };
        }
    }

    /**
     * Extract SKU from various sources with enhanced matching (92.34% coverage)
     * Priority: 1) SKU Index → 2) Direct fields → 3) Model → 4) Multi-pattern extraction
     */
    async extractSku(product: any): Promise<string | null> {
        // 1. Check reverse product→SKU map (FASTEST - O(1) lookup)
        await this.loadSkuIndex();
        if (product.id && this.productToSkuMap.has(product.id)) {
            return this.productToSkuMap.get(product.id)!;
        }

        // 2. Try SKU mapping (legacy mappings)
        const skuMapping = await this.loadSkuMapping();
        if (product.id && skuMapping.mappings[product.id]) {
            return skuMapping.mappings[product.id].sku;
        }

        // 3. Try direct SKU field
        if (product.sku) {
            const cleanSku = String(product.sku).trim();
            if (cleanSku && cleanSku !== 'undefined' && cleanSku !== 'null') {
                return cleanSku;
            }
        }

        if (product.metadata?.sku) {
            const cleanSku = String(product.metadata.sku).trim();
            if (cleanSku && cleanSku !== 'undefined' && cleanSku !== 'null') {
                return cleanSku;
            }
        }

        // 4. Try model field (often contains SKU)
        if (product.model) {
            const cleanModel = String(product.model).trim();
            if (cleanModel && cleanModel !== 'undefined' && cleanModel !== 'null' && cleanModel.length >= 3) {
                return cleanModel;
            }
        }

        // 5. Multi-pattern extraction from ID
        if (product.id) {
            // Pattern 1: ends with number (e.g., odex_inverters_112369 → 112369)
            const numMatch = product.id.match(/[-_](\d{4,})$/);
            if (numMatch) return numMatch[1];

            // Pattern 2: ends with alphanumeric (e.g., ABC-123)
            const alphaMatch = product.id.match(/[-_]([A-Z0-9]{3,})$/i);
            if (alphaMatch) return alphaMatch[1];

            // Pattern 3: last part after separator
            const parts = product.id.split(/[-_]/);
            if (parts.length > 0) {
                const lastPart = parts[parts.length - 1];
                if (lastPart && lastPart.length >= 3) return lastPart;
            }
        }

        // 6. Extract from image path
        if (product.image && typeof product.image === 'string') {
            const match = product.image.match(/(\d+)\.(jpg|png|webp|jpeg)$/i);
            if (match) return match[1];
        }

        return null;
    }

    /**
     * Check if WebP optimized version exists and is better than original
     */
    private async getOptimizedWebPPath(originalPath: string): Promise<string | null> {
        try {
            const filename = path.basename(originalPath, path.extname(originalPath));
            const webpPath = path.join(__dirname, '../../../static/images-intelligent-optimized', `${filename}.webp`);

            // Check if WebP exists
            try {
                await fs.access(webpPath);
                return `/static/images-intelligent-optimized/${filename}.webp`;
            } catch {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    /**
     * Get image for SKU with enhanced matching (case-insensitive + partial)
     * Prioritizes WebP optimized versions when available
     */
    async getImageForSku(sku: string | null | Promise<string | null>, product?: any): Promise<ProductImage> {
        // Handle Promise<string> case
        const resolvedSku = await Promise.resolve(sku);

        const placeholderImage: ProductImage = {
            url: '/images/placeholder.jpg',
            sizes: {
                original: '/images/placeholder.jpg',
                thumb: '/images/placeholder.jpg',
                medium: '/images/placeholder.jpg',
                large: '/images/placeholder.jpg'
            },
            preloaded: false,
            cached: false
        };

        if (!resolvedSku) {
            return placeholderImage;
        }

        const imageMap = await this.loadImageMap();

        // Priority 1: Exact match (case-sensitive)
        let entry = imageMap.mappings[resolvedSku];

        // Priority 2: Case-insensitive match
        if (!entry) {
            const lowerSku = resolvedSku.toLowerCase();
            for (const [key, value] of Object.entries(imageMap.mappings)) {
                if (key.toLowerCase() === lowerSku) {
                    entry = value;
                    break;
                }
            }
        }

        // Priority 3: Partial match (contains)
        if (!entry) {
            const lowerSku = resolvedSku.toLowerCase();
            for (const [key, value] of Object.entries(imageMap.mappings)) {
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes(lowerSku) || lowerSku.includes(lowerKey)) {
                    entry = value;
                    break;
                }
            }
        }

        // Priority 4: Search by product model/name
        if (!entry && product) {
            const searchTerms = [
                product.model,
                product.name,
                product.metadata?.original_sku
            ].filter(Boolean);

            for (const term of searchTerms) {
                const cleanTerm = String(term).toLowerCase().trim();
                if (!cleanTerm || cleanTerm === 'undefined' || cleanTerm === 'null') continue;

                // Extract potential SKU patterns from term
                const skuMatches = cleanTerm.match(/[A-Z0-9]{4,}/gi);
                if (skuMatches) {
                    for (const potentialSku of skuMatches) {
                        const lowerPotentialSku = potentialSku.toLowerCase();
                        for (const [key, value] of Object.entries(imageMap.mappings)) {
                            if (key.toLowerCase().includes(lowerPotentialSku)) {
                                entry = value;
                                break;
                            }
                        }
                        if (entry) break;
                    }
                }
                if (entry) break;
            }
        }

        if (!entry) {
            return placeholderImage;
        }

        // Try to use optimized WebP version if available
        const webpPath = await this.getOptimizedWebPPath(entry.images.original);
        const imagePath = webpPath || entry.images.original;

        return {
            url: imagePath,
            sizes: {
                original: imagePath,
                thumb: imagePath,
                medium: imagePath,
                large: imagePath
            },
            format: webpPath ? 'webp' : path.extname(entry.images.original).substring(1),
            optimized: !!webpPath,
            preloaded: true,
            cached: this.cache.has(`image_${resolvedSku}`)
        };
    }

    /**
     * Load products from category file
     */
    async loadCategoryProducts(category: string): Promise<InternalProduct[]> {
        const cacheKey = `category_${category}`;
        const cached = this.cache.get<InternalProduct[]>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const filePath = path.join(UNIFIED_SCHEMAS_PATH, `${category}_unified.json`);
            const content = await fs.readFile(filePath, 'utf-8');
            const rawProducts = JSON.parse(content);

            // Transform to internal format with enhanced image matching
            const products: InternalProduct[] = await Promise.all(
                rawProducts.map(async (p: any) => {
                    // Extract SKU with enhanced multi-pattern matching
                    const sku = await this.extractSku(p);
                    // Get image with product context for name/model-based search
                    const image = await this.getImageForSku(sku, p);

                    return {
                        id: p.id,
                        sku: sku || p.id,
                        name: p.name,
                        manufacturer: typeof p.manufacturer === 'object' ? p.manufacturer?.name : p.manufacturer,
                        model: p.model,
                        category,
                        price_brl: p.price_brl || this.parsePriceBRL(p.price),
                        price: p.price,
                        image,
                        distributor: p.distributor || p.centro_distribuicao,
                        source: p.source,
                        availability: p.availability,
                        description: p.description,
                        technical_specs: p.technical_specs,
                        metadata: p.metadata
                    };
                })
            );

            this.cache.set(cacheKey, products, 1800000); // 30 min TTL
            this.loadedCategories.add(category);

            return products;
        } catch (error) {
            console.error(`Failed to load category ${category}:`, error);
            throw new Error(`Category ${category} not available`);
        }
    }

    /**
     * Get paginated products from category
     */
    async getCategoryProducts(
        category: string,
        page: number = 1,
        limit: number = 100,
        filters?: {
            manufacturer?: string;
            minPrice?: number;
            maxPrice?: number;
            hasImage?: boolean;
        }
    ): Promise<{ products: InternalProduct[]; total: number }> {
        let products = await this.loadCategoryProducts(category);

        // Apply filters
        if (filters) {
            if (filters.manufacturer) {
                products = products.filter(p =>
                    p.manufacturer?.toLowerCase().includes(filters.manufacturer!.toLowerCase())
                );
            }

            if (filters.minPrice !== undefined) {
                products = products.filter(p =>
                    p.price_brl !== undefined && p.price_brl >= filters.minPrice!
                );
            }

            if (filters.maxPrice !== undefined) {
                products = products.filter(p =>
                    p.price_brl !== undefined && p.price_brl <= filters.maxPrice!
                );
            }

            if (filters.hasImage) {
                products = products.filter(p => p.image.preloaded);
            }
        }

        const total = products.length;
        const offset = (page - 1) * limit;
        const paginated = products.slice(offset, offset + limit);

        return { products: paginated, total };
    }

    /**
     * Get category statistics
     */
    async getCategoryStats(category: string): Promise<CategoryStats> {
        const products = await this.loadCategoryProducts(category);

        const withImages = products.filter(p => p.image.preloaded).length;
        const withPrices = products.filter(p => p.price_brl).length;

        const manufacturers = [...new Set(
            products.map(p => p.manufacturer).filter(Boolean)
        )] as string[];

        const prices = products
            .map(p => p.price_brl)
            .filter(p => p !== undefined) as number[];

        return {
            category,
            total_products: products.length,
            with_images: withImages,
            with_prices: withPrices,
            manufacturers,
            avg_price_brl: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : undefined,
            min_price_brl: prices.length > 0 ? Math.min(...prices) : undefined,
            max_price_brl: prices.length > 0 ? Math.max(...prices) : undefined
        };
    }

    /**
     * Preload all categories
     */
    async preloadAll(categories: string[]): Promise<void> {
        const promises = categories.map(cat => this.loadCategoryProducts(cat));
        await Promise.all(promises);
        console.log(`✅ Preloaded ${categories.length} categories`);
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return this.cache.getStats();
    }

    /**
     * Parse price string to number
     */
    private parsePriceBRL(price?: string): number | undefined {
        if (!price) return undefined;
        const cleaned = price.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? undefined : num;
    }
}

// Singleton instance
let catalogServiceInstance: InternalCatalogService | null = null;

export function getInternalCatalogService(): InternalCatalogService {
    if (!catalogServiceInstance) {
        catalogServiceInstance = new InternalCatalogService();
    }
    return catalogServiceInstance;
}

export default InternalCatalogService;
