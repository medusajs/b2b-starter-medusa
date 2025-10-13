import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { getInternalCatalogService } from "../internal-catalog/catalog-service";

/**
 * Public product listing endpoint - NO AUTH REQUIRED
 * Enhanced with internal catalog images for better performance
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const productService = req.scope.resolve(ModuleRegistrationName.PRODUCT);

    try {
        const {
            category,
            limit = "20",
            offset = "0",
            q,
            manufacturer,
            min_price,
            max_price,
            sort = "created_at",
            order = "desc",
        } = req.query;

        // Build filters
        const filters: any = {
            status: "published",
        };

        // Search by title
        if (q) {
            filters.title = {
                $ilike: `%${q}%`,
            };
        }

        // Filter by category handle in metadata
        if (category) {
            filters.metadata = {
                category: category,
            };
        }

        // Filter by manufacturer in subtitle
        if (manufacturer) {
            filters.subtitle = {
                $ilike: `%${manufacturer}%`,
            };
        }

        // Apply price filtering in the query if needed
        let priceFilters = {};
        if (min_price || max_price) {
            // For price filtering, we'll need to join with variants
            // This is a simplified approach - in production you'd want more sophisticated filtering
        }

        // Use query config for field selection and limits
        const queryConfig = {
            fields: req.queryConfig?.fields || [
                "id", "title", "subtitle", "description", "handle", "status",
                "metadata", "created_at", "updated_at"
            ],
            relations: ["variants.prices", "images"],
            skip: parseInt(offset as string),
            take: Math.min(parseInt(limit as string), 100), // Cap at 100 items
            order: {
                [sort as string]: order === "asc" ? "ASC" : "DESC",
            }
        };

        // Fetch products with single query
        const [products, totalCount] = await Promise.all([
            productService.listProducts(filters, queryConfig),
            productService.listProducts(filters, { skip: 0, take: 1 })
        ]);

        // Apply price filtering after fetch (since prices are in variants)
        let filteredProducts = products;
        if (min_price || max_price) {
            filteredProducts = products.filter((product: any) => {
                const variant = product.variants?.[0];
                const price = variant?.prices?.[0]?.amount;
                if (!price) return false;

                const priceInBRL = price / 100; // Convert cents to BRL
                if (min_price && priceInBRL < parseFloat(min_price as string)) return false;
                if (max_price && priceInBRL > parseFloat(max_price as string)) return false;
                return true;
            });
        }

        // Format response with internal image enhancement
        const catalogService = getInternalCatalogService();
        const formattedProducts = await Promise.all(
            filteredProducts.map(async (product: any) => {
                const variant = product.variants?.[0];
                const price = variant?.prices?.[0]?.amount || 0;

                // Extract SKU for internal image lookup
                const sku = await catalogService.extractSku({
                    id: product.id,
                    sku: variant?.sku,
                    image: product.images?.[0]?.url
                });

                // Get internal image
                const internalImage = await catalogService.getImageForSku(sku);

                // Determine best image source
                let primaryImage = product.images?.[0]?.url || '/images/placeholder.jpg';
                let imageSource = 'database';

                if (internalImage.preloaded && (!product.images?.length || req.query.prefer_internal === 'true')) {
                    primaryImage = internalImage.url;
                    imageSource = 'internal';
                }

                return {
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
                            cached: internalImage.cached
                        } : null,
                    },

                    processed_images: product.metadata?.processed_images || {},
                    metadata: {
                        ...product.metadata,
                        image_enhancement: {
                            sku_extracted: sku,
                            internal_available: internalImage.preloaded,
                            selected_source: imageSource
                        }
                    },
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                };
            })
        );

        // Build facets (manufacturers from filtered products)
        const manufacturers = new Set<string>();
        filteredProducts.forEach((p: any) => {
            if (p.subtitle) manufacturers.add(p.subtitle);
        });

        res.json({
            products: formattedProducts,
            count: filteredProducts.length,
            total: totalCount.length,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            facets: {
                manufacturers: Array.from(manufacturers).sort(),
            },
        });
    } catch (error: any) {
        console.error("Error fetching products:", error);
        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message);
    }
};
