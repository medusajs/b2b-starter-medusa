/**
 * Script Principal: Normalize Unified Catalog
 * 
 * Orquestra o processo completo de normalização do catálogo:
 * 1. Extrai fabricantes únicos
 * 2. Gera SKUs únicos com deduplicação
 * 3. Normaliza kits em componentes
 * 4. Gera relatórios de análise
 * 
 * Uso:
 *   yarn normalize:catalog              # Processo completo
 *   yarn normalize:catalog --step=1     # Apenas fabricantes
 *   yarn normalize:catalog --step=2     # Apenas SKUs
 *   yarn normalize:catalog --step=3     # Apenas kits
 */

import { extractManufacturers } from "./01-extract-manufacturers";
import { generateSKUs } from "./02-generate-skus";
import { normalizeKits } from "./03-normalize-kits";
import { analyzePrices } from "./04-price-comparison";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface NormalizationReport {
    timestamp: string;
    steps_completed: string[];

    manufacturers: {
        total: number;
        tier_1: number;
        tier_2: number;
        tier_3: number;
        unknown: number;
    };

    skus: {
        total: number;
        duplicates_merged: number;
        deduplication_rate_pct: number;
        avg_offers_per_sku: number;
        multi_offer_skus: number;
    };

    kits: {
        total: number;
        normalized: number;
        components_mapped: number;
        components_not_found: number;
        mapping_rate_pct: number;
        avg_confidence_pct: number;
    };

    overall: {
        total_products_input: number;
        total_skus_output: number;
        reduction_pct: number;
    };
}

async function runNormalizationPipeline(stepFilter?: number) {
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║     NORMALIZAÇÃO DE CATÁLOGO UNIFICADO - YSH SOLAR       ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    const startTime = Date.now();
    const report: Partial<NormalizationReport> = {
        timestamp: new Date().toISOString(),
        steps_completed: [],
    };

    try {
        // Step 1: Extrair Fabricantes
        if (!stepFilter || stepFilter === 1) {
            console.log("═══════════════════════════════════════════════════════════");
            console.log("  STEP 1: EXTRAÇÃO DE FABRICANTES ÚNICOS");
            console.log("═══════════════════════════════════════════════════════════\n");

            const manufacturers = await extractManufacturers();
            report.steps_completed!.push("manufacturers");

            report.manufacturers = {
                total: manufacturers.length,
                tier_1: manufacturers.filter(m => m.tier === "TIER_1").length,
                tier_2: manufacturers.filter(m => m.tier === "TIER_2").length,
                tier_3: manufacturers.filter(m => m.tier === "TIER_3").length,
                unknown: manufacturers.filter(m => !m.tier).length,
            };

            console.log("\n");
        }

        // Step 2: Gerar SKUs Únicos
        if (!stepFilter || stepFilter === 2) {
            console.log("═══════════════════════════════════════════════════════════");
            console.log("  STEP 2: GERAÇÃO DE SKUs ÚNICOS");
            console.log("═══════════════════════════════════════════════════════════\n");

            const skus = await generateSKUs();
            report.steps_completed!.push("skus");

            const multiOfferSKUs = skus.filter(s => s.distributor_offers.length > 1);
            const totalOffers = skus.reduce((sum, s) => sum + s.distributor_offers.length, 0);

            report.skus = {
                total: skus.length,
                duplicates_merged: 0, // Será calculado pelo script
                deduplication_rate_pct: 0,
                avg_offers_per_sku: totalOffers / skus.length,
                multi_offer_skus: multiOfferSKUs.length,
            };

            console.log("\n");
        }

        // Step 3: Normalizar Kits
        if (!stepFilter || stepFilter === 3) {
            console.log("═══════════════════════════════════════════════════════════");
            console.log("  STEP 3: NORMALIZAÇÃO DE KITS SOLARES");
            console.log("═══════════════════════════════════════════════════════════\n");

            const kits = await normalizeKits();
            report.steps_completed!.push("kits");

            const totalComponents = kits.reduce(
                (sum, k) => sum + k.components.length,
                0
            );
            const mappedComponents = kits.reduce(
                (sum, k) => sum + k.components.filter(c => c.sku_id !== null).length,
                0
            );
            const avgConfidence =
                kits.reduce((sum, k) => sum + k.metadata.confidence, 0) / kits.length;

            report.kits = {
                total: kits.reduce((sum, k) => sum + k.kit_offers.length, 0),
                normalized: kits.length,
                components_mapped: mappedComponents,
                components_not_found: totalComponents - mappedComponents,
                mapping_rate_pct: (mappedComponents / totalComponents) * 100,
                avg_confidence_pct: avgConfidence * 100,
            };

            console.log("\n");
        }

        // Step 4: Análise de Preços
        if (!stepFilter || stepFilter === 4) {
            console.log("═══════════════════════════════════════════════════════════");
            console.log("  STEP 4: ANÁLISE DE COMPETITIVIDADE DE PREÇOS");
            console.log("═══════════════════════════════════════════════════════════\n");

            await analyzePrices();
            report.steps_completed!.push("price-analysis");

            console.log("\n");
        }        // Calcular métricas gerais
        const dataDir = join(__dirname, "../../../data/catalog/unified_schemas");
        const masterIndex = JSON.parse(
            readFileSync(join(dataDir, "MASTER_INDEX.json"), "utf-8")
        );

        const skusFile = join(dataDir, "skus_unified.json");
        let totalSKUs = 0;
        try {
            const skus = JSON.parse(readFileSync(skusFile, "utf-8"));
            totalSKUs = skus.length;
        } catch (error) {
            // SKUs ainda não gerados
        }

        report.overall = {
            total_products_input: masterIndex.total_products,
            total_skus_output: totalSKUs,
            reduction_pct:
                totalSKUs > 0
                    ? ((masterIndex.total_products - totalSKUs) / masterIndex.total_products) * 100
                    : 0,
        };

        // Salvar relatório
        const reportPath = join(dataDir, "NORMALIZATION_REPORT.json");
        writeFileSync(reportPath, JSON.stringify(report, null, 2));

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // Exibir resumo final
        console.log("═══════════════════════════════════════════════════════════");
        console.log("  RESUMO DA NORMALIZAÇÃO");
        console.log("═══════════════════════════════════════════════════════════\n");

        if (report.manufacturers) {
            console.log("📦 FABRICANTES:");
            console.log(`   Total: ${report.manufacturers.total}`);
            console.log(`   TIER 1: ${report.manufacturers.tier_1}`);
            console.log(`   TIER 2: ${report.manufacturers.tier_2}`);
            console.log(`   TIER 3: ${report.manufacturers.tier_3}`);
            console.log(`   Desconhecido: ${report.manufacturers.unknown}\n`);
        }

        if (report.skus) {
            console.log("🔖 SKUs:");
            console.log(`   Total de SKUs únicos: ${report.skus.total}`);
            console.log(`   Média de ofertas/SKU: ${report.skus.avg_offers_per_sku.toFixed(2)}`);
            console.log(`   SKUs com múltiplas ofertas: ${report.skus.multi_offer_skus}\n`);
        }

        if (report.kits) {
            console.log("📦 KITS:");
            console.log(`   Kits normalizados: ${report.kits.normalized}`);
            console.log(`   Componentes mapeados: ${report.kits.components_mapped}/${report.kits.components_mapped + report.kits.components_not_found}`);
            console.log(`   Taxa de mapeamento: ${report.kits.mapping_rate_pct.toFixed(1)}%`);
            console.log(`   Confiança média: ${report.kits.avg_confidence_pct.toFixed(1)}%\n`);
        }

        if (report.overall) {
            console.log("🎯 GERAL:");
            console.log(`   Produtos de entrada: ${report.overall.total_products_input}`);
            console.log(`   SKUs de saída: ${report.overall.total_skus_output}`);
            console.log(`   Redução: ${report.overall.reduction_pct.toFixed(1)}%\n`);
        }

        console.log(`⏱️  Tempo de execução: ${duration}s`);
        console.log(`💾 Relatório salvo em: ${reportPath}\n`);

        console.log("╔═══════════════════════════════════════════════════════════╗");
        console.log("║              ✅ NORMALIZAÇÃO CONCLUÍDA!                   ║");
        console.log("╚═══════════════════════════════════════════════════════════╝\n");

        return report;
    } catch (error) {
        console.error("❌ ERRO DURANTE NORMALIZAÇÃO:", error);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const stepArg = args.find(arg => arg.startsWith("--step="));
    const step = stepArg ? parseInt(stepArg.split("=")[1]) : undefined;

    runNormalizationPipeline(step).catch(error => {
        console.error(error);
        process.exit(1);
    });
}

export { runNormalizationPipeline };
