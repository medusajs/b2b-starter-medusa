import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { getInternalCatalogService } from "../../internal-catalog/catalog-service";
// import { UNIFIED_CATALOG_MODULE, UnifiedCatalogModuleServiceType } from "../../../../modules/unified-catalog"; // DEPRECATED: Using Internal Catalog

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
  // Extract manufacturer as string if it's an object
  const manufacturerStr = typeof raw.manufacturer === 'object'
    ? raw.manufacturer?.name
    : raw.manufacturer;
  const distributor = raw.distributor || raw.centro_distribuicao || manufacturerStr || undefined
  const potencia_kwp = raw.potencia_kwp ?? raw.kwp ?? undefined
  const processed_images = ensureProcessedImages(raw)

  const base: any = {
    id: raw.id || raw.sku,
    sku: raw.sku,
    name: raw.name || raw.model,
    manufacturer: manufacturerStr,
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
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { category } = req.params;
  const catalogService = getInternalCatalogService();

  try {
    const {
      page = 1,
      limit = 100, // Internal Catalog supports up to 200
      manufacturer,
      hasImage,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 100, 200); // Cap at 200

    // Fetch from Internal Catalog
    const startTime = Date.now();
    const result = await catalogService.getCategoryProducts(
      category as string,
      pageNum,
      limitNum,
      {
        manufacturer: manufacturer as string,
        hasImage: hasImage === 'true',
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      }
    );

    const queryTime = Date.now() - startTime;

    // Transform products to match legacy format
    const products = result.products.map((item: any) => normalizeProduct(category as string, {
      id: item.id,
      sku: item.sku,
      name: item.name,
      manufacturer: item.manufacturer,
      model: item.model,
      category: item.category,
      price_brl: item.price_brl,
      price: item.price,
      kwp: item.technical_specs?.power_kwp || item.technical_specs?.power_kw,
      efficiency_pct: item.technical_specs?.efficiency,
      image: item.image.url,
      image_url: item.image.url,
      processed_images: item.image.sizes,
      source: 'internal_catalog',
      distributor: item.distributor,
    }));

    res.json({
      products,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      pagination: result.pagination,
      stats: result.stats,
      cache: result.cache,
      performance: {
        query_time_ms: queryTime,
        image_load_time_ms: result.performance?.image_load_time_ms || 0,
        total_time_ms: result.performance?.total_time_ms || queryTime,
      },
      facets: {
        manufacturers: result.stats.manufacturers || [],
      },
      source: 'internal_catalog', // Indicate data source
    });
  } catch (error: any) {
    console.error(`[Catalog] Error fetching category ${category}:`, error);
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      error?.message ?? `Failed to fetch ${category} products from internal catalog`
    );
  }
};
