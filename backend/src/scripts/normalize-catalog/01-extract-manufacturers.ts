/**
 * Script 1: Extract Unique Manufacturers
 * 
 * Extrai fabricantes únicos dos dados consolidados e cria
 * registros normalizados de fabricantes.
 * 
 * Entrada: unified_schemas/*.json
 * Saída: manufacturers.json
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface ManufacturerData {
    id: string;
    name: string;
    normalized_name: string;
    aliases: string[];
    product_count: number;
    categories: Set<string>;
    tier?: "TIER_1" | "TIER_2" | "TIER_3";
    country?: string;
}

// Mapeamento manual de fabricantes conhecidos (pode ser expandido)
const MANUFACTURER_METADATA: Record<string, Partial<ManufacturerData>> = {
    "DEYE": { tier: "TIER_1", country: "China" },
    "CANADIAN SOLAR": { tier: "TIER_1", country: "Canada" },
    "CANADIAN": { tier: "TIER_1", country: "Canada" },
    "ASTRONERGY": { tier: "TIER_1", country: "China" },
    "JINKO": { tier: "TIER_1", country: "China" },
    "JINKO SOLAR": { tier: "TIER_1", country: "China" },
    "TRINA SOLAR": { tier: "TIER_1", country: "China" },
    "JA SOLAR": { tier: "TIER_1", country: "China" },
    "LONGI": { tier: "TIER_1", country: "China" },
    "GOODWE": { tier: "TIER_1", country: "China" },
    "GROWATT": { tier: "TIER_1", country: "China" },
    "FRONIUS": { tier: "TIER_1", country: "Austria" },
    "SMA": { tier: "TIER_1", country: "Germany" },
    "HOYMILES": { tier: "TIER_2", country: "China" },
    "APSystems": { tier: "TIER_2", country: "China" },
    "TSUNESS": { tier: "TIER_2", country: "China" },
    "SOFAR": { tier: "TIER_2", country: "China" },
    "SUNGROW": { tier: "TIER_1", country: "China" },
};

// Aliases conhecidos (variações de nomes)
const MANUFACTURER_ALIASES: Record<string, string[]> = {
    "CANADIAN SOLAR": ["CANADIAN", "CANADIAN-SOLAR", "CS"],
    "JINKO SOLAR": ["JINKO", "JINKOSOLAR"],
    "TRINA SOLAR": ["TRINA", "TRINASOLAR"],
    "JA SOLAR": ["JA", "JASOLAR"],
    "GOODWE": ["GOOD-WE", "GOOD WE"],
    "APSystems": ["AP SYSTEMS", "APSYSTEMS"],
};

function normalizeManufacturerName(name: string): string {
    if (!name) return "UNKNOWN";

    // Remove espaços extras, converte para uppercase
    let normalized = name.trim().toUpperCase();

    // Remove caracteres especiais
    normalized = normalized.replace(/[^\w\s-]/g, "");

    // Normaliza espaços
    normalized = normalized.replace(/\s+/g, " ");

    // Verifica aliases
    for (const [canonical, aliases] of Object.entries(MANUFACTURER_ALIASES)) {
        if (aliases.some(alias => normalized.includes(alias.toUpperCase()))) {
            return canonical;
        }
    }

    return normalized;
}

function generateManufacturerId(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);
}

async function extractManufacturers() {
    console.log("🔍 Extraindo fabricantes únicos do catálogo...\n");

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
        "others"
    ];

    // Mapa de fabricantes: nome normalizado -> dados
    const manufacturersMap = new Map<string, ManufacturerData>();

    let totalProducts = 0;

    for (const category of categories) {
        const filePath = join(dataDir, `${category}_unified.json`);

        try {
            const data = JSON.parse(readFileSync(filePath, "utf-8"));
            const products = Array.isArray(data) ? data : [];

            console.log(`📂 Processando ${category}: ${products.length} produtos`);

            for (const product of products) {
                totalProducts++;

                // Extrair manufacturer (diferentes campos possíveis)
                const manufacturerRaw =
                    product.manufacturer ||
                    product.brand ||
                    product.panels?.[0]?.brand ||
                    product.inverters?.[0]?.brand ||
                    "UNKNOWN";

                const normalized = normalizeManufacturerName(manufacturerRaw);

                // Criar ou atualizar entrada do fabricante
                if (!manufacturersMap.has(normalized)) {
                    const id = generateManufacturerId(normalized);
                    const metadata = MANUFACTURER_METADATA[normalized] || {};

                    manufacturersMap.set(normalized, {
                        id,
                        name: normalized,
                        normalized_name: normalized,
                        aliases: [manufacturerRaw],
                        product_count: 0,
                        categories: new Set([category]),
                        ...metadata,
                    });
                }

                const mfg = manufacturersMap.get(normalized)!;
                mfg.product_count++;
                mfg.categories.add(category);

                // Adicionar alias se diferente
                if (!mfg.aliases.includes(manufacturerRaw)) {
                    mfg.aliases.push(manufacturerRaw);
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao processar ${category}:`, error);
        }
    }

    console.log(`\n✅ Total de produtos processados: ${totalProducts}`);
    console.log(`✅ Fabricantes únicos encontrados: ${manufacturersMap.size}\n`);

    // Converter para array e ordenar por produto count
    const manufacturers = Array.from(manufacturersMap.values())
        .map(mfg => ({
            ...mfg,
            categories: Array.from(mfg.categories),
        }))
        .sort((a, b) => b.product_count - a.product_count);

    // Estatísticas
    console.log("📊 TOP 15 FABRICANTES:\n");
    manufacturers.slice(0, 15).forEach((mfg, idx) => {
        const tierBadge = mfg.tier ? `[${mfg.tier}]` : "[---]";
        console.log(
            `${String(idx + 1).padStart(2, " ")}. ${tierBadge} ${mfg.name.padEnd(25, " ")} - ${mfg.product_count} produtos`
        );
    });

    // Fabricantes sem tier (precisam classificação manual)
    const needsTier = manufacturers.filter(m => !m.tier);
    if (needsTier.length > 0) {
        console.log(`\n⚠️  ${needsTier.length} fabricantes sem classificação TIER:`);
        needsTier.slice(0, 10).forEach(m => {
            console.log(`   - ${m.name} (${m.product_count} produtos)`);
        });
    }

    // Estatísticas por TIER
    const tier1Count = manufacturers.filter(m => m.tier === "TIER_1").length;
    const tier2Count = manufacturers.filter(m => m.tier === "TIER_2").length;
    const tier3Count = manufacturers.filter(m => m.tier === "TIER_3").length;
    const unknownCount = manufacturers.filter(m => !m.tier).length;

    console.log("\n📈 DISTRIBUIÇÃO POR TIER:");
    console.log(`   TIER 1: ${tier1Count} fabricantes`);
    console.log(`   TIER 2: ${tier2Count} fabricantes`);
    console.log(`   TIER 3: ${tier3Count} fabricantes`);
    console.log(`   Desconhecido: ${unknownCount} fabricantes`);

    // Salvar resultado
    const outputPath = join(dataDir, "manufacturers.json");
    writeFileSync(outputPath, JSON.stringify(manufacturers, null, 2));

    console.log(`\n💾 Resultado salvo em: ${outputPath}`);
    console.log("✅ Extração de fabricantes concluída!\n");

    return manufacturers;
}

// Executar se chamado diretamente
if (require.main === module) {
    extractManufacturers().catch(console.error);
}

export { extractManufacturers, normalizeManufacturerName, generateManufacturerId };
