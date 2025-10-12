import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// Module key for resolution
const UNIFIED_CATALOG_MODULE = "unifiedCatalog";

function parsePriceBRL(price?: string): number | undefined {
    if (!price) return undefined
    const cleaned = price.replace(/[^\d.,]/g, "").replace(".", "").replace(",", ".")
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
}

function ensureProcessedImages(p: any) {
    const img = p?.processed_images || {}
    const image_url = p?.image || p?.image_url
    if (!img.thumb && image_url) img.thumb = image_url
    if (!img.medium && image_url) img.medium = image_url
    if (!img.large && image_url) img.large = image_url
    return img
}

function normalizeProduct(category: string | undefined, raw: any) {
    const price_brl = raw.price_brl ?? parsePriceBRL(raw.price)
    const distributor = raw.distributor || raw.centro_distribuicao || raw.manufacturer || undefined
    const potencia_kwp = raw.potencia_kwp ?? raw.kwp ?? undefined
    const processed_images = ensureProcessedImages(raw)

    const base: any = {
        id: raw.id || raw.sku,
        sku: raw.sku,
        name: raw.name || raw.model,
        manufacturer: raw.manufacturer,
        model: raw.model,
        category: category || raw.category,
        price_brl,
        price: raw.price,
        distributor,
        type: raw.type || raw.tipo,
        potencia_kwp,
        kwp: raw.kwp,
        efficiency_pct: raw.efficiency_pct,
        image_url: raw.image || raw.image_url,
        processed_images,
        source: raw.source,
    }

    if ((category || raw.category) === "kits") {
        base.estrutura = raw.estrutura
        base.centro_distribuicao = raw.centro_distribuicao
        base.panels = raw.panels || []
        base.inverters = raw.inverters || []
        base.batteries = raw.batteries || []
        base.total_panels = raw.total_panels ?? (Array.isArray(raw.panels) ? raw.panels.reduce((acc: number, x: any) => acc + (x.quantity || 0), 0) : undefined)
        base.total_inverters = raw.total_inverters ?? (Array.isArray(raw.inverters) ? raw.inverters.reduce((acc: number, x: any) => acc + (x.quantity || 0), 0) : undefined)
        base.total_power_w = raw.total_power_w ?? (Array.isArray(raw.panels) ? raw.panels.reduce((acc: number, x: any) => acc + ((x.power_w || 0) * (x.quantity || 0)), 0) : undefined)
    }

    return base
}

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const catalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE) as any;

    try {
        const { q: query, category, limit = 20, page = 1, manufacturer, minPrice, maxPrice, availability, sort } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: "Parâmetro de busca obrigatório",
                message: "Use o parâmetro 'q' para especificar o termo de busca"
            });
        }

        const options = {
            category: category as string,
            limit: 10000,
        };

        let products = await catalogService.searchProducts(query, options);

        // Additional filters
        if (manufacturer) {
            products = products.filter((p) => p.manufacturer?.toLowerCase().includes((manufacturer as string).toLowerCase()))
        }

        const parseNumber = (s?: string) => {
            if (!s) return undefined
            const cleaned = s.replace(/[^0-9.,]/g, "")
            if (cleaned.includes('.') && cleaned.includes(',')) return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
            if (cleaned.includes(',')) return parseFloat(cleaned.replace(',', '.'))
            return parseFloat(cleaned)
        }
        const minP = minPrice ? parseFloat(minPrice as string) : undefined
        const maxP = maxPrice ? parseFloat(maxPrice as string) : undefined
        if (minP !== undefined || maxP !== undefined) {
            products = products.filter((p) => {
                const val = parseNumber(p.price)
                if (val === undefined || isNaN(val)) return false
                if (minP !== undefined && val < minP) return false
                if (maxP !== undefined && val > maxP) return false
                return true
            })
        }
        if (availability) {
            products = products.filter((p) => p.availability?.toLowerCase().includes((availability as string).toLowerCase()))
        }
        if (sort === 'price_asc' || sort === 'price_desc') {
            products = [...products].sort((a, b) => {
                const pa = parseNumber(a.price) ?? Number.POSITIVE_INFINITY
                const pb = parseNumber(b.price) ?? Number.POSITIVE_INFINITY
                return sort === 'price_asc' ? pa - pb : pb - pa
            })
        }

        const total = products.length
        const pageNum = parseInt(page as string) || 1
        const pageSize = parseInt(limit as string) || 20
        const start = (pageNum - 1) * pageSize
        const end = start + pageSize
        const pageItems = products.slice(start, end)

        const normalized = pageItems.map((p) => normalizeProduct(options.category, p))

        res.json({
            query,
            total,
            page: pageNum,
            limit: pageSize,
            products: normalized
        });
    } catch (error) {
        res.status(400).json({
            error: "Erro na busca",
            message: error.message
        });
    }
};
