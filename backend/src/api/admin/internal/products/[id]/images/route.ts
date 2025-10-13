/**
 * Rotas de gerenciamento de imagens de produtos
 * POST: anexar imagens ao produto/variante
 * PATCH: reordenar imagens por rank
 * DELETE: remover imagens
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /admin/internal/products/:id/images
 * Anexa imagens a um produto ou variante
 */
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { id } = req.params
        const body = req.body as Record<string, unknown>
        const files = (body.files as Array<{ url?: string; fileId?: string; alt?: string }>) ?? []
        const attachTo = (body.attachTo as "product" | "variant") ?? "product"
        const variant_id = body.variant_id as string | undefined

        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "No files provided",
                },
            })
        }

        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Anexar imagens com rank sequencial
        const imageData = files.map((f, i) => ({
            url: f.url || "",
            metadata: { alt: f.alt },
            rank: i,
        }))

        // Se for variante, adicionar via update de variante
        if (attachTo === "variant" && variant_id) {
            await productModule.updateVariants([
                {
                    id: variant_id,
                    // @ts-expect-error - images pode não estar na tipagem completa
                    images: imageData,
                },
            ])
        } else {
            // Adicionar ao produto
            await productModule.updateProducts([
                {
                    id,
                    // @ts-expect-error - images pode não estar na tipagem completa
                    images: imageData,
                },
            ])
        }

        return res.json({
            success: true,
            data: {
                attached: files.length,
            },
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err.message || "Failed to attach images",
            },
        })
    }
}

/**
 * PATCH /admin/internal/products/:id/images
 * Reordena imagens de um produto atualizando o rank
 */
export const PATCH = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { id } = req.params
        const body = req.body as Record<string, unknown>
        const reorder = (body.reorder as Array<{ image_id: string; rank: number }>) ?? []

        if (reorder.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "No reorder data provided",
                },
            })
        }

        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Buscar produto atual
        const product = await productModule.retrieveProduct(id, {
            relations: ["images"],
        })

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Product not found",
                },
            })
        }

        // Atualizar rank de cada imagem
        const updatedImages = (product.images ?? []).map((img) => {
            const newRank = reorder.find((r) => r.image_id === img.id)?.rank
            return {
                ...img,
                rank: newRank !== undefined ? newRank : img.rank,
            }
        })

        // Atualizar produto
        await productModule.updateProducts([
            {
                id,
                // @ts-expect-error - images pode não estar na tipagem completa
                images: updatedImages,
            },
        ])

        return res.json({
            success: true,
            data: {
                reordered: reorder.length,
            },
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err.message || "Failed to reorder images",
            },
        })
    }
}

/**
 * DELETE /admin/internal/products/:id/images
 * Remove imagens de um produto
 */
export const DELETE = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { id } = req.params
        const body = req.body as Record<string, unknown>
        const image_ids = (body.image_ids as string[]) ?? []

        if (image_ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "No image IDs provided",
                },
            })
        }

        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Buscar produto atual
        const product = await productModule.retrieveProduct(id, {
            relations: ["images"],
        })

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Product not found",
                },
            })
        }

        // Filtrar imagens removendo as especificadas
        const remainingImages = (product.images ?? []).filter(
            (img) => !image_ids.includes(img.id)
        )

        // Atualizar produto
        await productModule.updateProducts([
            {
                id,
                // @ts-expect-error - images pode não estar na tipagem completa
                images: remainingImages,
            },
        ])

        return res.json({
            success: true,
            data: {
                removed: image_ids.length,
            },
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err.message || "Failed to remove images",
            },
        })
    }
}
