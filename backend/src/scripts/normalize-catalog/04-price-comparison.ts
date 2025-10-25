/**
 * Script 4: Price Comparison Analysis
 * 
 * Analisa preços entre distribuidores e gera relatórios de competitividade.
 * 
 * Entrada: skus_unified.json
 * Saída: price_comparison_report.json
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { formatPriceBRL, calculateMedian, calculateStdDeviation } from "./utils";

interface SKU {
    id: string;
    manufacturer_name: string;
    model_number: string;
    category: string;
    distributor_offers: DistributorOffer[];
    pricing_summary: {
        lowest_price: number;
        highest_price: number;
        avg_price: number;
        median_price: number;
        price_variation_pct: number;
    };
}

interface DistributorOffer {
    distributor: string;
    price: number;
    available: boolean;
    quantity: number;
}

interface PriceComparisonReport {
    timestamp: string;
    summary: {
        total_skus: number;
        skus_with_multiple_offers: number;
        avg_offers_per_sku: number;
        avg_price_variation_pct: number;
    };
    distributors: DistributorAnalysis[];
    categories: CategoryPriceAnalysis[];
    competitive_insights: CompetitiveInsight[];
    recommendations: string[];
}

interface DistributorAnalysis {
    distributor: string;
    total_products: number;
    avg_price_competitiveness: number;  // % em relação à média do mercado
    times_cheapest: number;
    times_most_expensive: number;
    price_position_score: number;       // 0-100 (100 = sempre mais barato)
    categories_covered: string[];
}

interface CategoryPriceAnalysis {
    category: string;
    total_skus: number;
    avg_price: number;
    median_price: number;
    price_range: {
        min: number;
        max: number;
    };
    price_std_deviation: number;
    most_competitive_distributor: string;
}

interface CompetitiveInsight {
    type: "opportunity" | "threat" | "trend";
    severity: "low" | "medium" | "high";
    message: string;
    affected_skus?: string[];
    data?: any;
}

/**
 * Analisa competitividade de preços por distribuidor
 */
function analyzeDistributorCompetitiveness(skus: SKU[]): DistributorAnalysis[] {
    const distributorStats = new Map<string, {
        products: number;
        total_price_diff_pct: number;
        cheapest_count: number;
        most_expensive_count: number;
        categories: Set<string>;
    }>();

    // Inicializar stats para cada distribuidor
    const allDistributors = new Set<string>();
    skus.forEach(sku => {
        sku.distributor_offers.forEach(offer => {
            allDistributors.add(offer.distributor);
        });
    });

    allDistributors.forEach(dist => {
        distributorStats.set(dist, {
            products: 0,
            total_price_diff_pct: 0,
            cheapest_count: 0,
            most_expensive_count: 0,
            categories: new Set(),
        });
    });

    // Analisar cada SKU
    skus.forEach(sku => {
        if (sku.distributor_offers.length < 2) return;

        const avgPrice = sku.pricing_summary.avg_price;
        if (avgPrice === 0) return;

        sku.distributor_offers.forEach(offer => {
            if (offer.price === 0) return;

            const stats = distributorStats.get(offer.distributor)!;
            stats.products++;
            stats.categories.add(sku.category);

            // Calcular diferença percentual vs. média
            const priceDiffPct = ((offer.price - avgPrice) / avgPrice) * 100;
            stats.total_price_diff_pct += priceDiffPct;

            // Verificar se é o mais barato ou mais caro
            if (offer.price === sku.pricing_summary.lowest_price) {
                stats.cheapest_count++;
            }
            if (offer.price === sku.pricing_summary.highest_price) {
                stats.most_expensive_count++;
            }
        });
    });

    // Calcular scores
    return Array.from(distributorStats.entries()).map(([distributor, stats]) => {
        const avgCompetitiveness = stats.products > 0
            ? stats.total_price_diff_pct / stats.products
            : 0;

        // Score: quanto menor o preço relativo e mais vezes é o mais barato, maior o score
        const priceScore = Math.max(0, 100 - Math.abs(avgCompetitiveness));
        const cheapestBonus = (stats.cheapest_count / Math.max(stats.products, 1)) * 50;
        const expensivePenalty = (stats.most_expensive_count / Math.max(stats.products, 1)) * 30;

        const positionScore = Math.max(0, Math.min(100, priceScore + cheapestBonus - expensivePenalty));

        return {
            distributor,
            total_products: stats.products,
            avg_price_competitiveness: avgCompetitiveness,
            times_cheapest: stats.cheapest_count,
            times_most_expensive: stats.most_expensive_count,
            price_position_score: Math.round(positionScore * 10) / 10,
            categories_covered: Array.from(stats.categories),
        };
    }).sort((a, b) => b.price_position_score - a.price_position_score);
}

/**
 * Analisa preços por categoria
 */
function analyzeCategoryPricing(skus: SKU[]): CategoryPriceAnalysis[] {
    const categoryMap = new Map<string, SKU[]>();

    skus.forEach(sku => {
        if (!categoryMap.has(sku.category)) {
            categoryMap.set(sku.category, []);
        }
        categoryMap.get(sku.category)!.push(sku);
    });

    return Array.from(categoryMap.entries()).map(([category, categorySKUs]) => {
        const prices = categorySKUs
            .map(sku => sku.pricing_summary.avg_price)
            .filter(p => p > 0);

        const avgPrice = prices.length > 0
            ? prices.reduce((sum, p) => sum + p, 0) / prices.length
            : 0;

        const medianPrice = calculateMedian(prices);
        const stdDev = calculateStdDeviation(prices);

        // Encontrar distribuidor mais competitivo nesta categoria
        const distributorScores = new Map<string, number[]>();
        categorySKUs.forEach(sku => {
            sku.distributor_offers.forEach(offer => {
                if (!distributorScores.has(offer.distributor)) {
                    distributorScores.set(offer.distributor, []);
                }
                if (offer.price > 0 && sku.pricing_summary.avg_price > 0) {
                    const relativePrice = offer.price / sku.pricing_summary.avg_price;
                    distributorScores.get(offer.distributor)!.push(relativePrice);
                }
            });
        });

        let mostCompetitive = "N/A";
        let bestScore = Infinity;
        distributorScores.forEach((scores, dist) => {
            const avgRelative = scores.reduce((sum, s) => sum + s, 0) / scores.length;
            if (avgRelative < bestScore) {
                bestScore = avgRelative;
                mostCompetitive = dist;
            }
        });

        return {
            category,
            total_skus: categorySKUs.length,
            avg_price: Math.round(avgPrice * 100) / 100,
            median_price: Math.round(medianPrice * 100) / 100,
            price_range: {
                min: Math.min(...prices),
                max: Math.max(...prices),
            },
            price_std_deviation: Math.round(stdDev * 100) / 100,
            most_competitive_distributor: mostCompetitive,
        };
    }).sort((a, b) => b.avg_price - a.avg_price);
}

/**
 * Gera insights competitivos
 */
function generateCompetitiveInsights(
    skus: SKU[],
    distributors: DistributorAnalysis[]
): CompetitiveInsight[] {
    const insights: CompetitiveInsight[] = [];

    // 1. SKUs com alta variação de preço (oportunidade de arbitragem)
    const highVariationSKUs = skus
        .filter(sku => sku.pricing_summary.price_variation_pct > 20)
        .sort((a, b) => b.pricing_summary.price_variation_pct - a.pricing_summary.price_variation_pct)
        .slice(0, 10);

    if (highVariationSKUs.length > 0) {
        insights.push({
            type: "opportunity",
            severity: "high",
            message: `${highVariationSKUs.length} SKUs com variação de preço >20% entre distribuidores`,
            affected_skus: highVariationSKUs.map(s => s.id),
            data: {
                avg_variation: (highVariationSKUs.reduce((sum, s) => sum + s.pricing_summary.price_variation_pct, 0) / highVariationSKUs.length).toFixed(1) + "%",
                potential_savings: "Compradores podem economizar significativamente escolhendo melhor distribuidor",
            },
        });
    }

    // 2. Distribuidor dominante (mais vezes mais barato)
    const topDist = distributors[0];
    if (topDist && topDist.times_cheapest > 20) {
        insights.push({
            type: "trend",
            severity: "medium",
            message: `${topDist.distributor} é o mais competitivo, sendo o mais barato em ${topDist.times_cheapest} produtos`,
            data: {
                price_position_score: topDist.price_position_score,
                avg_competitiveness: topDist.avg_price_competitiveness.toFixed(2) + "%",
            },
        });
    }

    // 3. Distribuidor com preços consistentemente altos
    const expensiveDist = distributors.find(d => d.avg_price_competitiveness > 10);
    if (expensiveDist) {
        insights.push({
            type: "threat",
            severity: "medium",
            message: `${expensiveDist.distributor} tem preços em média ${expensiveDist.avg_price_competitiveness.toFixed(1)}% acima da média`,
            data: {
                times_most_expensive: expensiveDist.times_most_expensive,
                recommendation: "Considerar negociação ou buscar alternativas",
            },
        });
    }

    // 4. SKUs com oferta única (sem competição)
    const singleOfferSKUs = skus.filter(sku => sku.distributor_offers.length === 1);
    if (singleOfferSKUs.length > 0) {
        insights.push({
            type: "opportunity",
            severity: "low",
            message: `${singleOfferSKUs.length} SKUs disponíveis em apenas 1 distribuidor (oportunidade de expansão)`,
            data: {
                percentage: ((singleOfferSKUs.length / skus.length) * 100).toFixed(1) + "%",
            },
        });
    }

    return insights;
}

/**
 * Gera recomendações baseadas na análise
 */
function generateRecommendations(
    distributors: DistributorAnalysis[],
    categories: CategoryPriceAnalysis[],
    insights: CompetitiveInsight[],
    totalSKUs: number,
    multiOfferSKUs: number
): string[] {
    const recommendations: string[] = [];

    // Recomendações baseadas em distribuidores
    const topDist = distributors[0];
    if (topDist) {
        recommendations.push(
            `✅ Priorizar ${topDist.distributor} para compras gerais (score: ${topDist.price_position_score}/100)`
        );
    }

    // Recomendações por categoria
    categories.slice(0, 3).forEach(cat => {
        recommendations.push(
            `📦 ${cat.category}: Melhor preço com ${cat.most_competitive_distributor} (média: ${formatPriceBRL(cat.avg_price)})`
        );
    });

    // Recomendações baseadas em insights
    const highVariationInsight = insights.find(i => i.message.includes("variação de preço >20%"));
    if (highVariationInsight) {
        recommendations.push(
            `💡 Implementar comparador de preços para ${highVariationInsight.affected_skus?.length || 0} produtos com alta variação`
        );
    }

    const singleOfferInsight = insights.find(i => i.message.includes("apenas 1 distribuidor"));
    if (singleOfferInsight) {
        recommendations.push(
            `🔍 Buscar distribuidores alternativos para aumentar competitividade em produtos de oferta única`
        );
    }

    // Recomendações de sistema
    const multiOfferPercentage = totalSKUs > 0 ? (multiOfferSKUs / totalSKUs) * 100 : 0;
    if (multiOfferPercentage < 30) {
        recommendations.push(
            `⚠️  Apenas ${multiOfferPercentage.toFixed(0)}% dos SKUs têm múltiplas ofertas - expandir base de distribuidores`
        );
    } else {
        recommendations.push(
            `✅ ${multiOfferPercentage.toFixed(0)}% dos SKUs com múltiplas ofertas - boa cobertura de mercado`
        );
    }

    return recommendations;
}

async function analyzePrices() {
    console.log("💰 Analisando preços e competitividade...\n");

    const dataDir = join(__dirname, "../../../data/catalog/unified_schemas");
    const skusPath = join(dataDir, "skus_unified.json");

    const skus: SKU[] = JSON.parse(readFileSync(skusPath, "utf-8"));

    console.log(`📊 SKUs carregados: ${skus.length}\n`);

    // Filtrar apenas SKUs com ofertas
    const skusWithOffers = skus.filter(sku => sku.distributor_offers.length > 0);
    const skusWithMultipleOffers = skus.filter(sku => sku.distributor_offers.length > 1);

    console.log(`   SKUs com ofertas: ${skusWithOffers.length}`);
    console.log(`   SKUs com múltiplas ofertas: ${skusWithMultipleOffers.length}\n`);

    // Análises
    console.log("🔍 Analisando distribuidores...");
    const distributors = analyzeDistributorCompetitiveness(skus);

    console.log("📦 Analisando categorias...");
    const categories = analyzeCategoryPricing(skus);

    console.log("💡 Gerando insights...");
    const insights = generateCompetitiveInsights(skus, distributors);

    console.log("📝 Gerando recomendações...\n");
    const recommendations = generateRecommendations(distributors, categories, insights, skus.length, skusWithMultipleOffers.length);

    // Calcular sumário
    const totalOffers = skus.reduce((sum, sku) => sum + sku.distributor_offers.length, 0);
    const avgOffers = totalOffers / skus.length;
    const avgVariation = skusWithOffers.length > 0
        ? skusWithOffers.reduce((sum, sku) => sum + sku.pricing_summary.price_variation_pct, 0) / skusWithOffers.length
        : 0;

    const report: PriceComparisonReport = {
        timestamp: new Date().toISOString(),
        summary: {
            total_skus: skus.length,
            skus_with_multiple_offers: skusWithMultipleOffers.length,
            avg_offers_per_sku: Math.round(avgOffers * 100) / 100,
            avg_price_variation_pct: Math.round(avgVariation * 100) / 100,
        },
        distributors,
        categories,
        competitive_insights: insights,
        recommendations,
    };

    // Exibir resultados
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  ANÁLISE DE COMPETITIVIDADE DE PREÇOS");
    console.log("═══════════════════════════════════════════════════════════\n");

    console.log("📊 SUMÁRIO:\n");
    console.log(`   Total de SKUs: ${report.summary.total_skus}`);
    console.log(`   SKUs com múltiplas ofertas: ${report.summary.skus_with_multiple_offers} (${((report.summary.skus_with_multiple_offers / report.summary.total_skus) * 100).toFixed(1)}%)`);
    console.log(`   Média de ofertas/SKU: ${report.summary.avg_offers_per_sku}`);
    console.log(`   Variação média de preços: ${report.summary.avg_price_variation_pct.toFixed(1)}%\n`);

    console.log("🏆 RANKING DE DISTRIBUIDORES (por competitividade):\n");
    distributors.slice(0, 5).forEach((dist, idx) => {
        const scoreBar = "█".repeat(Math.round(dist.price_position_score / 10));
        console.log(
            `${String(idx + 1).padStart(2, " ")}. ${dist.distributor.padEnd(15, " ")} ` +
            `Score: ${dist.price_position_score.toString().padStart(5, " ")}/100 ${scoreBar}`
        );
        console.log(
            `    Produtos: ${dist.total_products} | ` +
            `Mais barato: ${dist.times_cheapest}x | ` +
            `Preço vs. média: ${dist.avg_price_competitiveness >= 0 ? "+" : ""}${dist.avg_price_competitiveness.toFixed(1)}%`
        );
        console.log();
    });

    console.log("📦 PREÇOS POR CATEGORIA (TOP 5):\n");
    categories.slice(0, 5).forEach(cat => {
        console.log(`   ${cat.category.padEnd(15, " ")} - Média: ${formatPriceBRL(cat.avg_price).padEnd(15, " ")} (${cat.total_skus} SKUs)`);
        console.log(`      Mais competitivo: ${cat.most_competitive_distributor}`);
    });

    console.log("\n💡 INSIGHTS COMPETITIVOS:\n");
    insights.forEach((insight, idx) => {
        const icon = insight.severity === "high" ? "🔴" : insight.severity === "medium" ? "🟡" : "🟢";
        const typeIcon = insight.type === "opportunity" ? "💰" : insight.type === "threat" ? "⚠️" : "📈";
        console.log(`${icon} ${typeIcon} ${insight.message}`);
    });

    console.log("\n📝 RECOMENDAÇÕES:\n");
    recommendations.forEach(rec => {
        console.log(`   ${rec}`);
    });

    // Salvar relatório
    const outputPath = join(dataDir, "price_comparison_report.json");
    writeFileSync(outputPath, JSON.stringify(report, null, 2));

    console.log(`\n💾 Relatório salvo em: ${outputPath}`);
    console.log("✅ Análise de preços concluída!\n");

    return report;
}

// Executar se chamado diretamente
if (require.main === module) {
    analyzePrices().catch(console.error);
}

export { analyzePrices };
