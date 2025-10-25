import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { UNIFIED_CATALOG_MODULE } from "../modules/unified-catalog";
import * as fs from "fs";
import * as path from "path";

/**
 * Script de seed para migrar dados normalizados ao banco
 * 
 * Importa:
 * - manufacturers.json → Manufacturer table
 * - skus_unified.json → SKU + DistributorOffer tables
 * - kits_normalized.json → Kit table
 * 
 * Uso: yarn seed:catalog
 */

const CATALOG_PATH = path.resolve(
    __dirname,
    "../../data/catalog/unified_schemas"
);

interface ManufacturerData {
    id: string;
    name: string;
    slug: string;
    tier?: string;
    country?: string;
    product_count: number;
    aliases?: string[];
}

interface DistributorOfferData {
    distributor: string;
    price: number;
    stock?: number;
    source_id: string;
}

interface SKUData {
    sku: string;
    manufacturer_id: string;
    model_number: string;
    category: string;
    name?: string;
    description?: string;
    technical_specs: any;
    distributor_offers: DistributorOfferData[];
    pricing_summary: {
        lowest_price: number;
        highest_price: number;
        average_price: number;
        median_price: number;
        price_variation_pct: number;
    };
    compatibility_tags?: string[];
    image_urls?: string[];
    datasheet_url?: string;
    certification_labels?: string[];
    warranty_years?: number;
}

interface KitData {
    id: string;
    name: string;
    category: string;
    system_capacity_kwp: number;
    components: Array<{
        type: string;
        sku_id: string | null;
        manufacturer?: string;
        quantity: number;
        unit_price?: number;
        total_price?: number;
        confidence: number;
    }>;
    pricing?: {
        total_components_price: number;
        kit_price: number;
        discount_amount: number;
        discount_pct: number;
    };
    kit_offers?: Array<{
        distributor: string;
        price: number;
        stock?: number;
    }>;
}

async function seedManufacturers(catalogService: any) {
    console.log("\n📦 Seeding Manufacturers...");

    const filePath = path.join(CATALOG_PATH, "manufacturers.json");

    if (!fs.existsSync(filePath)) {
        console.log("❌ manufacturers.json não encontrado");
        return [];
    }

    const data: ManufacturerData[] = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const manufacturers = [];

    for (const mfr of data) {
        try {
            const created = await catalogService.createManufacturers({
                name: mfr.name,
                slug: mfr.slug,
                tier: mfr.tier || "UNKNOWN",
                country: mfr.country || null,
                product_count: mfr.product_count,
                aliases: mfr.aliases || [],
                metadata: { source_id: mfr.id },
            });

            manufacturers.push(created);
            console.log(`  ✅ ${mfr.name} (${mfr.tier || "UNKNOWN"})`);
        } catch (error: any) {
            console.error(`  ❌ Erro ao criar ${mfr.name}:`, error.message);
        }
    }

    console.log(`\n✅ ${manufacturers.length} fabricantes criados`);
    return manufacturers;
}

async function seedSKUs(catalogService: any) {
    console.log("\n📦 Seeding SKUs...");

    const filePath = path.join(CATALOG_PATH, "skus_unified.json");

    if (!fs.existsSync(filePath)) {
        console.log("❌ skus_unified.json não encontrado");
        return [];
    }

    const data: SKUData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const skus = [];
    const offers = [];

    for (const skuData of data) {
        try {
            // Criar SKU
            const sku = await catalogService.createSKUs({
                sku_code: skuData.sku,
                manufacturer_id: skuData.manufacturer_id,
                model_number: skuData.model_number,
                category: skuData.category,
                name: skuData.name || `${skuData.manufacturer_id} ${skuData.model_number}`,
                description: skuData.description || null,
                technical_specs: skuData.technical_specs,
                compatibility_tags: skuData.compatibility_tags || [],
                lowest_price: skuData.pricing_summary?.lowest_price || null,
                highest_price: skuData.pricing_summary?.highest_price || null,
                average_price: skuData.pricing_summary?.average_price || null,
                median_price: skuData.pricing_summary?.median_price || null,
                price_variation_pct: skuData.pricing_summary?.price_variation_pct || null,
                total_offers: skuData.distributor_offers?.length || 0,
                image_urls: skuData.image_urls || [],
                datasheet_url: skuData.datasheet_url || null,
                certification_labels: skuData.certification_labels || [],
                warranty_years: skuData.warranty_years || null,
                is_active: true,
            });

            skus.push(sku);

            // Criar ofertas de distribuidores
            if (skuData.distributor_offers && skuData.distributor_offers.length > 0) {
                for (const offerData of skuData.distributor_offers) {
                    try {
                        const offer = await catalogService.createDistributorOffers({
                            sku_id: sku.id,
                            distributor_name: offerData.distributor,
                            price: offerData.price,
                            stock_quantity: offerData.stock || null,
                            stock_status:
                                offerData.stock && offerData.stock > 0
                                    ? "in_stock"
                                    : "unknown",
                            source_id: offerData.source_id,
                            last_updated_at: new Date(),
                            conditions: "Novo",
                        });

                        offers.push(offer);
                    } catch (error: any) {
                        console.error(
                            `  ⚠️  Erro ao criar oferta para ${skuData.sku}:`,
                            error.message
                        );
                    }
                }
            }

            if (skus.length % 50 === 0) {
                console.log(`  📊 ${skus.length} SKUs processados...`);
            }
        } catch (error: any) {
            console.error(`  ❌ Erro ao criar SKU ${skuData.sku}:`, error.message);
        }
    }

    console.log(`\n✅ ${skus.length} SKUs criados`);
    console.log(`✅ ${offers.length} ofertas de distribuidores criadas`);

    return skus;
}

async function seedKits(catalogService: any) {
    console.log("\n📦 Seeding Kits...");

    const filePath = path.join(CATALOG_PATH, "kits_normalized.json");

    if (!fs.existsSync(filePath)) {
        console.log("❌ kits_normalized.json não encontrado");
        return [];
    }

    const data: KitData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const kits = [];

    for (const kitData of data) {
        try {
            // Calcular mapping confidence médio
            const mappedComponents = kitData.components.filter((c) => c.sku_id);
            const avgConfidence =
                mappedComponents.length > 0
                    ? mappedComponents.reduce((sum, c) => sum + c.confidence, 0) /
                    mappedComponents.length
                    : 0;

            const kit = await catalogService.createKits({
                kit_code: kitData.id,
                name: kitData.name,
                category: kitData.category,
                system_capacity_kwp: kitData.system_capacity_kwp,
                components: kitData.components,
                total_components_price:
                    kitData.pricing?.total_components_price || null,
                kit_price: kitData.pricing?.kit_price || null,
                discount_amount: kitData.pricing?.discount_amount || null,
                discount_pct: kitData.pricing?.discount_pct || null,
                kit_offers: kitData.kit_offers || [],
                mapping_confidence_avg: avgConfidence,
                is_active: true,
            });

            kits.push(kit);
            console.log(
                `  ✅ ${kitData.name} (${kitData.system_capacity_kwp}kWp, ${mappedComponents.length}/${kitData.components.length} componentes)`
            );
        } catch (error: any) {
            console.error(`  ❌ Erro ao criar kit ${kitData.id}:`, error.message);
        }
    }

    console.log(`\n✅ ${kits.length} kits criados`);
    return kits;
}

export default async function seedUnifiedCatalog({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    logger.info("� Iniciando seed do Catálogo Unificado...\n");

    const catalogService = container.resolve(UNIFIED_CATALOG_MODULE);

    if (!catalogService) {
        throw new Error(
            `Módulo ${UNIFIED_CATALOG_MODULE} não encontrado. Verifique medusa-config.ts`
        );
    }

    // 1. Seed Manufacturers
    await seedManufacturers(catalogService);

    // 2. Seed SKUs + DistributorOffers
    await seedSKUs(catalogService);

    // 3. Seed Kits
    await seedKits(catalogService);

    logger.info("\n✅ Seed do Catálogo Unificado concluído com sucesso!");
    logger.info("\n📊 Resumo:");
    logger.info("  - Manufacturers: Criados");
    logger.info("  - SKUs: Criados");
    logger.info("  - DistributorOffers: Criados");
    logger.info("  - Kits: Criados");
    logger.info("\n🎯 Próximos passos:");
    logger.info("  1. Testar APIs: GET /store/catalog/skus");
    logger.info("  2. Implementar componente <PriceComparison />");
    logger.info("  3. Integrar com Hélio (copiloto solar)");
}
