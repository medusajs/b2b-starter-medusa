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
        const { q, category, limit = 20, offset = 0 } = req.query as any
        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Construir filtros
        const filters: any = {}
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
                skip: +offset,
                take: +limit,
                relations: ["images", "variants", "categories", "collection"],
            }
        )

        // Ordenar imagens por rank (padrão Medusa v2)
        const items = products.map((p: any) => ({
            ...p,
            images: (p.images ?? [])
                .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
                .map((img: any) => ({
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
                limit: +limit,
                offset: +offset,
                total_pages: Math.ceil(count / +limit),
            },
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: error.message || "Failed to fetch products",
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
        const {
            q,
            category_ids = [],
            collection_id,
            tags = [],
            status = [],
            limit = 20,
            offset = 0,
            sort_by = "created_at",
            sort_order = "DESC",
        } = req.body ?? {}

        const productModule = req.scope.resolve(Modules.PRODUCT)

        // Construir filtros avançados
        const filters: any = {}
        if (q) filters.q = q
        if (category_ids.length > 0) filters.category_id = category_ids
        if (collection_id) filters.collection_id = collection_id
        if (tags.length > 0) filters.tags = tags
        if (status.length > 0) filters.status = status

        // Buscar produtos
        const [products, count] = await productModule.listAndCountProducts(
            filters,
            {
                skip: +offset,
                take: +limit,
                relations: ["images", "variants", "categories", "collection", "tags"],
                order: { [sort_by]: sort_order },
            }
        )

        // Ordenar imagens por rank
        const items = products.map((p: any) => ({
            ...p,
            images: (p.images ?? [])
                .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
                .map((img: any) => ({
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
                limit: +limit,
                offset: +offset,
                total_pages: Math.ceil(count / +limit),
            },
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: error.message || "Failed to search products",
            },
        })
    }
}
