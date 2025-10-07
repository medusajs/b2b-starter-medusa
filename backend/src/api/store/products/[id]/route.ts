import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * Public product detail endpoint - NO AUTH REQUIRED
 * Get a single product by ID or handle
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
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
        const price = variant?.prices?.[0]?.amount || 0;

        const formattedProduct = {
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
            metadata: product.metadata || {},
            created_at: product.created_at,
            updated_at: product.updated_at,
        };

        res.json({ product: formattedProduct });
    } catch (error: any) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};
