/**
 * Script 2: Generate Unique SKUs
 * 
 * Gera SKUs únicos para todos os produtos do catálogo,
 * realizando deduplicação baseada em fabricante, modelo e specs.
 * 
 * Entrada: unified_schemas/*.json, manufacturers.json
 * Saída: skus_unified.json
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { normalizeManufacturerName } from "./01-extract-manufacturers";

interface ProductInput {
    id: string;
    name: string;
    manufacturer?: string;
    brand?: string;
    model?: string;
    category: string;
    technical_specs?: any;
    price_brl?: number;
    metadata?: any;
}

interface SKU {
    id: string;                      // SKU único gerado
    manufacturer_id: string;
    manufacturer_name: string;
    model_number: string;
    category: string;
    subcategory?: string;

    // Especificações normalizadas
    technical_specs: Record<string, any>;

    // Variantes
    variant?: {
        voltage?: string;
        power?: string;
        color?: string;
    };

    // Ofertas de distribuidores
    distributor_offers: DistributorOffer[];

    // Agregados
    total_stock: number;
    available_at_distributors: number;
    pricing_summary: {
        lowest_price: number;
        highest_price: number;
        avg_price: number;
        median_price: number;
        price_variation_pct: number;
    };

    // Metadata
    metadata: {
        created_at: string;
        source_products: string[];     // IDs dos produtos originais
        deduplication_confidence: number;  // 0-1
    };
}

interface DistributorOffer {
    distributor: string;
    original_product_id: string;
    price: number;
    available: boolean;
    quantity: number;
    warehouse?: string;
    product_url?: string;
    image_urls?: string[];
    last_updated: string;
}

interface DeduplicationResult {
    is_duplicate: boolean;
    confidence: number;           // 0-1
    matching_sku_id?: string;
    reasons: string[];
}

/**
 * Gera um SKU único baseado em fabricante, série e modelo
 */
function generateSKU(
    manufacturer: string,
    modelNumber: string,
    category: string,
    variant?: { voltage?: string; power?: string }
): string {
    const mfgSlug = sanitizeForSKU(manufacturer);
    const modelSlug = sanitizeForSKU(modelNumber);
    const catPrefix = category.substring(0, 3).toUpperCase();

    let sku = `${mfgSlug}-${catPrefix}-${modelSlug}`;

    if (variant?.voltage) {
        sku += `-${variant.voltage}V`;
    }
    if (variant?.power) {
        sku += `-${variant.power}W`;
    }

    return sku.toUpperCase();
}

function sanitizeForSKU(input: string): string {
    return input
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 20);
}

/**
 * Extrai número de modelo do nome do produto
 */
function extractModelNumber(product: ProductInput): string {
    // 1. Verificar campo model
    if (product.model) {
        return product.model;
    }

    // 2. Extrair do nome usando regex
    const name = product.name;

    // Padrão: SUN-M2250G4-EU-Q0
    const pattern1 = /([A-Z0-9-]+\d+[A-Z0-9-]*)/i;
    const match1 = name.match(pattern1);
    if (match1) return match1[1];

    // Padrão: "570W", "2250W"
    const pattern2 = /(\d+W)/i;
    const match2 = name.match(pattern2);
    if (match2) return match2[1];

    // Fallback: primeiras palavras
    return name.split(" ").slice(0, 3).join("-");
}

/**
 * Verifica se dois produtos são o mesmo (deduplicação)
 */
function checkDuplication(
    product: ProductInput,
    existingSKU: SKU
): DeduplicationResult {
    const reasons: string[] = [];
    let score = 0;

    // 1. Fabricante deve ser idêntico
    const productMfg = normalizeManufacturerName(product.manufacturer || product.brand || "");
    if (productMfg !== existingSKU.manufacturer_name) {
        return { is_duplicate: false, confidence: 0, reasons: ["Fabricante diferente"] };
    }
    score += 30;
    reasons.push("Mesmo fabricante");

    // 2. Modelo deve ser similar (fuzzy match)
    const productModel = extractModelNumber(product);
    const similarity = calculateStringSimilarity(productModel, existingSKU.model_number);
    if (similarity > 0.9) {
        score += 30;
        reasons.push(`Modelo similar (${(similarity * 100).toFixed(0)}%)`);
    } else if (similarity > 0.7) {
        score += 15;
        reasons.push(`Modelo parcialmente similar (${(similarity * 100).toFixed(0)}%)`);
    } else {
        return { is_duplicate: false, confidence: score / 100, reasons };
    }

    // 3. Especificações técnicas críticas devem coincidir
    const specs1 = product.technical_specs || {};
    const specs2 = existingSKU.technical_specs || {};

    const criticalSpecs = ["power_w", "voltage_v", "power_kw", "efficiency"];
    let specsMatched = 0;
    let specsCompared = 0;

    for (const spec of criticalSpecs) {
        if (specs1[spec] !== undefined && specs2[spec] !== undefined) {
            specsCompared++;
            const diff = Math.abs(specs1[spec] - specs2[spec]);
            const avg = (specs1[spec] + specs2[spec]) / 2;
            const diffPct = diff / avg;

            if (diffPct < 0.05) {  // Tolerância de 5%
                specsMatched++;
                reasons.push(`Spec ${spec} coincide (${specs1[spec]} ≈ ${specs2[spec]})`);
            }
        }
    }

    if (specsCompared > 0) {
        score += (specsMatched / specsCompared) * 40;
    }

    const confidence = score / 100;
    const is_duplicate = confidence >= 0.85;

    return {
        is_duplicate,
        confidence,
        matching_sku_id: is_duplicate ? existingSKU.id : undefined,
        reasons,
    };
}

/**
 * Calcula similaridade entre duas strings (Levenshtein simplificado)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;

    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;

    const distance = levenshteinDistance(s1, s2);
    return 1 - distance / maxLen;
}

function levenshteinDistance(s1: string, s2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
            if (s2[i - 1] === s1[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[s2.length][s1.length];
}

/**
 * Calcula pricing summary de um SKU
 */
function calculatePricingSummary(offers: DistributorOffer[]) {
    const prices = offers
        .filter(o => o.price > 0)
        .map(o => o.price)
        .sort((a, b) => a - b);

    if (prices.length === 0) {
        return {
            lowest_price: 0,
            highest_price: 0,
            avg_price: 0,
            median_price: 0,
            price_variation_pct: 0,
        };
    }

    const lowest = prices[0];
    const highest = prices[prices.length - 1];
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const median = prices[Math.floor(prices.length / 2)];
    const variation = highest > 0 ? ((highest - lowest) / lowest) * 100 : 0;

    return {
        lowest_price: lowest,
        highest_price: highest,
        avg_price: avg,
        median_price: median,
        price_variation_pct: variation,
    };
}

async function generateSKUs() {
    console.log("🔧 Gerando SKUs únicos para o catálogo...\n");

    const dataDir = join(__dirname, "../../../data/catalog/unified_schemas");
    const categories = [
        "panels",
        "inverters",
        "batteries",
        "controllers",
        "cables",
        "structures",
        "accessories",
        "stringboxes",
        "posts",
        "ev_chargers",
    ];

    const skusMap = new Map<string, SKU>();
    const stats = {
        total_products: 0,
        skus_created: 0,
        duplicates_merged: 0,
        no_manufacturer: 0,
    };

    for (const category of categories) {
        const filePath = join(dataDir, `${category}_unified.json`);

        try {
            const data = JSON.parse(readFileSync(filePath, "utf-8"));
            const products: ProductInput[] = Array.isArray(data) ? data : [];

            console.log(`📂 Processando ${category}: ${products.length} produtos`);

            for (const product of products) {
                stats.total_products++;

                // Extrair fabricante
                const manufacturerRaw = product.manufacturer || product.brand || "";
                if (!manufacturerRaw) {
                    stats.no_manufacturer++;
                    continue;
                }

                const manufacturer = normalizeManufacturerName(manufacturerRaw);
                const modelNumber = extractModelNumber(product);

                // Extrair variante
                const variant = {
                    voltage: product.technical_specs?.voltage_v?.toString(),
                    power: product.technical_specs?.power_w?.toString(),
                };

                // Verificar deduplicação
                let matchedSKU: SKU | undefined;
                for (const existingSKU of skusMap.values()) {
                    const dedupResult = checkDuplication(product, existingSKU);
                    if (dedupResult.is_duplicate) {
                        matchedSKU = existingSKU;
                        stats.duplicates_merged++;
                        console.log(`   ✓ Duplicata encontrada: ${product.id} -> ${existingSKU.id} (${(dedupResult.confidence * 100).toFixed(0)}%)`);
                        break;
                    }
                }

                if (matchedSKU) {
                    // Adicionar como oferta ao SKU existente
                    const offer: DistributorOffer = {
                        distributor: product.metadata?.distributor || "UNKNOWN",
                        original_product_id: product.id,
                        price: product.price_brl || 0,
                        available: product.metadata?.availability !== false,
                        quantity: 0,
                        warehouse: product.metadata?.warehouse,
                        product_url: product.metadata?.product_url,
                        image_urls: product.metadata?.image_urls || [],
                        last_updated: new Date().toISOString(),
                    };

                    matchedSKU.distributor_offers.push(offer);
                    matchedSKU.available_at_distributors = new Set(
                        matchedSKU.distributor_offers.map(o => o.distributor)
                    ).size;
                    matchedSKU.pricing_summary = calculatePricingSummary(matchedSKU.distributor_offers);
                    matchedSKU.metadata.source_products.push(product.id);
                } else {
                    // Criar novo SKU
                    const skuId = generateSKU(manufacturer, modelNumber, category, variant);

                    const offer: DistributorOffer = {
                        distributor: product.metadata?.distributor || "UNKNOWN",
                        original_product_id: product.id,
                        price: product.price_brl || 0,
                        available: product.metadata?.availability !== false,
                        quantity: 0,
                        warehouse: product.metadata?.warehouse,
                        product_url: product.metadata?.product_url,
                        image_urls: product.metadata?.image_urls || [],
                        last_updated: new Date().toISOString(),
                    };

                    const sku: SKU = {
                        id: skuId,
                        manufacturer_id: manufacturer.toLowerCase().replace(/\s+/g, "-"),
                        manufacturer_name: manufacturer,
                        model_number: modelNumber,
                        category: category,
                        technical_specs: product.technical_specs || {},
                        distributor_offers: [offer],
                        total_stock: 0,
                        available_at_distributors: 1,
                        pricing_summary: calculatePricingSummary([offer]),
                        metadata: {
                            created_at: new Date().toISOString(),
                            source_products: [product.id],
                            deduplication_confidence: 1.0,
                        },
                    };

                    skusMap.set(skuId, sku);
                    stats.skus_created++;
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao processar ${category}:`, error);
        }
    }

    console.log("\n📊 ESTATÍSTICAS:\n");
    console.log(`   Total de produtos processados: ${stats.total_products}`);
    console.log(`   SKUs únicos criados: ${stats.skus_created}`);
    console.log(`   Duplicatas mescladas: ${stats.duplicates_merged}`);
    console.log(`   Produtos sem fabricante: ${stats.no_manufacturer}`);
    console.log(`   Taxa de deduplicação: ${((stats.duplicates_merged / stats.total_products) * 100).toFixed(1)}%`);

    // Análise de ofertas por SKU
    const skus = Array.from(skusMap.values());
    const offersPerSKU = skus.map(s => s.distributor_offers.length);
    const avgOffers = offersPerSKU.reduce((sum, n) => sum + n, 0) / skus.length;
    const maxOffers = Math.max(...offersPerSKU);

    console.log("\n📈 ANÁLISE DE OFERTAS:\n");
    console.log(`   Média de ofertas por SKU: ${avgOffers.toFixed(2)}`);
    console.log(`   Máximo de ofertas em um SKU: ${maxOffers}`);

    const multiOfferSKUs = skus.filter(s => s.distributor_offers.length > 1);
    console.log(`   SKUs com múltiplas ofertas: ${multiOfferSKUs.length} (${((multiOfferSKUs.length / skus.length) * 100).toFixed(1)}%)`);

    // TOP SKUs com mais ofertas
    const topSKUs = [...skus]
        .sort((a, b) => b.distributor_offers.length - a.distributor_offers.length)
        .slice(0, 10);

    console.log("\n🏆 TOP 10 SKUs COM MAIS OFERTAS:\n");
    topSKUs.forEach((sku, idx) => {
        console.log(
            `${String(idx + 1).padStart(2, " ")}. ${sku.id.substring(0, 40).padEnd(40, " ")} - ${sku.distributor_offers.length} ofertas`
        );
    });

    // Salvar resultado
    const outputPath = join(dataDir, "skus_unified.json");
    writeFileSync(outputPath, JSON.stringify(skus, null, 2));

    console.log(`\n💾 Resultado salvo em: ${outputPath}`);
    console.log("✅ Geração de SKUs concluída!\n");

    return skus;
}

// Executar se chamado diretamente
if (require.main === module) {
    generateSKUs().catch(console.error);
}

export { generateSKUs, generateSKU, checkDuplication };
