/**
 * Sincronização e Mapeamento Otimizado de Imagens
 * 
 * Funcionalidades:
 * - ✅ Scan de diretórios de imagens por distribuidor
 * - ✅ Mapeamento automático SKU → Imagens
 * - ✅ Geração de IMAGE_MAP.json otimizado
 * - ✅ Verificação de imagens quebradas
 * - ✅ Suporte a thumbs/medium/large
 * - ✅ Fallback inteligente para imagens faltantes
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

interface ImageMapping {
    sku: string;
    category: string;
    distributor: string;
    images: {
        original?: string;
        thumb?: string;
        medium?: string;
        large?: string;
    };
    hash: string;
    verified: boolean;
}

interface ImageStats {
    totalImages: number;
    mapped: number;
    missing: number;
    duplicates: number;
    byCategory: Record<string, number>;
    byDistributor: Record<string, number>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const IMAGE_CONFIG = {
    BASE_PATH: path.resolve(__dirname, "../../static/images-catálogo_distribuidores"),
    OUTPUT_FILE: "IMAGE_MAP.json",
    SUPPORTED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
    DISTRIBUTORS: [
        "FORTLEV",
        "FOTUS",
        "NEOSOLAR",
        "ODEX",
        "SOLFACIL",
    ],
    CATEGORIES: [
        "ACCESSORIES",
        "BATTERIES",
        "CABLES",
        "CHARGERS",
        "CONTROLLERS",
        "INVERTERS",
        "KITS",
        "KITS-HIBRIDOS",
        "PANELS",
        "POSTS",
        "PUMPS",
        "STATIONS",
        "STRINGBOXES",
        "STRUCTURES",
    ],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extrai SKU do nome do arquivo
 */
function extractSKUFromFilename(filename: string): string | null {
    const name = path.basename(filename, path.extname(filename));

    // Remover prefixos comuns
    const cleaned = name
        .replace(/^(thumb|medium|large|img|image)[-_]/i, "")
        .replace(/[-_](thumb|medium|large|img|image)$/i, "");

    // Normalizar
    return cleaned
        .toUpperCase()
        .replace(/[^A-Z0-9\-]/g, "-")
        .replace(/\-+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/**
 * Detecta tipo de imagem (thumb/medium/large)
 */
function detectImageType(filename: string): "thumb" | "medium" | "large" | "original" {
    const lower = filename.toLowerCase();

    if (lower.includes("thumb") || lower.includes("_t.") || lower.includes("-t.")) {
        return "thumb";
    }
    if (lower.includes("medium") || lower.includes("_m.") || lower.includes("-m.")) {
        return "medium";
    }
    if (lower.includes("large") || lower.includes("_l.") || lower.includes("-l.")) {
        return "large";
    }

    return "original";
}

/**
 * Scan recursivo de diretório
 */
function scanDirectory(dirPath: string, basePath: string): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dirPath)) {
        return results;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            results.push(...scanDirectory(fullPath, basePath));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (IMAGE_CONFIG.SUPPORTED_EXTENSIONS.includes(ext)) {
                // Retornar path relativo
                const relativePath = path.relative(basePath, fullPath).replace(/\\/g, "/");
                results.push(relativePath);
            }
        }
    }

    return results;
}

/**
 * Verifica se arquivo existe e é acessível
 */
function verifyImage(imagePath: string): boolean {
    try {
        const stats = fs.statSync(imagePath);
        return stats.isFile() && stats.size > 0;
    } catch {
        return false;
    }
}

/**
 * Gera hash para detecção de duplicatas
 */
function generateImageHash(imagePath: string): string {
    try {
        const buffer = fs.readFileSync(imagePath);
        return crypto.createHash("md5").update(buffer).digest("hex");
    } catch {
        return "";
    }
}

// ============================================================================
// CORE MAPPING LOGIC
// ============================================================================

/**
 * Processa imagens de um distribuidor/categoria
 */
function processDistributorCategory(
    distributor: string,
    category: string,
    basePath: string,
    mappings: Map<string, ImageMapping>,
    stats: ImageStats
): void {
    const dirName = `${distributor}-${category}`;
    const dirPath = path.join(basePath, dirName);

    if (!fs.existsSync(dirPath)) {
        return;
    }

    console.log(`  📂 Processando: ${dirName}`);

    const images = scanDirectory(dirPath, basePath);
    stats.totalImages += images.length;
    stats.byDistributor[distributor] = (stats.byDistributor[distributor] || 0) + images.length;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + images.length;

    for (const imagePath of images) {
        const sku = extractSKUFromFilename(path.basename(imagePath));

        if (!sku) {
            console.warn(`    ⚠️  SKU não identificado: ${imagePath}`);
            continue;
        }

        const imageType = detectImageType(imagePath);
        const fullPath = path.join(basePath, imagePath);
        const verified = verifyImage(fullPath);

        // Inicializar mapping se não existir
        if (!mappings.has(sku)) {
            mappings.set(sku, {
                sku,
                category: category.toLowerCase(),
                distributor,
                images: {},
                hash: "",
                verified: false,
            });
        }

        const mapping = mappings.get(sku)!;

        // Armazenar imagem por tipo
        const webPath = `/static/images-catálogo_distribuidores/${imagePath}`;

        if (imageType === "original") {
            mapping.images.original = mapping.images.original || webPath;
        } else {
            mapping.images[imageType] = webPath;
        }

        // Fallback: usar original para tipos faltantes
        if (!mapping.images.thumb && !mapping.images.medium && !mapping.images.large) {
            const original = mapping.images.original || webPath;
            mapping.images.thumb = original;
            mapping.images.medium = original;
            mapping.images.large = original;
        }

        mapping.verified = mapping.verified || verified;

        // Gerar hash para detecção de duplicatas
        if (imageType === "original" || imageType === "large") {
            const hash = generateImageHash(fullPath);
            if (hash) {
                mapping.hash = hash;
            }
        }

        stats.mapped++;
    }
}

/**
 * Consolida mappings e detecta duplicatas
 */
function consolidateMappings(
    mappings: Map<string, ImageMapping>,
    stats: ImageStats
): ImageMapping[] {
    const hashMap = new Map<string, string[]>();
    const consolidated: ImageMapping[] = [];

    for (const [sku, mapping] of mappings.entries()) {
        // Detectar duplicatas por hash
        if (mapping.hash) {
            if (!hashMap.has(mapping.hash)) {
                hashMap.set(mapping.hash, []);
            }
            hashMap.get(mapping.hash)!.push(sku);
        }

        consolidated.push(mapping);
    }

    // Contar duplicatas
    for (const skus of hashMap.values()) {
        if (skus.length > 1) {
            stats.duplicates += skus.length - 1;
        }
    }

    // Ordenar por SKU
    return consolidated.sort((a, b) => a.sku.localeCompare(b.sku));
}

/**
 * Gera relatório de imagens faltantes
 */
function generateMissingReport(
    mappings: ImageMapping[],
    catalogPath: string,
    stats: ImageStats
): void {
    const missing: Array<{ sku: string; category: string }> = [];

    for (const mapping of mappings) {
        if (!mapping.verified || !mapping.images.original) {
            missing.push({
                sku: mapping.sku,
                category: mapping.category,
            });
        }
    }

    stats.missing = missing.length;

    if (missing.length > 0) {
        const reportPath = path.join(catalogPath, "IMAGES_MISSING_REPORT.json");
        fs.writeFileSync(
            reportPath,
            JSON.stringify(
                {
                    timestamp: new Date().toISOString(),
                    total: missing.length,
                    items: missing,
                },
                null,
                2
            )
        );
        console.log(`\n📄 Relatório de imagens faltantes: ${reportPath}`);
    }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export default async function syncImageMappings(): Promise<void> {
    console.log("🖼️  Iniciando Sincronização de Mapeamento de Imagens");
    console.log("=".repeat(60));

    const basePath = IMAGE_CONFIG.BASE_PATH;
    const outputPath = path.join(basePath, IMAGE_CONFIG.OUTPUT_FILE);

    if (!fs.existsSync(basePath)) {
        throw new Error(`Diretório de imagens não encontrado: ${basePath}`);
    }

    const mappings = new Map<string, ImageMapping>();
    const stats: ImageStats = {
        totalImages: 0,
        mapped: 0,
        missing: 0,
        duplicates: 0,
        byCategory: {},
        byDistributor: {},
    };

    try {
        // Processar cada combinação distribuidor/categoria
        for (const distributor of IMAGE_CONFIG.DISTRIBUTORS) {
            console.log(`\n📦 Distribuidor: ${distributor}`);

            for (const category of IMAGE_CONFIG.CATEGORIES) {
                processDistributorCategory(
                    distributor,
                    category,
                    basePath,
                    mappings,
                    stats
                );
            }
        }

        // Consolidar mappings
        console.log("\n🔄 Consolidando mappings...");
        const consolidated = consolidateMappings(mappings, stats);

        // Gerar relatório de faltantes
        const catalogPath = path.resolve(__dirname, "../../data/catalog/unified_schemas");
        generateMissingReport(consolidated, catalogPath, stats);

        // Salvar IMAGE_MAP.json
        const imageMap = {
            version: "2.0",
            generated_at: new Date().toISOString(),
            total_skus: consolidated.length,
            total_images: stats.totalImages,
            stats,
            mappings: Object.fromEntries(consolidated.map((m) => [m.sku, m])),
        };

        fs.writeFileSync(outputPath, JSON.stringify(imageMap, null, 2));

        // Relatório final
        console.log("\n" + "=".repeat(60));
        console.log("📊 RELATÓRIO DE SINCRONIZAÇÃO DE IMAGENS");
        console.log("=".repeat(60));
        console.log(`\n✅ Total de Imagens: ${stats.totalImages}`);
        console.log(`🔗 SKUs Mapeados: ${consolidated.length}`);
        console.log(`✅ Imagens Mapeadas: ${stats.mapped}`);
        console.log(`⚠️  Imagens Faltantes: ${stats.missing}`);
        console.log(`🔄 Duplicatas Detectadas: ${stats.duplicates}`);

        console.log("\n📂 Por Categoria:");
        Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([cat, count]) => {
                console.log(`  - ${cat}: ${count} imagens`);
            });

        console.log("\n📦 Por Distribuidor:");
        Object.entries(stats.byDistributor)
            .sort(([, a], [, b]) => b - a)
            .forEach(([dist, count]) => {
                console.log(`  - ${dist}: ${count} imagens`);
            });

        console.log(`\n📄 Mapa salvo em: ${outputPath}`);
        console.log("\n✅ Sincronização de imagens concluída!\n");
    } catch (error: any) {
        console.error("\n❌ ERRO NA SINCRONIZAÇÃO DE IMAGENS");
        console.error(error.message);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    syncImageMappings()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
