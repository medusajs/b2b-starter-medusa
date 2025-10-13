import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { z } from "zod";

/**
 * Validation schema for kits API
 */
const KitsQuerySchema = z.object({
    limit: z.coerce.number().positive().max(100).default(20),
    offset: z.coerce.number().nonnegative().default(0),
    category: z.enum(["grid-tie", "off-grid", "hybrid", "backup", "commercial", "residential"]).optional(),
    manufacturer: z.string().optional(),
    min_price: z.coerce.number().positive().optional(),
    max_price: z.coerce.number().positive().optional(),
    search: z.string().optional(),
});

/**
 * GET /store/kits
 * Lista produtos do tipo kit com filtros de segurança obrigatórios
 */
export const GET = async (
  req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const query = req.scope.resolve<RemoteQueryFunction>(
            ContainerRegistrationKeys.QUERY
        );

        // Validate and parse query parameters
        const validatedQuery = KitsQuerySchema.parse(req.query);
        const { limit, offset, category, manufacturer, min_price, max_price, search } = validatedQuery;

        // Build secure filters - CRITICAL: Only published products
        const filters: any = {
            status: "published", // Security: Only published products
            type: "kit", // Only kit type products
        };

        // Add optional filters
        if (category) {
            filters.metadata = {
                ...filters.metadata,
                category: category,
            };
        }

        if (manufacturer) {
            filters.subtitle = {
                $ilike: `%${manufacturer}%`,
            };
        }

        if (search) {
            filters.title = {
                $ilike: `%${search}%`,
            };
        }

        // Fetch products with security filters
        const { data: products, metadata } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "description",
                "handle",
                "status",
                "subtitle",
                "thumbnail",
                "metadata",
                "created_at",
                "updated_at",
                "variants.id",
                "variants.title",
                "variants.sku",
                "variants.prices.amount",
                "variants.prices.currency_code",
                "images.url",
                "categories.id",
                "categories.name",
            ],
            filters,
            pagination: {
                skip: offset,
                take: limit,
                order: { created_at: "DESC" },
            },
        });

        // Apply price filtering (client-side for complex queries)
        let filteredProducts = products;
        if (min_price !== undefined || max_price !== undefined) {
            filteredProducts = products.filter((product: any) => {
                const variant = product.variants?.[0];
                const price = variant?.prices?.[0]?.amount;
                if (!price) return false;

                const priceInBRL = price / 100; // Convert from cents
                if (min_price !== undefined && priceInBRL < min_price) return false;
                if (max_price !== undefined && priceInBRL > max_price) return false;
                return true;
            });
        }

        // Build response with security metadata
        const response = {
            products: filteredProducts,
            count: filteredProducts.length,
            total: metadata?.count || filteredProducts.length,
            limit,
            offset,
            has_more: (offset + limit) < (metadata?.count || filteredProducts.length),
            filters_applied: {
                status: "published",
                type: "kit",
                category: category || null,
                manufacturer: manufacturer || null,
                price_range: min_price || max_price ? {
                    min: min_price,
                    max: max_price,
                } : null,
                search: search || null,
            },
            security: {
                filtered_by_status: true,
                filtered_by_type: true,
                pagination_enforced: true,
                rate_limited: false, // TODO: Implement rate limiting
            },
        };

        res.json(response);

    } catch (error: any) {
        console.error("Error fetching kits:", error);

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