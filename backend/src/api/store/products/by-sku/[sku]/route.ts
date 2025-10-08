/**
 * API Route: Search Products by SKU
 * GET /api/products/by-sku/:sku
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const { sku } = req.params

    if (!sku) {
        res.status(400).json({
            error: "SKU parameter is required"
        })
        return
    }

    try {
        const productModuleService = req.scope.resolve("productModuleService") as any

        // Busca produtos por SKU (exact match)
        const products = await productModuleService.list({
            sku: sku,
        }, {
            relations: ["variants", "images", "categories"],
            take: 1,
        })

        if (products.length === 0) {
            // Tenta busca por SKU nas variants
            const variants = await productModuleService.listVariants({
                sku: sku,
            }, {
                relations: ["product", "product.images", "product.categories"],
                take: 1,
            })

            if (variants.length > 0) {
                res.status(200).json({
                    product: variants[0].product,
                    variant: variants[0],
                    matched_by: "variant_sku"
                })
                return
            }

            // Tenta busca no metadata
            const productsWithMetadata = await productModuleService.list({
                metadata: {
                    sku: sku,
                }
            }, {
                relations: ["variants", "images", "categories"],
                take: 1,
            })

            if (productsWithMetadata.length > 0) {
                res.status(200).json({
                    product: productsWithMetadata[0],
                    matched_by: "metadata_sku"
                })
                return
            }

            res.status(404).json({
                error: "Product not found",
                sku: sku
            })
            return
        }

        res.status(200).json({
            product: products[0],
            matched_by: "product_sku"
        })

    } catch (error) {
        console.error("Error searching product by SKU:", error)
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        })
    }
}

/**
 * API Route: Search Products by SKU (fuzzy match)
 * GET /api/products/search-sku?q=partial-sku
 */
export async function searchBySKU(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
        res.status(400).json({
            error: "Query parameter 'q' is required"
        })
        return
    }

    try {
        const productModuleService = req.scope.resolve("productModuleService") as any

        // Busca parcial de SKU
        const products = await productModuleService.list({}, {
            relations: ["variants", "images", "categories"],
            take: 20,
        })

        // Filtra produtos que têm SKU similar
        const matches = products.filter(product => {
            // Verifica SKU do produto
            if (product.sku && product.sku.toLowerCase().includes(q.toLowerCase())) {
                return true
            }

            // Verifica SKU nas variants
            if (product.variants) {
                return product.variants.some(variant =>
                    variant.sku && variant.sku.toLowerCase().includes(q.toLowerCase())
                )
            }

            // Verifica metadata
            if (product.metadata && product.metadata.sku) {
                return String(product.metadata.sku).toLowerCase().includes(q.toLowerCase())
            }

            return false
        })

        res.status(200).json({
            products: matches,
            count: matches.length,
            query: q
        })

    } catch (error) {
        console.error("Error searching SKU:", error)
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        })
    }
}
