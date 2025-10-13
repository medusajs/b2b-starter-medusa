/**
 * Enhanced Products API with Internal Images
 * GET /store/products_enhanced
 * 
 * Combines database products with internal catalog images for optimal performance
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { getInternalCatalogService } from "../internal-catalog/catalog-service";
import { z } from "zod";

/**
 * Validation schema for enhanced products
 */
const EnhancedProductsQuerySchema = z.object({
    category: z.string().optional(),
    limit: z.coerce.number().positive().max(100).default(20),
    offset: z.coerce.number().nonnegative().default(0),
    q: z.string().optional(),
    manufacturer: z.string().optional(),
    min_price: z.coerce.number().positive().optional(),
    max_price: z.coerce.number().positive().optional(),
    sort: z.enum(["created_at", "updated_at", "title"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
    image_source: z.enum(["auto", "database", "internal"]).default("auto"),
});

interface EnhancedProduct {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    handle: string;
    manufacturer: string;
    category: string;
    price_brl: number;
    sku: string;
    images: {
        database: Array<{ url: string; id: string }>;
        internal: {
            url: string;
            sizes: {
                original: string;
                thumb: string;
                medium: string;
                large: string;
            };
            preloaded: boolean;
            cached: boolean;
        };
        primary_source: 'database' | 'internal' | 'fallback';
    };
    metadata: any;
    created_at: string;
    updated_at: string;
}

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const productService = req.scope.resolve("product");
    const catalogService = getInternalCatalogService();

    try {
        // Validate query parameters
        const validatedQuery = EnhancedProductsQuerySchema.parse(req.query);
        const {
            category,
            limit,
            offset,
            q,
            manufacturer,
            min_price,
            max_price,
            sort,
            order,
            image_source
        } = validatedQuery;

        // Build filters
        const filters: any = {
            status: "published",
        };

        if (q) {
            filters.title = {
                $ilike: `%${q}%`,
            };
        }

        if (category) {
            filters.metadata = {
                category: category,
            };
        }

        if (manufacturer) {
            filters.subtitle = {
                $ilike: `%${manufacturer}%`,
            };
        }

        // Fetch products from database
        const products = await productService.listProducts(
            filters,
            {
                skip: offset,
                take: limit,
                order: {
                    [sort]: order === "asc" ? "ASC" : "DESC",
                },
                relations: ["variants", "variants.prices", "images"],
            }
        );

        // Enhance products with internal images
        const enhancedProducts: EnhancedProduct[] = await Promise.all(
            products.map(async (product: any) => {
                const variant = product.variants?.[0];
                const price = variant?.prices?.[0]?.amount || 0;
                const priceInBRL = price / 100;

                // Apply price filtering
                if (min_price && priceInBRL < min_price) return null;
                if (max_price && priceInBRL > max_price) return null;

                // Extract SKU for internal image lookup
                const sku = await catalogService.extractSku({
                    id: product.id,
                    sku: variant?.sku,
                    image: product.images?.[0]?.url
                });

                // Get internal image
                const internalImage = await catalogService.getImageForSku(sku);

                // Determine primary image source
                let primarySource: 'database' | 'internal' | 'fallback' = 'fallback';

                if (image_source === 'database' && product.images?.length > 0) {
                    primarySource = 'database';
                } else if (image_source === 'internal' && internalImage.preloaded) {
                    primarySource = 'internal';
                } else if (image_source === 'auto') {
                    // Auto-select best available source
                    if (internalImage.preloaded) {
                        primarySource = 'internal';
                    } else if (product.images?.length > 0) {
                        primarySource = 'database';
                    }
                }

                return {
                    id: product.id,
                    title: product.title,
                    subtitle: product.subtitle,
                    description: product.description,
                    handle: product.handle,
                    manufacturer: product.subtitle,
                    category: product.metadata?.category,
                    price_brl: priceInBRL,
                    sku: variant?.sku || sku || product.id,
                    images: {
                        database: product.images?.map((img: any) => ({
                            url: img.url,
                            id: img.id,
                        })) || [],
                        internal: internalImage,
                        primary_source: primarySource,
                    },
                    metadata: {
                        ...product.metadata,
                        image_enhancement: {
                            sku_extracted: sku,
                            internal_available: internalImage.preloaded,
                            database_available: product.images?.length > 0,
                            selected_source: primarySource,
                        }
                    },
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                } as EnhancedProduct;
            })
        );

        // Filter out null results from price filtering
        const validProducts = enhancedProducts.filter(p => p !== null) as EnhancedProduct[];

        // Get total count for pagination
        const totalCount = await productService.listProducts(filters, { skip: 0, take: 1 });

        // Build facets
        const manufacturers = new Set<string>();
        const imageSourceStats = {
            database: 0,
            internal: 0,
            fallback: 0,
        };

        validProducts.forEach((p) => {
            if (p.manufacturer) manufacturers.add(p.manufacturer);
            imageSourceStats[p.images.primary_source]++;
        });

        res.json({
            products: validProducts,
            count: validProducts.length,
            total: totalCount.length,
            limit,
            offset,
            facets: {
                manufacturers: Array.from(manufacturers).sort(),
            },
            image_stats: {
                sources: imageSourceStats,
                coverage: {
                    internal: ((imageSourceStats.internal / validProducts.length) * 100).toFixed(1) + '%',
                    database: ((imageSourceStats.database / validProducts.length) * 100).toFixed(1) + '%',
                    fallback: ((imageSourceStats.fallback / validProducts.length) * 100).toFixed(1) + '%',
                }
            },
            cache_stats: catalogService.getCacheStats(),
        });
    } catch (error: any) {
        console.error("Error fetching enhanced products:", error);

        // Handle validation errors
        if (error.name === "ZodError") {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: error.errors,
                message: "Please check your query parameters and try again",
            });
        }

        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message);
    }
};