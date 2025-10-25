/**
 * Rotas internas de produtos para admin
 * GET: listagem enriquecida com imagens ordenadas por rank, categorias e paginação
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /admin/internal/products
 * Lista produtos com imagens ordenadas por rank, suporte a busca e paginação
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const query = req.query as Record<string, string>
        const q = query.q
        const category = query.category
        const limit = Number(query.limit) || 20
        const offset = Number(query.offset) || 0

        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Construir filtros
        const filters: Record<string, unknown> = {}
        if (q) {
            filters.q = q
        }
        if (category) {
            filters.category_id = category
        }

        // Buscar produtos com relações
        const [products, count] = await productModule.listAndCountProducts(
            filters,
            {
                skip: offset,
                take: limit,
                relations: ["images", "variants", "categories", "collection"],
            }
        )

        // Ordenar imagens por rank (padrão Medusa v2)
        const items = products.map((p) => ({
            ...p,
            images: (p.images ?? [])
                .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
                .map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.metadata?.alt || "",
                    rank: img.rank ?? 0,
                })),
        }))

        return res.json({
            success: true,
            data: { items },
            meta: {
                count,
                limit,
                offset,
                total_pages: Math.ceil(count / limit),
            },
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err.message || "Failed to fetch products",
            },
        })
    }
}

/**
 * POST /admin/internal/products
 * Busca avançada de produtos com múltiplos filtros
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const body = req.body as Record<string, unknown>
        const q = body.q as string | undefined
        const category_ids = (body.category_ids as string[]) ?? []
        const collection_id = body.collection_id as string | undefined
        const tags = (body.tags as string[]) ?? []
        const status = (body.status as string[]) ?? []
        const limit = Number(body.limit) || 20
        const offset = Number(body.offset) || 0
        const sort_by = (body.sort_by as string) || "created_at"
        const sort_order = (body.sort_order as "ASC" | "DESC") || "DESC"

        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Construir filtros avançados
        const filters: Record<string, unknown> = {}
        if (q) filters.q = q
        if (category_ids.length > 0) filters.category_id = category_ids
        if (collection_id) filters.collection_id = collection_id
        if (tags.length > 0) filters.tags = tags
        if (status.length > 0) filters.status = status

        // Buscar produtos
        const [products, count] = await productModule.listAndCountProducts(
            filters,
            {
                skip: offset,
                take: limit,
                relations: ["images", "variants", "categories", "collection", "tags"],
                order: { [sort_by]: sort_order },
            }
        )

        // Ordenar imagens por rank
        const items = products.map((p) => ({
            ...p,
            images: (p.images ?? [])
                .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
                .map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.metadata?.alt || "",
                    rank: img.rank ?? 0,
                })),
        }))

        return res.json({
            success: true,
            data: { items },
            meta: {
                count,
                limit,
                offset,
                total_pages: Math.ceil(count / limit),
            },
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err.message || "Failed to search products",
            },
        })
    }
}