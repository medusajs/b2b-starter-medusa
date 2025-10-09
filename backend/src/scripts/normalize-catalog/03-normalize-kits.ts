/**
 * Script 3: Normalize Kits
 * 
 * Normaliza kits solares, decompondo em componentes e
 * mapeando para SKUs unificados.
 * 
 * Entrada: kits_unified.json, skus_unified.json
 * Saída: kits_normalized.json
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { normalizeManufacturerName } from "./01-extract-manufacturers";
import { calculateStringSimilarity } from "./02-generate-skus";

interface KitInput {
    id: string;
    name: string;
    type: string;
    potencia_kwp: number;
    price_brl: number;
    distributor: string;
    panels: Array<{
        brand: string;
        power_w: number;
        quantity: number;
        description: string;
    }>;
    inverters: Array<{
        brand: string;
        power_kw: number;
        quantity: number;
        description: string;
    }>;
    batteries?: Array<{
        brand: string;
        capacity_kwh: number;
        quantity: number;
        description: string;
    }>;
    structures?: any[];
    metadata?: any;
}

interface KitNormalized {
    id: string;                      // KIT-{capacity}KWP-{panel_mfg}-{inverter_mfg}
    name: string;
    category: "grid-tie" | "off-grid" | "hybrid";
    system_capacity_kwp: number;

    // Componentes mapeados para SKUs
    components: KitComponent[];

    // Precificação
    pricing: {
        total_components_price: number;
        kit_price: number;
        discount_amount: number;
        discount_pct: number;
    };

    // Ofertas de distribuidores
    kit_offers: KitOffer[];

    // Características
    installation_types: string[];
    suitable_for: string[];

    // Metadata
    metadata: {
        created_at: string;
        source_kits: string[];
        confidence: number;           // Confiança no mapeamento de componentes
    };
}

interface KitComponent {
    component_type: "panel" | "inverter" | "battery" | "structure" | "cable" | "other";
    sku_id: string | null;          // null se não encontrado
    manufacturer: string;
    model: string;
    quantity: number;
    unit_price: number;
    total_price: number;

    // Dados originais
    original_description: string;
    match_confidence: number;       // 0-1
}

interface KitOffer {
    distributor: string;
    original_kit_id: string;
    kit_price: number;
    available: boolean;

    // Componentes disponíveis
    available_components: number;
    total_components: number;

    // Logística
    warehouse?: string;
    lead_time_days?: number;

    // Benefícios
    includes_structure: boolean;
    includes_cables: boolean;
    includes_installation: boolean;
    includes_project: boolean;

    metadata: {
        last_updated: string;
    };
}

interface SKU {
    id: string;
    manufacturer_name: string;
    model_number: string;
    category: string;
    technical_specs: any;
    distributor_offers: Array<{
        distributor: string;
        price: number;
    }>;
    pricing_summary: {
        avg_price: number;
    };
}

/**
 * Mapeia componente de kit para SKU unificado
 */
function findMatchingSKU(
    component: { brand: string; power_w?: number; power_kw?: number; description: string },
    skus: SKU[],
    category: string
): { sku: SKU | null; confidence: number } {
    const manufacturer = normalizeManufacturerName(component.brand);
    const power = component.power_w || (component.power_kw ? component.power_kw * 1000 : 0);

    // Filtrar SKUs da categoria e fabricante corretos
    const candidateSKUs = skus.filter(
        (sku) =>
            sku.category === category &&
            sku.manufacturer_name === manufacturer
    );

    if (candidateSKUs.length === 0) {
        return { sku: null, confidence: 0 };
    }

    // Buscar melhor match por potência e modelo
    let bestMatch: SKU | null = null;
    let bestScore = 0;

    for (const sku of candidateSKUs) {
        let score = 0;

        // Comparar potência (30 pontos)
        const skuPower = sku.technical_specs?.power_w || sku.technical_specs?.power_kw * 1000 || 0;
        if (skuPower > 0 && power > 0) {
            const powerDiff = Math.abs(skuPower - power);
            const powerDiffPct = powerDiff / power;

            if (powerDiffPct < 0.05) {
                score += 30;
            } else if (powerDiffPct < 0.10) {
                score += 20;
            } else if (powerDiffPct < 0.20) {
                score += 10;
            }
        }

        // Comparar descrição com modelo (70 pontos)
        const descSimilarity = calculateStringSimilarity(
            component.description.toLowerCase(),
            sku.model_number.toLowerCase()
        );
        score += descSimilarity * 70;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = sku;
        }
    }

    const confidence = bestScore / 100;
    return { sku: bestMatch, confidence };
}

/**
 * Determina tipo de kit baseado no nome e componentes
 */
function determineKitCategory(kit: KitInput): "grid-tie" | "off-grid" | "hybrid" {
    const name = kit.name.toLowerCase();
    const type = kit.type?.toLowerCase() || "";

    if (name.includes("hibrido") || type.includes("hibrido") || kit.batteries?.length > 0) {
        return "hybrid";
    }

    if (name.includes("off-grid") || name.includes("offgrid") || type.includes("off")) {
        return "off-grid";
    }

    return "grid-tie";
}

/**
 * Gera ID único para kit normalizado
 */
function generateKitId(kit: KitInput): string {
    const capacity = kit.potencia_kwp.toFixed(1).replace(".", "_");
    const panelMfg = kit.panels[0]?.brand || "UNKNOWN";
    const inverterMfg = kit.inverters[0]?.brand || "UNKNOWN";

    const panelSlug = normalizeManufacturerName(panelMfg)
        .substring(0, 10)
        .replace(/\s+/g, "");
    const inverterSlug = normalizeManufacturerName(inverterMfg)
        .substring(0, 10)
        .replace(/\s+/g, "");

    return `KIT-${capacity}KWP-${panelSlug}-${inverterSlug}`.toUpperCase();
}

async function normalizeKits() {
    console.log("🔧 Normalizando kits solares...\n");

    const dataDir = join(__dirname, "../../../data/catalog/unified_schemas");

    // Carregar dados
    const kitsPath = join(dataDir, "kits_unified.json");
    const skusPath = join(dataDir, "skus_unified.json");

    const kitsRaw: KitInput[] = JSON.parse(readFileSync(kitsPath, "utf-8"));
    const skus: SKU[] = JSON.parse(readFileSync(skusPath, "utf-8"));

    console.log(`📦 Kits a processar: ${kitsRaw.length}`);
    console.log(`🔖 SKUs disponíveis: ${skus.length}\n`);

    const normalizedKitsMap = new Map<string, KitNormalized>();
    const stats = {
        total_kits: 0,
        normalized_kits: 0,
        duplicates_merged: 0,
        components_mapped: 0,
        components_not_found: 0,
        avg_confidence: 0,
    };

    for (const kitRaw of kitsRaw) {
        stats.total_kits++;

        const kitId = generateKitId(kitRaw);
        const category = determineKitCategory(kitRaw);

        // Processar componentes
        const components: KitComponent[] = [];
        let totalConfidence = 0;
        let componentsProcessed = 0;

        // Painéis
        for (const panel of kitRaw.panels || []) {
            componentsProcessed++;
            const { sku, confidence } = findMatchingSKU(panel, skus, "panels");
            totalConfidence += confidence;

            const unitPrice = sku?.pricing_summary?.avg_price || 0;

            components.push({
                component_type: "panel",
                sku_id: sku?.id || null,
                manufacturer: normalizeManufacturerName(panel.brand),
                model: sku?.model_number || panel.description,
                quantity: panel.quantity,
                unit_price: unitPrice,
                total_price: unitPrice * panel.quantity,
                original_description: panel.description,
                match_confidence: confidence,
            });

            if (sku) {
                stats.components_mapped++;
            } else {
                stats.components_not_found++;
                console.log(`   ⚠️  SKU não encontrado para painel: ${panel.brand} ${panel.description}`);
            }
        }

        // Inversores
        for (const inverter of kitRaw.inverters || []) {
            componentsProcessed++;
            const { sku, confidence } = findMatchingSKU(inverter, skus, "inverters");
            totalConfidence += confidence;

            const unitPrice = sku?.pricing_summary?.avg_price || 0;

            components.push({
                component_type: "inverter",
                sku_id: sku?.id || null,
                manufacturer: normalizeManufacturerName(inverter.brand),
                model: sku?.model_number || inverter.description,
                quantity: inverter.quantity,
                unit_price: unitPrice,
                total_price: unitPrice * inverter.quantity,
                original_description: inverter.description,
                match_confidence: confidence,
            });

            if (sku) {
                stats.components_mapped++;
            } else {
                stats.components_not_found++;
                console.log(`   ⚠️  SKU não encontrado para inversor: ${inverter.brand} ${inverter.description}`);
            }
        }

        // Baterias (se existirem)
        for (const battery of kitRaw.batteries || []) {
            componentsProcessed++;
            const { sku, confidence } = findMatchingSKU(
                { ...battery, power_w: 0 },
                skus,
                "batteries"
            );
            totalConfidence += confidence;

            const unitPrice = sku?.pricing_summary?.avg_price || 0;

            components.push({
                component_type: "battery",
                sku_id: sku?.id || null,
                manufacturer: normalizeManufacturerName(battery.brand),
                model: sku?.model_number || battery.description,
                quantity: battery.quantity,
                unit_price: unitPrice,
                total_price: unitPrice * battery.quantity,
                original_description: battery.description,
                match_confidence: confidence,
            });

            if (sku) {
                stats.components_mapped++;
            } else {
                stats.components_not_found++;
            }
        }

        const avgConfidence = componentsProcessed > 0 ? totalConfidence / componentsProcessed : 0;

        // Calcular precificação
        const totalComponentsPrice = components.reduce((sum, c) => sum + c.total_price, 0);
        const kitPrice = kitRaw.price_brl || 0;
        const discount = totalComponentsPrice > 0 ? totalComponentsPrice - kitPrice : 0;
        const discountPct = totalComponentsPrice > 0 ? (discount / totalComponentsPrice) * 100 : 0;

        // Criar oferta do distribuidor
        const offer: KitOffer = {
            distributor: kitRaw.distributor || "UNKNOWN",
            original_kit_id: kitRaw.id,
            kit_price: kitPrice,
            available: kitRaw.metadata?.availability !== false,
            available_components: components.filter(c => c.sku_id !== null).length,
            total_components: components.length,
            warehouse: kitRaw.metadata?.warehouse,
            includes_structure: (kitRaw.structures?.length || 0) > 0,
            includes_cables: false,
            includes_installation: false,
            includes_project: false,
            metadata: {
                last_updated: new Date().toISOString(),
            },
        };

        // Verificar se já existe kit normalizado similar
        if (normalizedKitsMap.has(kitId)) {
            // Mesclar ofertas
            const existingKit = normalizedKitsMap.get(kitId)!;
            existingKit.kit_offers.push(offer);
            existingKit.metadata.source_kits.push(kitRaw.id);
            stats.duplicates_merged++;
        } else {
            // Criar novo kit normalizado
            const normalizedKit: KitNormalized = {
                id: kitId,
                name: `Kit ${kitRaw.potencia_kwp.toFixed(1)}kWp - ${components[0]?.manufacturer || "Solar"}`,
                category,
                system_capacity_kwp: kitRaw.potencia_kwp,
                components,
                pricing: {
                    total_components_price: totalComponentsPrice,
                    kit_price: kitPrice,
                    discount_amount: discount,
                    discount_pct: discountPct,
                },
                kit_offers: [offer],
                installation_types: kitRaw.metadata?.installation_types || [],
                suitable_for: category === "grid-tie" ? ["Residencial", "Comercial"] : ["Residencial"],
                metadata: {
                    created_at: new Date().toISOString(),
                    source_kits: [kitRaw.id],
                    confidence: avgConfidence,
                },
            };

            normalizedKitsMap.set(kitId, normalizedKit);
            stats.normalized_kits++;
        }
    }

    const normalizedKits = Array.from(normalizedKitsMap.values());

    // Calcular confiança média
    stats.avg_confidence =
        normalizedKits.reduce((sum, k) => sum + k.metadata.confidence, 0) / normalizedKits.length;

    console.log("\n📊 ESTATÍSTICAS:\n");
    console.log(`   Total de kits processados: ${stats.total_kits}`);
    console.log(`   Kits normalizados únicos: ${stats.normalized_kits}`);
    console.log(`   Kits duplicados mesclados: ${stats.duplicates_merged}`);
    console.log(`   Componentes mapeados para SKUs: ${stats.components_mapped}`);
    console.log(`   Componentes não encontrados: ${stats.components_not_found}`);
    console.log(`   Taxa de mapeamento: ${((stats.components_mapped / (stats.components_mapped + stats.components_not_found)) * 100).toFixed(1)}%`);
    console.log(`   Confiança média de mapeamento: ${(stats.avg_confidence * 100).toFixed(1)}%`);

    // Análise de ofertas
    const offersPerKit = normalizedKits.map(k => k.kit_offers.length);
    const avgOffers = offersPerKit.reduce((sum, n) => sum + n, 0) / normalizedKits.length;
    const maxOffers = Math.max(...offersPerKit);

    console.log("\n📈 ANÁLISE DE OFERTAS:\n");
    console.log(`   Média de ofertas por kit: ${avgOffers.toFixed(2)}`);
    console.log(`   Máximo de ofertas em um kit: ${maxOffers}`);

    // Salvar resultado
    const outputPath = join(dataDir, "kits_normalized.json");
    writeFileSync(outputPath, JSON.stringify(normalizedKits, null, 2));

    console.log(`\n💾 Resultado salvo em: ${outputPath}`);
    console.log("✅ Normalização de kits concluída!\n");

    return normalizedKits;
}

// Executar se chamado diretamente
if (require.main === module) {
    normalizeKits().catch(console.error);
}

export { normalizeKits, findMatchingSKU, generateKitId };
