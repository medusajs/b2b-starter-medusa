import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * Public product listing endpoint - NO AUTH REQUIRED
 * This endpoint exposes products from the database for storefront consumption
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const productService = req.scope.resolve("product");

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

        // Fetch products
        const products = await productService.listProducts(
            filters,
            {
                skip: parseInt(offset as string),
                take: parseInt(limit as string),
                order: {
                    [sort as string]: order === "asc" ? "ASC" : "DESC",
                },
                relations: ["variants", "variants.prices", "images"],
            }
        );

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

        // Get total count
        const totalCount = await productService.listProducts(filters, { skip: 0, take: 1 });

        // Format response
        const formattedProducts = filteredProducts.map((product: any) => {
            const variant = product.variants?.[0];
            const price = variant?.prices?.[0]?.amount || 0;

            return {
                id: product.id,
                title: product.title,
                subtitle: product.subtitle,
                description: product.description,
                handle: product.handle,
                manufacturer: product.subtitle,
                category: product.metadata?.category,
                price_brl: price / 100,
                sku: variant?.sku,
                images: product.images?.map((img: any) => ({
                    url: img.url,
                    id: img.id,
                })) || [],
                processed_images: product.metadata?.processed_images || {},
                metadata: product.metadata || {},
                created_at: product.created_at,
                updated_at: product.updated_at,
            };
        });

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
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};
