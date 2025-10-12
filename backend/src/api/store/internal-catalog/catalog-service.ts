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

class InternalCatalogService {
    private imageMap: ImageMapData | null = null;
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
     * Get image for SKU
     */
    async getImageForSku(sku: string): Promise<ProductImage> {
        const imageMap = await this.loadImageMap();
        const entry = imageMap.mappings[sku];

        if (!entry) {
            return {
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
        }

        return {
            url: entry.images.original,
            sizes: entry.images,
            preloaded: true,
            cached: this.cache.has(`image_${sku}`)
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

            // Transform to internal format with images
            const products: InternalProduct[] = await Promise.all(
                rawProducts.map(async (p: any) => {
                    const sku = p.sku || p.id;
                    const image = await this.getImageForSku(sku);

                    return {
                        id: p.id,
                        sku,
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
