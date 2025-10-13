/**
 * Unified Products API
 * GET /store/products
 *
 * Consolidated endpoint that replaces:
 * - /store/catalog (deprecated)
 * - /store/internal-catalog (deprecated)
 * - /store/products_enhanced (deprecated)
 * - /store/products.custom (deprecated)
 *
 * Supports all previous functionality via query parameters:
 * - ?source=internal|external
 * - ?enhanced=true
 * - ?custom=true
 * - ?category=panels|inverters|...
 * - ?manufacturer=...
 * - ?limit=...&offset=...
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { getInternalCatalogService } from "../internal-catalog/catalog-service";
import { z } from "zod";

/**
 * Unified Products Query Schema
 */
const UnifiedProductsQuerySchema = z.object({
    // Source filters
    source: z.enum(["internal", "external", "all"]).default("all").optional(),
    enhanced: z.coerce.boolean().default(false).optional(),
    custom: z.coerce.boolean().default(false).optional(),

    // Product filters
    category: z.string().optional(),
    manufacturer: z.string().optional(),
    min_price: z.coerce.number().positive().optional(),
    max_price: z.coerce.number().positive().optional(),
    q: z.string().optional(), // search query

    // Pagination
    limit: z.coerce.number().positive().max(100).default(20),
    offset: z.coerce.number().nonnegative().default(0),

    // Sorting
    sort: z.enum(["created_at", "updated_at", "title", "price"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

type UnifiedProductsQuery = z.infer<typeof UnifiedProductsQuerySchema>;

/**
 * GET /store/products
 * Unified product listing with all catalog functionality
 */
export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const validatedQuery = UnifiedProductsQuerySchema.parse(req.query);
        const {
            source,
            enhanced,
            custom,
            category,
            manufacturer,
            min_price,
            max_price,
            q,
            limit,
            offset,
            sort,
            order
        } = validatedQuery;

        // Initialize services
        const productService = req.scope.resolve(ModuleRegistrationName.PRODUCT);
        const catalogService = getInternalCatalogService();

        let products: any[] = [];
        let totalCount = 0;

        // Handle different source types
        if (source === "internal" || enhanced) {
            // Use internal catalog service
            const page = Math.floor(offset / limit) + 1;

            if (category) {
                // Category-specific query
                const result = await catalogService.getCategoryProducts(
                    category,
                    page,
                    limit,
                    { manufacturer }
                );
                products = result.products || [];
                totalCount = result.total || 0;
            } else {
                // General catalog overview - get stats for all categories
                const categories = ['panels', 'inverters', 'batteries', 'kits', 'cables'];
                const statsPromises = categories.map(cat => catalogService.getCategoryStats(cat));
                const stats = await Promise.all(statsPromises);

                // Return overview with category statistics
                products = stats.map(stat => ({
                    id: `category_${stat.category}`,
                    title: `${stat.category} (${stat.total_products} products)`,
                    category: stat.category,
                    total_products: stat.total_products,
                    with_images: stat.with_images,
                    manufacturers: stat.manufacturers,
                    avg_price_brl: stat.avg_price_brl
                }));
                totalCount = categories.length;
            }
        } else if (custom) {
            // Custom products (no auth required like products.custom)
            const filters: any = {
                status: "published"
            };

            if (category) filters.tags = { value: [category] };
            if (manufacturer) filters.metadata = { manufacturer };
            if (min_price) filters.price_list = { min: min_price };
            if (max_price) filters.price_list = { ...filters.price_list, max: max_price };
            if (q) filters.q = q;

            const [fetchedProducts, count] = await Promise.all([
                productService.listProducts(filters, {
                    skip: offset,
                    take: limit,
                    order: { [sort]: order }
                }),
                productService.listProducts(filters, { skip: 0, take: 1 })
            ]);

            products = fetchedProducts;
            totalCount = count.length;
        } else {
            // Standard Medusa products
            const filters: any = {
                status: "published"
            };

            if (category) filters.tags = { value: [category] };
            if (manufacturer) filters.metadata = { manufacturer };
            if (min_price || max_price) {
                filters.price_list = {};
                if (min_price) filters.price_list.min = min_price;
                if (max_price) filters.price_list.max = max_price;
            }
            if (q) filters.q = q;

            const [fetchedProducts, count] = await Promise.all([
                productService.listProducts(filters, {
                    skip: offset,
                    take: limit,
                    order: { [sort]: order }
                }),
                productService.listProducts(filters, { skip: 0, take: 1 })
            ]);

            products = fetchedProducts;
            totalCount = count.length;
        }

        // Apply enhanced features if requested
        if (enhanced && products.length > 0) {
            // Add internal catalog images and enhanced data
            for (const product of products) {
                try {
                    const sku = await catalogService.extractSku({
                        title: product.title,
                        metadata: product.metadata
                    });

                    if (sku) {
                        const internalImage = await catalogService.getImageForSku(sku);
                        if (internalImage) {
                            product.images = product.images || [];
                            product.images.unshift(internalImage);
                        }
                    }
                } catch (error) {
                    // Silently continue if enhancement fails
                    console.warn(`Failed to enhance product ${product.id}:`, error);
                }
            }
        }

        res.json({
            products,
            count: totalCount,
            offset,
            limit,
            // Legacy compatibility
            total: totalCount
        });

    } catch (error) {
        console.error("Error in unified products API:", error);
        throw new MedusaError(
            MedusaError.Types.DB_ERROR,
            error instanceof Error ? error.message : "Failed to fetch products"
        );
    }
}; </content>
    < parameter name = "filePath" > c: \Users\fjuni\ysh_medusa\ysh - store\backend\src\api\store\products\route.ts