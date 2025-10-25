import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AuthenticatedMedusaRequest } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { getInternalCatalogService } from "../../internal-catalog/catalog-service";

/**
 * Public product detail endpoint - NO AUTH REQUIRED
 * Enhanced with internal catalog images
 */
export const GET = async (
    req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const productService = req.scope.resolve("product");
    const { id } = req.params;

    try {
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

        // Enhanced product with internal images
        const catalogService = getInternalCatalogService();

        // Extract SKU for internal image lookup
        const sku = await catalogService.extractSku({
            id: product.id,
            sku: variant?.sku,
            image: product.images?.[0]?.url
        });

        // Get internal image with all sizes
        const internalImage = await catalogService.getImageForSku(sku);

        // Determine best image source
        let primaryImage = product.images?.[0]?.url || '/images/placeholder.jpg';
        let imageSource = 'database';

        if (internalImage.preloaded && (!product.images?.length || req.query.prefer_internal === 'true')) {
            primaryImage = internalImage.url;
            imageSource = 'internal';
        }

        const formattedProduct = {
            id: product.id,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            handle: product.handle,
            manufacturer: product.subtitle,
            category: product.metadata?.category,
            price_brl: price / 100,
            sku: variant?.sku || sku,

            // Enhanced image handling
            image: primaryImage,
            image_source: imageSource,
            images: {
                database: product.images?.map((img: any) => ({
                    url: img.url,
                    id: img.id,
                })) || [],
                internal: internalImage.preloaded ? {
                    url: internalImage.url,
                    sizes: internalImage.sizes,
                    cached: internalImage.cached,
                    available_sizes: Object.keys(internalImage.sizes)
                } : null,
            },

            processed_images: product.metadata?.processed_images || {},
            variants: product.variants?.map((v: any) => ({
                id: v.id,
                title: v.title,
                sku: v.sku,
                prices: v.prices?.map((p: any) => ({
                    amount: p.amount / 100,
                    currency_code: p.currency_code,
                })),
            })),
            options: product.options?.map((opt: any) => ({
                id: opt.id,
                title: opt.title,
                values: opt.values,
            })),
            metadata: {
                ...product.metadata,
                image_enhancement: {
                    sku_extracted: sku,
                    internal_available: internalImage.preloaded,
                    database_count: product.images?.length || 0,
                    selected_source: imageSource,
                    cache_hit: internalImage.cached
                }
            },
            created_at: product.created_at,
            updated_at: product.updated_at,
        };

        res.json({ product: formattedProduct });
    } catch (error: any) {
        console.error("Error fetching product:", error);
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch product");
    }
};
