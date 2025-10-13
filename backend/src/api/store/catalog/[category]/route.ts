import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { UNIFIED_CATALOG_MODULE, UnifiedCatalogModuleServiceType } from "../../../../modules/unified-catalog";

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
  const unifiedCatalogService = req.scope.resolve(UNIFIED_CATALOG_MODULE) as UnifiedCatalogModuleServiceType;
  const { category } = req.params;

  try {
    const {
      page = 1,
      limit = 20,
      manufacturer,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Determine if we're querying SKUs or Kits based on category
    const isKitCategory = category === 'kits';

    const where: any = {};

    if (!isKitCategory) {
      // SKU category filter
      where.category = category;
      if (manufacturer) {
        where.manufacturer_id = manufacturer;
      }
    } else {
      // Kit category
      if (manufacturer) {
        where.manufacturer_id = manufacturer;
      }
    }

    // Fetch data with unified catalog service
    const [items, total] = isKitCategory
      ? await unifiedCatalogService.listAndCountKitsWithFilters(where, { skip: offset, take: limitNum })
      : await unifiedCatalogService.listAndCountSKUsWithFilters(where, { skip: offset, take: limitNum });

    // Get manufacturers for facets
    const manufacturers = await unifiedCatalogService.listManufacturers();

    // Transform to match expected format - normalizeProduct extracts manufacturer string internally
    const products = items.map((item: any) => {
      const mfrName = item.manufacturer?.name || item.manufacturer || '';
      const model = item.model_number || item.kit_code || '';
      const defaultName = model ? `${mfrName} ${model}`.trim() : mfrName;

      return normalizeProduct(category, {
        id: item.id,
        sku: item.sku_code || item.kit_code,
        name: item.description || item.name || defaultName,
        manufacturer: item.manufacturer, // normalizeProduct will extract string from object if needed
        model: model,
        category: item.category,
        price_brl: item.lowest_price || item.kit_price,
        price: (item.lowest_price || item.kit_price)?.toString(),
        kwp: item.technical_specs?.power_kwp || item.system_capacity_kwp,
        efficiency_pct: item.technical_specs?.efficiency,
        image_url: null, // TODO: Add image support
        source: 'unified_catalog',
        offers_count: item.offers_count
      });
    }); res.json({
      products,
      total,
      page: pageNum,
      limit: limitNum,
      facets: {
        manufacturers: manufacturers.map(m => m.name)
      }
    });
  } catch (error) {
    console.error(`[Catalog] Error fetching category ${category}:`, error);
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? `Failed to fetch ${category} products`);
  }
};
