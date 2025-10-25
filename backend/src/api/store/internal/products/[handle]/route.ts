/**
 * Rota store pública para PDP enhanced
 * GET /store/internal/products/[handle]
 * Requer x-publishable-api-key no header
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/internal/products/:handle
 * Busca produto por handle com imagens ordenadas
 * Público mas requer publishable key
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        // Validar publishable key (automático pelo middleware Medusa)
        const publishableKey = req.headers["x-publishable-api-key"]
        if (!publishableKey) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "x-publishable-api-key header is required",
                },
            })
        }

        const { handle } = req.params
        if (!handle) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "Product handle is required",
                },
            })
        }

        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Buscar produto por handle
        const [products] = await productModule.listAndCountProducts(
            { handle },
            {
                take: 1,
                relations: ["images", "variants", "categories", "collection"],
            }
        )

        const product = products[0]
        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Product not found",
                },
            })
        }

        // Ordenar imagens por rank (padrão Medusa v2)
        const enhancedProduct = {
            ...product,
            images: (product.images ?? [])
                .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
                .map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.metadata?.alt || "",
                    rank: img.rank ?? 0,
                })),
        }

        return res.json({
            success: true,
            data: enhancedProduct,
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err.message || "Failed to fetch product",
            },
        })
    }
}
