import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { YSH_CATALOG_MODULE } from "../../../../../modules/ysh-catalog";
import YshCatalogModuleService from "../../../../../modules/ysh-catalog/service";

function parsePriceBRL(price?: string): number | undefined {
    if (!price) return undefined
    const cleaned = price.replace(/[^\d.,]/g, "").replace(".", "").replace(",", ".")
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
}

function ensureProcessedImages(p: any) {
    const img = p?.processed_images || {}
    const image_url = p?.image || p?.image_url
    if (!img.thumb && image_url) {
        img.thumb = image_url
    }
    if (!img.medium && image_url) {
        img.medium = image_url
    }
    if (!img.large && image_url) {
        img.large = image_url
    }
    return img
}

function normalizeProduct(category: string, raw: any) {
    const price_brl = raw.price_brl ?? parsePriceBRL(raw.price)
    const distributor = raw.distributor || raw.centro_distribuicao || raw.manufacturer || undefined
    const potencia_kwp = raw.potencia_kwp ?? raw.kwp ?? undefined
    const processed_images = ensureProcessedImages(raw)

    const base = {
        id: raw.id || raw.sku,
        sku: raw.sku,
        name: raw.name || raw.model,
        manufacturer: raw.manufacturer,
        model: raw.model,
        category,
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

    if (category === "kits") {
        return {
            ...base,
            estrutura: raw.estrutura,
            centro_distribuicao: raw.centro_distribuicao,
            panels: raw.panels || [],
            inverters: raw.inverters || [],
            batteries: raw.batteries || [],
            total_panels: raw.total_panels ?? (Array.isArray(raw.panels) ? raw.panels.reduce((acc: number, x: any) => acc + (x.quantity || 0), 0) : undefined),
            total_inverters: raw.total_inverters ?? (Array.isArray(raw.inverters) ? raw.inverters.reduce((acc: number, x: any) => acc + (x.quantity || 0), 0) : undefined),
            total_power_w: raw.total_power_w ?? (Array.isArray(raw.panels) ? raw.panels.reduce((acc: number, x: any) => acc + ((x.power_w || 0) * (x.quantity || 0)), 0) : undefined),
        }
    }

    return base
}

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const yshCatalogService = req.scope.resolve(YSH_CATALOG_MODULE) as YshCatalogModuleService;
    const { category, id } = req.params;

    try {
        const product = await yshCatalogService.getProductById(category, id);

        if (!product) {
            return res.status(404).json({
                error: "Produto não encontrado",
                message: `Produto ${id} não encontrado na categoria ${category}`
            });
        }

        const normalized = normalizeProduct(category, product)
        res.json({ product: normalized });
    } catch (error) {
        res.status(400).json({
            error: "Erro ao buscar produto",
            message: error.message
        });
    }
};
