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
        // Use correct Medusa product service
        const productService = req.scope.resolve("product")

        // Search by SKU (exact match on product)
        const products = await productService.listProducts({
            variants: {
                sku: sku
            }
        }, {
            relations: ["variants", "images", "categories"],
            take: 1,
        })

        if (products.length > 0) {
            res.status(200).json({
                product: products[0],
                matched_by: "product_variant_sku"
            })
            return
        }

        // Try search by SKU in product metadata
        const productsWithMetadata = await productService.listProducts({
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

        // Try direct SKU match on product (legacy)
        const directSkuMatch = await productService.listProducts({
            sku: sku,
        }, {
            relations: ["variants", "images", "categories"],
            take: 1,
        })

        if (directSkuMatch.length > 0) {
            res.status(200).json({
                product: directSkuMatch[0],
                matched_by: "direct_product_sku"
            })
            return
        }

        res.status(404).json({
            error: "Product not found",
            sku: sku,
            search_attempts: [
                "product_variant_sku",
                "metadata_sku",
                "direct_product_sku"
            ]
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
        const productService = req.scope.resolve("product")

        // Get all products with pagination for fuzzy search
        const products = await productService.listProducts({}, {
            relations: ["variants", "images", "categories"],
            take: 50, // Limit for performance
        })

        // Filter products that have SKU similar to query
        const matches = products.filter(product => {
            // Check product SKU
            if (product.sku && product.sku.toLowerCase().includes(q.toLowerCase())) {
                return true
            }

            // Check SKU in variants
            if (product.variants) {
                return product.variants.some(variant =>
                    variant.sku && variant.sku.toLowerCase().includes(q.toLowerCase())
                )
            }

            // Check metadata
            if (product.metadata && product.metadata.sku) {
                return String(product.metadata.sku).toLowerCase().includes(q.toLowerCase())
            }

            return false
        })

        res.status(200).json({
            products: matches,
            count: matches.length,
            query: q,
            search_type: "fuzzy",
            max_results: 50
        })

    } catch (error) {
        console.error("Error searching SKU:", error)
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        })
    }
}
