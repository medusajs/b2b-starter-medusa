import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getInternalCatalogService } from "../../internal-catalog/catalog-service";

/**
 * GET /store/products_enhanced/:handle
 * 
 * Enhanced product endpoint with Internal Catalog integration
 * Returns single product by handle with optimized images
 */
export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const { handle } = req.params;
    const { region_id, image_source = "auto" } = req.query;

    if (!handle) {
        throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Product handle is required"
        );
    }

    try {
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

        // Query product by handle
        const { data: products } = await query.graph(
            {
                entity: "product",
                fields: [
                    "id",
                    "title",
                    "subtitle",
                    "description",
                    "handle",
                    "status",
                    "metadata",
                    "created_at",
                    "updated_at",
                    "*variants",
                    "*variants.prices",
                    "*variants.calculated_price",
                    "*images",
                    "*categories",
                    "*tags",
                ],
                filters: {
                    handle,
                    status: "published",
                },
            },
            { throwIfKeyNotFound: true }
        );

        if (!products || products.length === 0) {
            return res.status(404).json({
                error: "Product not found",
                message: `No product found with handle: ${handle}`,
            });
        }

        const product = products[0];

        // Enhance with Internal Catalog images if available
        const catalogService = getInternalCatalogService();

        // Extract SKU for image lookup
        const sku = await catalogService.extractSku({
            id: product.id,
            sku: product.variants?.[0]?.sku,
            image: product.images?.[0]?.url,
        });

        // Get internal catalog image
        const internalImage = await catalogService.getImageForSku(sku);

        // Build enhanced product response
        const enhancedProduct = {
            ...product,

            // Enhanced image handling
            image_source: image_source === "internal"
                ? "internal"
                : image_source === "database"
                    ? "database"
                    : internalImage.preloaded && (!product.images?.length || image_source === "auto")
                        ? "internal"
                        : product.images?.length
                            ? "database"
                            : "fallback",

            primary_image: internalImage.preloaded && (image_source === "auto" || image_source === "internal")
                ? internalImage.url
                : product.images?.[0]?.url || "/images/placeholder.jpg",

            images_enhanced: {
                database: product.images || [],
                internal: internalImage.preloaded ? internalImage : null,
            },

            // Metadata for tracking
            metadata: {
                ...product.metadata,
                image_enhancement: {
                    sku_extracted: sku || null,
                    internal_available: internalImage.preloaded,
                    source_selected: image_source === "internal"
                        ? "internal"
                        : image_source === "database"
                            ? "database"
                            : internalImage.preloaded && (!product.images?.length || image_source === "auto")
                                ? "internal"
                                : product.images?.length
                                    ? "database"
                                    : "fallback",
                },
            },
        };

        // Apply region filtering if specified
        if (region_id && product.variants) {
            enhancedProduct.variants = product.variants.filter((variant: any) => {
                return variant.prices?.some((price: any) => price.region_id === region_id);
            });
        }

        res.json({
            product: enhancedProduct,
            cache_stats: catalogService.getCacheStats(),
        });
    } catch (error: any) {
        console.error(`[Products Enhanced] Error fetching product by handle:`, {
            handle,
            error: error.message,
        });

        throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            `Failed to fetch product: ${error.message}`
        );
    }
};
