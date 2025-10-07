import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { YSH_CATALOG_MODULE } from "../../../../modules/ysh-catalog";
import YshCatalogModuleService from "../../../../modules/ysh-catalog/service";

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

function normalizeProduct(category: string, raw: any) {
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
  const yshCatalogService = req.scope.resolve(YSH_CATALOG_MODULE) as YshCatalogModuleService;
  const { category } = req.params;

  try {
        const {
            page = 1,
            limit = 20,
            manufacturer,
            minPrice,
            maxPrice,
            availability,
            sort
        } = req.query;

        const options = {
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 20,
            manufacturer: manufacturer as string,
            minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
            availability: availability as string,
            sort: (sort as string) === 'price_asc' || (sort as string) === 'price_desc' ? (sort as any) : undefined,
        };

        // Compute facets for the category (manufacturers) using full filtered set
        const facetResult = await yshCatalogService.listProductsByCategory(category, {
            page: 1,
            limit: 100000,
            manufacturer: options.manufacturer,
            minPrice: options.minPrice,
            maxPrice: options.maxPrice,
            availability: options.availability,
            // sort does not affect facets
        })
        const manufacturersSet = new Set<string>()
        facetResult.products.forEach((p) => {
            if (p.manufacturer) manufacturersSet.add(p.manufacturer)
        })
        const manufacturersFacet = Array.from(manufacturersSet).sort((a, b) => a.localeCompare(b))

        // Fetch paginated data for the response
        const result = await yshCatalogService.listProductsByCategory(category, options);
        const normalized = result.products.map((p) => normalizeProduct(category, p))

        res.json({ ...result, products: normalized, facets: { manufacturers: manufacturersFacet } });
  } catch (error) {
    res.status(400).json({
      error: "Erro ao buscar produtos",
      message: error.message
    });
  }
};
