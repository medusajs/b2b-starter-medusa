import {
    ExecArgs,
    IProductModuleService,
} from "@medusajs/framework/types";

import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/core-flows";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

interface CatalogItem {
    id?: string;
    sku?: string;
    name?: string;
    manufacturer?: string;
    category?: string;
    price?: number | string;
    price_brl?: number;
    image?: string;
    image_url?: string;
    description?: string;
    availability?: string;
    processed_images?: {
        thumb?: string;
        medium?: string;
        large?: string;
    };
    model?: string;
    technology?: string;
    potencia_kwp?: number;
    kwp?: number;
    cells?: number;
    efficiency_pct?: number;
    dimensions_mm?: string;
    weight_kg?: number;
    source?: string;
    distributor?: string;
    centro_distribuicao?: string;
    technical_specs?: any;
    panels?: any[];
    inverters?: any[];
    batteries?: any[];
    structures?: any[];
    total_panels?: number;
    total_inverters?: number;
    total_power_w?: number;
    estrutura?: string;
}

// ==========================================================
// SKU Registry support + deterministic SKU generation
// ==========================================================

type SkuRegistry = {
  version?: string
  generated_at?: string
  items?: Array<{ category: string; id: string; sku: string }>
  map?: Record<string, string> // optional: key `${category}:${id}` -> sku
}

const loadSkuRegistry = (): SkuRegistry | null => {
  try {
    const envRegistry = process.env.REGISTRY_PATH
    const defaultPath = path.join(__dirname, "../data/catalog/unified_schemas/sku_registry.json")
    const candidate = envRegistry || defaultPath
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, "utf-8")
      const parsed: SkuRegistry = JSON.parse(raw)
      // normalize to map
      if (!parsed.map && parsed.items) {
        parsed.map = Object.fromEntries(parsed.items.map((x) => [`${x.category}:${x.id}`, x.sku]))
      }
      return parsed
    }
  } catch {}
  return null
}

const toSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toUpperCase()

const hash8 = (s: string) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 8).toUpperCase()

const cleanSku = (s: string) => s.replace(/[^A-Z0-9\-]/g, "").slice(0, 64)

const stableSku = (item: CatalogItem, category: string, registry: SkuRegistry | null): string => {
  // Priority 1: explicit sku
  if (item.sku && /[A-Za-z0-9]/.test(item.sku)) return cleanSku(item.sku.toUpperCase())

  // Priority 2: registry mapping
  const id = item.id?.toString() || ""
  const regKey = `${category}:${id}`
  const regSku = registry?.map?.[regKey]
  if (regSku) return cleanSku(regSku.toUpperCase())

  // Priority 3: use unified id if exists
  if (id) return cleanSku(id.toUpperCase())

  // Priority 4: deterministic synthesis from attributes
  const brand = (item.manufacturer || "YSH").toString()
  const model = (item.model || item.name || "").toString()
  const power = (item.potencia_kwp || item.kwp || (item as any).power_w || (item as any).price_brl || "").toString()
  const base = `${category}-${brand}-${model}-${power}`
  const slug = toSlug(base)
  const h = hash8(base)
  return cleanSku(`${slug}-${h}`)
}

const parsePrice = (price: any): number => {
    if (typeof price === "number") return price;
    if (!price) return 0;
    const cleaned = String(price).replace(/[^\d.,]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

const readCatalogFile = (fileName: string): CatalogItem[] => {
    const baseDir = path.join(__dirname, "../data/catalog/unified_schemas");
    const normalizedName = fileName.replace('.json', '_normalized.json');
    const normalizedPath = path.join(baseDir, normalizedName);
    const filePath = path.join(baseDir, fileName);

    const candidate = fs.existsSync(normalizedPath) ? normalizedPath : filePath;
    if (!fs.existsSync(candidate)) {
        console.warn(`Arquivo ${fileName} nao encontrado em unified_schemas`);
        return [];
    }

    try {
        const data = fs.readFileSync(candidate, "utf-8");
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
            return parsed;
        } else if (parsed && typeof parsed === "object") {
            for (const key of Object.keys(parsed)) {
                if (Array.isArray(parsed[key])) {
                    return parsed[key];
                }
            }
            return [parsed];
        }

        return [];
    } catch (error) {
        console.error(`Erro ao ler ${fileName}:`, error);
        return [];
    }
};

const categoryMap: Record<string, string> = {
    "accessories": "Acessorios",
    "kits": "Kits Solares",
    "panels": "Paineis Fotovoltaicos",
    "inverters": "Inversores",
    "batteries": "Baterias",
    "structures": "Estruturas",
    "cables": "Cabos",
    "controllers": "Controladores",
    "chargers": "Carregadores EV",
    "stringboxes": "String Boxes",
    "posts": "Postes",
    "others": "Outros"
};

export default async function seedCatalog({ container }: ExecArgs) {
    const logger = container.resolve("logger");

    logger.info("🌱 Starting YSH catalog seeding from unified_schemas...");

    // Create product categories
    const categories = [
        { name: "Kits Solares", handle: "kits" },
        { name: "Paineis Fotovoltaicos", handle: "panels" },
        { name: "Inversores", handle: "inverters" },
        { name: "Baterias", handle: "batteries" },
        { name: "Estruturas", handle: "structures" },
        { name: "Cabos", handle: "cables" },
        { name: "Controladores", handle: "controllers" },
        { name: "Carregadores EV", handle: "chargers" },
        { name: "Acessorios", handle: "accessories" },
        { name: "String Boxes", handle: "stringboxes" },
        { name: "Postes", handle: "posts" },
        { name: "Outros", handle: "others" }
    ];

    const categoryMap: Record<string, any> = {};

    for (const category of categories) {
        try {
            const result = await createProductCategoriesWorkflow(container).run({
                input: { product_categories: [category] }
            });
            categoryMap[category.handle] = result.result?.[0];
            logger.info(`✓ Created category: ${category.name}`);
        } catch (error: any) {
            logger.warn(`Category ${category.name} might already exist: ${error.message}`);
        }
    }

    // Read catalog files from unified_schemas
    const registry = loadSkuRegistry()
    const catalogFiles = [
        { file: "kits_unified.json", category: "kits" },
        { file: "panels_unified.json", category: "panels" },
        { file: "inverters_unified.json", category: "inverters" },
        { file: "batteries_unified.json", category: "batteries" },
        { file: "structures_unified.json", category: "structures" },
        { file: "cables_unified.json", category: "cables" },
        { file: "controllers_unified.json", category: "controllers" },
        { file: "ev_chargers_unified.json", category: "chargers" },
        { file: "accessories_unified.json", category: "accessories" },
        { file: "string_boxes_unified.json", category: "stringboxes" },
        { file: "posts_unified.json", category: "posts" },
        { file: "others_unified.json", category: "others" }
    ];

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const { file, category } of catalogFiles) {
        logger.info(`\n📦 Processing ${file}...`);
        const items = readCatalogFile(file);

        if (items.length === 0) {
            logger.warn(`No items found in ${file}`);
            continue;
        }

        logger.info(`Found ${items.length} items in ${file}`);

                const products: any[] = [];

        for (const item of items) {
            try {
                const title = item.name || item.model || `${item.manufacturer || ""} ${item.id || item.sku}`.trim();
                if (!title) continue;

                let description = item.description || "";
                if (category === "kits" && item.potencia_kwp) {
                    description += `\nPotência: ${item.potencia_kwp} kWp`;
                    description += `\nEstrutura: ${item.estrutura || "N/A"}`;
                    description += `\nPainéis: ${item.total_panels || 0}`;
                    description += `\nInversores: ${item.total_inverters || 0}`;
                }
                if (category === "panels") {
                    const specs = item.technical_specs || {};
                    if (specs.power_w) description += `\nPotência: ${specs.power_w}W`;
                    if (specs.efficiency) description += `\nEficiência: ${specs.efficiency}%`;
                    if (specs.technology) description += `\nTecnologia: ${specs.technology}`;
                }

                const price = parsePrice(item.price_brl || item.price || 0);

                const images: { url: string }[] = [];
                if (item.processed_images?.large) {
                    images.push({ url: item.processed_images.large });
                } else if (item.processed_images?.medium) {
                    images.push({ url: item.processed_images.medium });
                } else if (item.image_url) {
                    images.push({ url: item.image_url });
                } else if (item.image) {
                    images.push({ url: item.image });
                }

                const categoryId = categoryMap[category]?.id;

                const product = {
                    title,
                    subtitle: item.manufacturer || "",
                    description: description.trim(),
                    category_ids: categoryId ? [categoryId] : [],
                    status: item.availability === "Disponivel" || !item.availability ? "published" : "draft",
                    images,
                    options: [{
                        title: "Modelo",
                        values: [item.model || item.sku || item.id || "Padrão"]
                    }],
                    variants: [{
                        title: item.model || item.sku || "Padrão",
                        sku: stableSku(item, category, registry),
                        prices: price > 0 ? [{
                            amount: Math.round(price * 100), // Convert to cents
                            currency_code: "brl"
                        }] : [],
                        options: {
                            Modelo: item.model || item.sku || item.id || "Padrão"
                        },
                        weight: item.weight_kg || 1,
                        manage_inventory: false,
                        metadata: {
                            source: item.source || "YSH Catalog",
                            original_id: item.id || item.sku,
                            distributor: item.distributor || item.centro_distribuicao,
                            category: category,
                            price_brl: price,
                            processed_images: item.processed_images || {},
                            ...(category === "kits" && {
                                potencia_kwp: item.potencia_kwp,
                                estrutura: item.estrutura,
                                panels: item.panels,
                                inverters: item.inverters,
                                batteries: item.batteries,
                                total_panels: item.total_panels,
                                total_inverters: item.total_inverters,
                                total_power_w: item.total_power_w,
                            }),
                            ...(category === "panels" && {
                                technical_specs: item.technical_specs,
                                cells: item.cells,
                                dimensions: item.dimensions_mm,
                            }),
                        }
                    }]
                };

                products.push(product);

            } catch (error: any) {
                totalErrors++;
                logger.error(`Error processing item ${item.id}: ${error.message}`);
            }
        }

        // Create products in batches
        const batchSize = 20;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            logger.info(`Creating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)} (${batch.length} products)...`);

            try {
                await createProductsWorkflow(container).run({
                    input: {
                        products: batch
                    }
                });
                totalProcessed += batch.length;
                logger.info(`✓ Created ${batch.length} products`);
            } catch (error: any) {
                totalErrors += batch.length;
                logger.error(`Error creating batch: ${error.message}`);
            }
        }
    }

    logger.info(`\n✅ Catalog seeding completed!`);
    logger.info(`📊 Summary:`);
    logger.info(`   Successfully processed: ${totalProcessed} products`);
    logger.info(`   Errors: ${totalErrors}`);
}
