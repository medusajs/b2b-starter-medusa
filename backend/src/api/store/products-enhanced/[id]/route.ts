/**
 * Enhanced Product Detail API with Internal Images
 * GET /store/products-enhanced/:id
 * 
 * Returns single product with optimized image handling
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getInternalCatalogService } from "../../internal-catalog/catalog-service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const productService = req.scope.resolve("product");
    const catalogService = getInternalCatalogService();
    const { id } = req.params;

    try {
        const { image_source = "auto" } = req.query;

        // Try to find by ID first, then by handle
        let products = await productService.listProducts(
            { id },
            {
                relations: ["variants", "variants.prices", "images", "options", "options.values"],
                take: 1,
            }
        );

        if (!products || products.length === 0) {
            // Try by handle
            products = await productService.listProducts(
                { handle: id },
                {
                    relations: ["variants", "variants.prices", "images", "options", "options.values"],
                    take: 1,
                }
            );
        }

        if (!products || products.length === 0) {
            return res.status(404).json({
                error: "Product not found",
                message: `Product with ID or handle '${id}' not found`,
            });
        }

        const product = products[0];
        const variant = product.variants?.[0];
        const price = (variant as any)?.prices?.[0]?.amount || 0;

        // Extract SKU for internal image lookup
        const sku = await catalogService.extractSku({
            id: product.id,
            sku: variant?.sku,
            image: product.images?.[0]?.url
        });

        // Get internal image with all sizes
        const internalImage = await catalogService.getImageForSku(sku);

        // Determine primary image source
        let primarySource: 'database' | 'internal' | 'fallback' = 'fallback';
        let primaryImageUrl = '/images/placeholder.jpg';

        if (image_source === 'database' && product.images?.length > 0) {
            primarySource = 'database';
            primaryImageUrl = product.images[0].url;
        } else if (image_source === 'internal' && internalImage.preloaded) {
            primarySource = 'internal';
            primaryImageUrl = internalImage.url;
        } else if (image_source === 'auto') {
            // Auto-select best available source
            if (internalImage.preloaded) {
                primarySource = 'internal';
                primaryImageUrl = internalImage.url;
            } else if (product.images?.length > 0) {
                primarySource = 'database';
                primaryImageUrl = product.images[0].url;
            }
        }

        // Build enhanced product response
        const enhancedProduct = {
            id: product.id,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            handle: product.handle,
            manufacturer: product.subtitle,
            category: product.metadata?.category,
            price_brl: price / 100,
            sku: variant?.sku || sku || product.id,
            
            // Enhanced image handling
            images: {
                primary: {
                    url: primaryImageUrl,
                    source: primarySource,
                },
                database: product.images?.map((img: any) => ({
                    url: img.url,
                    id: img.id,
                })) || [],
                internal: {
                    ...internalImage,
                    available_sizes: internalImage.preloaded ? Object.keys(internalImage.sizes) : [],
                },
                all_sources: {
                    database_count: product.images?.length || 0,
                    internal_available: internalImage.preloaded,
                    fallback_used: primarySource === 'fallback',
                }
            },

            // Product variants with enhanced data
            variants: product.variants?.map((v: any) => ({
                id: v.id,
                title: v.title,
                sku: v.sku,
                prices: v.prices?.map((p: any) => ({
                    amount: p.amount / 100,
                    currency_code: p.currency_code,
                })),
            })),

            // Product options
            options: product.options?.map((opt: any) => ({
                id: opt.id,
                title: opt.title,
                values: opt.values,
            })),

            // Enhanced metadata
            metadata: {
                ...product.metadata,
                image_enhancement: {
                    sku_extracted: sku,
                    extraction_method: sku ? 'success' : 'failed',
                    internal_image_available: internalImage.preloaded,
                    database_images_count: product.images?.length || 0,
                    selected_source: primarySource,
                    cache_hit: internalImage.cached,
                }
            },

            created_at: product.created_at,
            updated_at: product.updated_at,
        };

        res.json({ 
            product: enhancedProduct,
            performance: {
                cache_stats: catalogService.getCacheStats(),
                image_load_time: internalImage.load_time_ms || 0,
            }
        });

    } catch (error: any) {
        console.error("Error fetching enhanced product:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};