/**
 * Script de Teste de Importação de Produtos Enrichados
 * 
 * Este script testa a lógica de carregamento, filtragem e transformação
 * dos produtos enrichados SEM executar a importação real no Medusa.
 * 
 * Objetivo: Validar que o script import-enriched-to-medusa.ts está
 * funcionando corretamente antes de integrar com o backend real.
 */

import * as fs from 'fs';
import * as path from 'path';

// Tipos do enriched product (copiados do import script)
interface PriceAnalysis {
    best_price: number;
    worst_price: number;
    average_price: number;
    median_price: number;
    price_variance: number;
    distributors_count: number;
    best_distributor: string;
    price_range_pct: number;
    price_recommendation: string;
}

interface WarrantyInfo {
    years: number;
    coverage_type?: string;
    details?: string;
}

interface CertificationInfo {
    name: string;
    issuer?: string;
    valid_until?: string;
}

interface KPIMetrics {
    efficiency?: number;
    degradation_rate?: number;
    temperature_coefficient?: number;
    payback_period?: number;
}

interface EnrichedProduct {
    id: string;
    title: string;
    sku: string | null;
    manufacturer: string;
    category: string;
    images: string[];
    technical_specs: Record<string, any>;
    overall_score: number;
    value_score: number;
    quality_score: number;
    reliability_score: number;
    price_analysis: PriceAnalysis;
    warranty?: WarrantyInfo;
    certifications: any;
    kpis?: KPIMetrics;
    metadata: {
        description?: string;
        availability?: string;
        source?: string;
        power?: string;
    };
}

interface ImportConfig {
    minOverallScore?: number;
    minValueScore?: number;
    categories?: string[];
    priceFilter?: string[];
    requireCertification?: boolean;
    trackInventory?: boolean;
    allowBackorders?: boolean;
    defaultStock?: number;
    batchSize?: number;
}

const DEFAULT_CONFIG: Required<ImportConfig> = {
    minOverallScore: 60,
    minValueScore: 50,
    categories: ['panels', 'inverters', 'structures', 'water_pumps'],
    priceFilter: ['excellent_deal', 'good_price', 'average'],
    requireCertification: false,
    trackInventory: true,
    allowBackorders: false,
    defaultStock: 10,
    batchSize: 20
};

class ImportTester {
    private products: EnrichedProduct[] = [];
    private config: Required<ImportConfig>;

    constructor(config: Partial<ImportConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Carrega produtos do arquivo JSON
     */
    loadProducts(filePath: string): void {
        console.log('📂 Carregando produtos enrichados...');

        if (!fs.existsSync(filePath)) {
            throw new Error(`Arquivo não encontrado: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Suportar ambos formatos: array direto ou objeto com enriched_products
        this.products = Array.isArray(data) ? data : (data.enriched_products || []);

        console.log(`✅ ${this.products.length} produtos carregados`);
    }

    /**
     * Aplica filtros de importação
     */
    filterProducts(): EnrichedProduct[] {
        console.log('\n🔍 Aplicando filtros de importação...');
        console.log(`Configuração:`);
        console.log(`  - Score mínimo: ${this.config.minOverallScore}`);
        console.log(`  - Value score mínimo: ${this.config.minValueScore}`);
        console.log(`  - Categorias: ${this.config.categories.join(', ')}`);
        console.log(`  - Preços: ${this.config.priceFilter.join(', ')}`);
        console.log(`  - Requer certificação: ${this.config.requireCertification}`);

        const filtered = this.products.filter(product => {
            // Score filters
            if (product.overall_score < this.config.minOverallScore) {
                return false;
            }
            if (product.value_score < this.config.minValueScore) {
                return false;
            }

            // Category filter
            if (this.config.categories.length > 0 &&
                !this.config.categories.includes(product.category)) {
                return false;
            }

            // Price filter
            if (this.config.priceFilter.length > 0 &&
                !this.config.priceFilter.includes(product.price_analysis.price_recommendation)) {
                return false;
            }

            // Certification filter
            if (this.config.requireCertification) {
                const hasCert = product.certifications.ce_marking ||
                    product.certifications.inmetro ||
                    product.certifications.tuv_certified ||
                    product.certifications.ul_listed;
                if (!hasCert) return false;
            }

            return true;
        });

        console.log(`✅ ${filtered.length} produtos passaram nos filtros (${((filtered.length / this.products.length) * 100).toFixed(1)}%)`);

        return filtered;
    }

    /**
     * Analisa estatísticas dos produtos filtrados
     */
    analyzeProducts(products: EnrichedProduct[]): void {
        console.log('\n📊 ESTATÍSTICAS DOS PRODUTOS FILTRADOS\n');

        // Por distribuidor
        const byDistributor: Record<string, number> = {};
        products.forEach(p => {
            const dist = p.price_analysis.best_distributor;
            byDistributor[dist] = (byDistributor[dist] || 0) + 1;
        });
        console.log('Por Distribuidor:');
        Object.entries(byDistributor)
            .sort((a, b) => b[1] - a[1])
            .forEach(([dist, count]) => {
                console.log(`  ${dist}: ${count} produtos (${((count / products.length) * 100).toFixed(1)}%)`);
            });

        // Por categoria
        const byCategory: Record<string, number> = {};
        products.forEach(p => {
            byCategory[p.category] = (byCategory[p.category] || 0) + 1;
        });
        console.log('\nPor Categoria:');
        Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .forEach(([cat, count]) => {
                console.log(`  ${cat}: ${count} produtos (${((count / products.length) * 100).toFixed(1)}%)`);
            });

        // Por manufacturer
        const byManufacturer: Record<string, number> = {};
        products.forEach(p => {
            byManufacturer[p.manufacturer] = (byManufacturer[p.manufacturer] || 0) + 1;
        });
        console.log('\nTop 10 Manufacturers:');
        Object.entries(byManufacturer)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([mfr, count]) => {
                console.log(`  ${mfr}: ${count} produtos`);
            });

        // Scores
        const avgOverall = products.reduce((sum, p) => sum + p.overall_score, 0) / products.length;
        const avgValue = products.reduce((sum, p) => sum + p.value_score, 0) / products.length;
        const avgQuality = products.reduce((sum, p) => sum + p.quality_score, 0) / products.length;
        const avgReliability = products.reduce((sum, p) => sum + p.reliability_score, 0) / products.length;

        console.log('\nScores Médios:');
        console.log(`  Overall: ${avgOverall.toFixed(1)}/100`);
        console.log(`  Value: ${avgValue.toFixed(1)}/100`);
        console.log(`  Quality: ${avgQuality.toFixed(1)}/100`);
        console.log(`  Reliability: ${avgReliability.toFixed(1)}/100`);

        // Preços
        const avgPrice = products.reduce((sum, p) => sum + p.price_analysis.best_price, 0) / products.length;
        const minPrice = Math.min(...products.map(p => p.price_analysis.best_price));
        const maxPrice = Math.max(...products.map(p => p.price_analysis.best_price));

        console.log('\nFaixa de Preços:');
        console.log(`  Mínimo: R$ ${minPrice.toFixed(2)}`);
        console.log(`  Máximo: R$ ${maxPrice.toFixed(2)}`);
        console.log(`  Médio: R$ ${avgPrice.toFixed(2)}`);

        // Certificações
        const certCount: Record<string, number> = {};
        products.forEach(p => {
            const certs = p.certifications;
            if (certs.ce_marking) certCount['CE'] = (certCount['CE'] || 0) + 1;
            if (certs.inmetro) certCount['INMETRO'] = (certCount['INMETRO'] || 0) + 1;
            if (certs.tuv_certified) certCount['TÜV'] = (certCount['TÜV'] || 0) + 1;
            if (certs.ul_listed) certCount['UL'] = (certCount['UL'] || 0) + 1;
            if (certs.iso_9001) certCount['ISO 9001'] = (certCount['ISO 9001'] || 0) + 1;
        });
        console.log('\nCertificações:');
        Object.entries(certCount)
            .sort((a, b) => b[1] - a[1])
            .forEach(([cert, count]) => {
                console.log(`  ${cert}: ${count} produtos (${((count / products.length) * 100).toFixed(1)}%)`);
            });

        // Price recommendations
        const priceRec: Record<string, number> = {};
        products.forEach(p => {
            const rec = p.price_analysis.price_recommendation;
            priceRec[rec] = (priceRec[rec] || 0) + 1;
        });
        console.log('\nRecomendações de Preço:');
        Object.entries(priceRec)
            .sort((a, b) => b[1] - a[1])
            .forEach(([rec, count]) => {
                console.log(`  ${rec}: ${count} produtos (${((count / products.length) * 100).toFixed(1)}%)`);
            });
    }

    /**
     * Mostra top 10 produtos
     */
    showTopProducts(products: EnrichedProduct[]): void {
        console.log('\n🏆 TOP 10 PRODUTOS (por Overall Score)\n');

        const top10 = [...products]
            .sort((a, b) => b.overall_score - a.overall_score)
            .slice(0, 10);

        top10.forEach((product, index) => {
            console.log(`${index + 1}. ${product.title}`);
            console.log(`   Manufacturer: ${product.manufacturer} | Distributor: ${product.price_analysis.best_distributor}`);
            console.log(`   Scores: Overall=${product.overall_score} | Value=${product.value_score} | Quality=${product.quality_score}`);
            console.log(`   Preço: R$ ${product.price_analysis.best_price.toFixed(2)} | Recomendação: ${product.price_analysis.price_recommendation}`);
            const certNames = [];
            if (product.certifications.ce_marking) certNames.push('CE');
            if (product.certifications.inmetro) certNames.push('INMETRO');
            if (product.certifications.tuv_certified) certNames.push('TÜV');
            console.log(`   Certificações: ${certNames.join(', ') || 'Nenhuma'}`);
            console.log('');
        });
    }

    /**
     * Simula criação de categorias
     */
    simulateCategories(products: EnrichedProduct[]): void {
        console.log('\n📁 CATEGORIAS A SEREM CRIADAS NO MEDUSA\n');

        const categories = new Set(products.map(p => p.category));

        const CATEGORY_MAPPING: Record<string, { name: string; handle: string; description: string }> = {
            'panels': {
                name: 'Painéis Solares',
                handle: 'paineis-solares',
                description: 'Módulos fotovoltaicos para geração de energia solar'
            },
            'inverters': {
                name: 'Inversores',
                handle: 'inversores',
                description: 'Inversores para sistemas de energia solar'
            },
            'structures': {
                name: 'Estruturas de Fixação',
                handle: 'estruturas-fixacao',
                description: 'Estruturas para montagem de painéis solares'
            },
            'water_pumps': {
                name: 'Bombas d\'Água Solares',
                handle: 'bombas-agua-solares',
                description: 'Bombas d\'água alimentadas por energia solar'
            },
            'batteries': {
                name: 'Baterias',
                handle: 'baterias',
                description: 'Baterias para armazenamento de energia'
            },
            'kits': {
                name: 'Kits Completos',
                handle: 'kits-completos',
                description: 'Kits solares completos para instalação'
            }
        };

        categories.forEach(cat => {
            const mapped = CATEGORY_MAPPING[cat];
            if (mapped) {
                console.log(`✅ ${mapped.name} (${cat})`);
                console.log(`   Handle: ${mapped.handle}`);
                console.log(`   Descrição: ${mapped.description}`);
                console.log('');
            } else {
                console.log(`⚠️  Categoria não mapeada: ${cat}`);
            }
        });
    }

    /**
     * Simula criação de tags
     */
    simulateTags(products: EnrichedProduct[]): void {
        console.log('\n🏷️  TAGS A SEREM CRIADAS NO MEDUSA\n');

        const tags = new Set<string>();

        products.forEach(product => {
            // Manufacturer
            tags.add(`manufacturer:${product.manufacturer.toLowerCase().replace(/\s+/g, '-')}`);

            // Distributor
            tags.add(`distributor:${product.price_analysis.best_distributor.toLowerCase().replace(/\s+/g, '-')}`);

            // Certifications
            if (product.certifications.ce_marking) tags.add('cert:ce');
            if (product.certifications.inmetro) tags.add('cert:inmetro');
            if (product.certifications.tuv_certified) tags.add('cert:tuv');
            if (product.certifications.ul_listed) tags.add('cert:ul');
            if (product.certifications.iso_9001) tags.add('cert:iso-9001');

            // Price recommendation
            tags.add(`price:${product.price_analysis.price_recommendation.toLowerCase().replace(/\s+/g, '-')}`);

            // Quality badge
            if (product.overall_score >= 70) {
                tags.add('quality:premium');
            } else if (product.overall_score >= 60) {
                tags.add('quality:high');
            }
        });

        const tagsByCategory: Record<string, string[]> = {
            'Manufacturer': [],
            'Distributor': [],
            'Certification': [],
            'Price': [],
            'Quality': []
        };

        tags.forEach(tag => {
            if (tag.startsWith('manufacturer:')) tagsByCategory['Manufacturer'].push(tag);
            else if (tag.startsWith('distributor:')) tagsByCategory['Distributor'].push(tag);
            else if (tag.startsWith('cert:')) tagsByCategory['Certification'].push(tag);
            else if (tag.startsWith('price:')) tagsByCategory['Price'].push(tag);
            else if (tag.startsWith('quality:')) tagsByCategory['Quality'].push(tag);
        });

        Object.entries(tagsByCategory).forEach(([category, categoryTags]) => {
            if (categoryTags.length > 0) {
                console.log(`${category} Tags (${categoryTags.length}):`);
                categoryTags.slice(0, 10).forEach(tag => {
                    console.log(`  - ${tag}`);
                });
                if (categoryTags.length > 10) {
                    console.log(`  ... e mais ${categoryTags.length - 10} tags`);
                }
                console.log('');
            }
        });

        console.log(`Total de tags: ${tags.size}`);
    }

    /**
     * Valida estrutura dos produtos
     */
    validateProducts(products: EnrichedProduct[]): void {
        console.log('\n✅ VALIDAÇÃO DE ESTRUTURA DOS PRODUTOS\n');

        let validCount = 0;
        let invalidCount = 0;
        const errors: string[] = [];

        products.forEach((product, index) => {
            const productErrors: string[] = [];

            // Campos obrigatórios
            if (!product.title) productErrors.push('Título ausente');
            if (!product.manufacturer) productErrors.push('Manufacturer ausente');
            if (!product.price_analysis?.best_distributor) productErrors.push('Distributor ausente');
            if (!product.category) productErrors.push('Categoria ausente');
            if (!product.price_analysis?.best_price || product.price_analysis.best_price <= 0) productErrors.push('Preço inválido');
            if (!product.images || product.images.length === 0) productErrors.push('Sem imagens');

            // Validar scores
            if (product.overall_score < 0 || product.overall_score > 100) productErrors.push('Overall score inválido');
            if (product.value_score < 0 || product.value_score > 100) productErrors.push('Value score inválido');

            // Validar price_analysis
            if (!product.price_analysis) productErrors.push('Price analysis ausente');

            if (productErrors.length > 0) {
                invalidCount++;
                errors.push(`Produto ${index + 1} (${product.title}): ${productErrors.join(', ')}`);
            } else {
                validCount++;
            }
        });

        console.log(`✅ Produtos válidos: ${validCount} (${((validCount / products.length) * 100).toFixed(1)}%)`);
        console.log(`❌ Produtos com erros: ${invalidCount} (${((invalidCount / products.length) * 100).toFixed(1)}%)`);

        if (errors.length > 0) {
            console.log('\n⚠️  Erros encontrados:\n');
            errors.slice(0, 5).forEach(error => console.log(`  - ${error}`));
            if (errors.length > 5) {
                console.log(`  ... e mais ${errors.length - 5} erros`);
            }
        }
    }

    /**
     * Executa teste completo
     */
    runTest(filePath: string): void {
        console.log('🚀 TESTE DE IMPORTAÇÃO DE PRODUTOS ENRICHADOS\n');
        console.log('='.repeat(60));

        try {
            // 1. Carregar produtos
            this.loadProducts(filePath);

            // 2. Filtrar produtos
            const filtered = this.filterProducts();

            if (filtered.length === 0) {
                console.log('\n⚠️  Nenhum produto passou nos filtros!');
                return;
            }

            // 3. Analisar estatísticas
            this.analyzeProducts(filtered);

            // 4. Top 10 produtos
            this.showTopProducts(filtered);

            // 5. Validar estrutura
            this.validateProducts(filtered);

            // 6. Simular categorias
            this.simulateCategories(filtered);

            // 7. Simular tags
            this.simulateTags(filtered);

            // Resumo final
            console.log('\n' + '='.repeat(60));
            console.log('✅ TESTE CONCLUÍDO COM SUCESSO\n');
            console.log(`📦 ${filtered.length} produtos prontos para importação no Medusa`);
            console.log(`📊 Score médio: ${(filtered.reduce((sum, p) => sum + p.overall_score, 0) / filtered.length).toFixed(1)}/100`);
            console.log(`💰 Valor total do catálogo: R$ ${filtered.reduce((sum, p) => sum + p.price_analysis.best_price, 0).toFixed(2)}`);
            console.log('\n🎯 Próximo passo: Integrar com backend Medusa');
            console.log('   Ver: IMPORT_USAGE_GUIDE.md para instruções\n');

        } catch (error) {
            console.error('\n❌ ERRO NO TESTE:', error);
            process.exit(1);
        }
    }
}

// Execução principal
async function main() {
    const enrichedDir = path.join(__dirname, 'enriched-complete');

    // Encontrar arquivo mais recente
    const files = fs.readdirSync(enrichedDir)
        .filter(f => f.startsWith('enriched_products_') && f.endsWith('.json'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.error('❌ Nenhum arquivo enriched_products_*.json encontrado!');
        process.exit(1);
    }

    const filePath = path.join(enrichedDir, files[0]);
    console.log(`📂 Usando arquivo: ${files[0]}\n`);

    // Configuração padrão (recomendada)
    const tester = new ImportTester({
        minOverallScore: 60,
        minValueScore: 50,
        categories: ['panels', 'inverters', 'structures', 'water_pumps'],
        priceFilter: ['excellent_deal', 'good_price', 'average'],
        requireCertification: false
    });

    tester.runTest(filePath);
}

main().catch(console.error);
