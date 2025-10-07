import fs from 'fs';
import path from 'path';

/**
 * Relatório Completo de Validação
 * - Schemas JSON
 * - Imagens processadas
 * - Integridade de dados
 */

interface ProductSchema {
    id: string;
    name: string;
    category: string;
    price_brl?: number;
    image_url?: string;
    processed_images?: {
        thumb?: string;
        medium?: string;
        large?: string;
    };
    metadata?: {
        normalized?: boolean;
        normalized_at?: string;
    };
    [key: string]: any;
}

interface ValidationReport {
    timestamp: string;
    summary: {
        totalProducts: number;
        totalFiles: number;
        totalImages: number;
        withPrices: number;
        withImages: number;
        normalized: number;
    };
    schemas: Record<string, SchemaStats>;
    images: Record<string, ImageStats>;
    issues: ValidationIssue[];
    recommendations: string[];
}

interface SchemaStats {
    file: string;
    total: number;
    categories: Record<string, number>;
    withPrices: number;
    withImages: number;
    withProcessedImages: number;
    normalized: number;
    avgPriceBRL: number;
    priceRange: { min: number; max: number };
}

interface ImageStats {
    distributor: string;
    totalImages: number;
    byFormat: Record<string, number>;
    bySize: { thumb: number; medium: number; large: number };
}

interface ValidationIssue {
    severity: 'critical' | 'warning' | 'info';
    file: string;
    productId?: string;
    issue: string;
    suggestion: string;
}

function validateProduct(product: ProductSchema, fileName: string, issues: ValidationIssue[]): void {
    // Validação de campos obrigatórios
    if (!product.id) {
        issues.push({
            severity: 'critical',
            file: fileName,
            issue: 'Produto sem ID',
            suggestion: 'Adicionar ID único ao produto'
        });
    }

    if (!product.name) {
        issues.push({
            severity: 'critical',
            file: fileName,
            productId: product.id,
            issue: 'Produto sem nome',
            suggestion: 'Adicionar nome descritivo'
        });
    }

    if (!product.category) {
        issues.push({
            severity: 'critical',
            file: fileName,
            productId: product.id,
            issue: 'Produto sem categoria',
            suggestion: 'Definir categoria válida'
        });
    }

    // Validação de preços
    if (!product.price_brl || product.price_brl <= 0) {
        issues.push({
            severity: 'warning',
            file: fileName,
            productId: product.id,
            issue: 'Produto sem preço válido',
            suggestion: 'Verificar e adicionar preço correto'
        });
    }

    if (product.price_brl && product.price_brl > 1000000) {
        issues.push({
            severity: 'warning',
            file: fileName,
            productId: product.id,
            issue: `Preço suspeito: R$ ${product.price_brl.toFixed(2)}`,
            suggestion: 'Verificar se preço está correto (pode estar sem vírgula decimal)'
        });
    }

    // Validação de imagens
    if (!product.image_url && !product.processed_images) {
        issues.push({
            severity: 'info',
            file: fileName,
            productId: product.id,
            issue: 'Produto sem imagem',
            suggestion: 'Adicionar imagem do produto'
        });
    }

    // Validação de normalização
    if (!product.metadata?.normalized) {
        issues.push({
            severity: 'info',
            file: fileName,
            productId: product.id,
            issue: 'Produto não normalizado',
            suggestion: 'Executar script de normalização'
        });
    }

    // Validação de processed_images
    if (product.processed_images) {
        const sizes = ['thumb', 'medium', 'large'];
        const missingSizes = sizes.filter(s => !product.processed_images![s as keyof typeof product.processed_images]);

        if (missingSizes.length > 0) {
            issues.push({
                severity: 'info',
                file: fileName,
                productId: product.id,
                issue: `Faltam tamanhos de imagem: ${missingSizes.join(', ')}`,
                suggestion: 'Reprocessar imagens para gerar todos os tamanhos'
            });
        }
    }
}

function analyzeSchema(filePath: string, issues: ValidationIssue[]): SchemaStats {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const products: ProductSchema[] = JSON.parse(content);

    const stats: SchemaStats = {
        file: fileName,
        total: products.length,
        categories: {},
        withPrices: 0,
        withImages: 0,
        withProcessedImages: 0,
        normalized: 0,
        avgPriceBRL: 0,
        priceRange: { min: Infinity, max: 0 }
    };

    let totalPrice = 0;
    let priceCount = 0;

    products.forEach(product => {
        // Validar produto
        validateProduct(product, fileName, issues);

        // Contabilizar categorias
        if (product.category) {
            stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
        }

        // Contabilizar preços
        if (product.price_brl && product.price_brl > 0) {
            stats.withPrices++;
            totalPrice += product.price_brl;
            priceCount++;
            stats.priceRange.min = Math.min(stats.priceRange.min, product.price_brl);
            stats.priceRange.max = Math.max(stats.priceRange.max, product.price_brl);
        }

        // Contabilizar imagens
        if (product.image_url || product.processed_images) {
            stats.withImages++;
        }

        if (product.processed_images) {
            stats.withProcessedImages++;
        }

        // Contabilizar normalizados
        if (product.metadata?.normalized) {
            stats.normalized++;
        }
    });

    stats.avgPriceBRL = priceCount > 0 ? totalPrice / priceCount : 0;
    if (stats.priceRange.min === Infinity) stats.priceRange.min = 0;

    return stats;
}

function analyzeImages(imagesDir: string): Record<string, ImageStats> {
    const stats: Record<string, ImageStats> = {};

    if (!fs.existsSync(imagesDir)) {
        return stats;
    }

    const distributors = fs.readdirSync(imagesDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'reports')
        .map(d => d.name);

    distributors.forEach(distributor => {
        const distPath = path.join(imagesDir, distributor);

        const imageStats: ImageStats = {
            distributor,
            totalImages: 0,
            byFormat: {},
            bySize: { thumb: 0, medium: 0, large: 0 }
        };

        // Recursivamente contar imagens
        function countImages(dir: string) {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            items.forEach(item => {
                if (item.isDirectory()) {
                    // Contabilizar por tamanho
                    if (item.name === 'thumb') imageStats.bySize.thumb++;
                    else if (item.name === 'medium') imageStats.bySize.medium++;
                    else if (item.name === 'large') imageStats.bySize.large++;

                    countImages(path.join(dir, item.name));
                } else if (item.isFile()) {
                    const ext = path.extname(item.name).toLowerCase();
                    if (['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
                        imageStats.totalImages++;
                        imageStats.byFormat[ext] = (imageStats.byFormat[ext] || 0) + 1;
                    }
                }
            });
        }

        countImages(distPath);
        stats[distributor] = imageStats;
    });

    return stats;
}

function generateRecommendations(
    schemas: Record<string, SchemaStats>,
    images: Record<string, ImageStats>,
    issues: ValidationIssue[]
): string[] {
    const recommendations: string[] = [];

    // Análise de issues críticos
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
        recommendations.push(`🚨 CRÍTICO: ${criticalIssues.length} problemas críticos encontrados - corrigir imediatamente`);
    }

    // Análise de preços
    Object.entries(schemas).forEach(([file, stats]) => {
        const missingPrices = stats.total - stats.withPrices;
        if (missingPrices > 0) {
            const percentage = ((missingPrices / stats.total) * 100).toFixed(1);
            recommendations.push(`💰 ${file}: ${missingPrices} produtos (${percentage}%) sem preço válido`);
        }
    });

    // Análise de imagens
    Object.entries(schemas).forEach(([file, stats]) => {
        const missingImages = stats.total - stats.withImages;
        if (missingImages > 0) {
            const percentage = ((missingImages / stats.total) * 100).toFixed(1);
            recommendations.push(`🖼️  ${file}: ${missingImages} produtos (${percentage}%) sem imagem`);
        }

        const missingProcessed = stats.total - stats.withProcessedImages;
        if (missingProcessed > stats.total * 0.1) { // Mais de 10% sem processed_images
            recommendations.push(`⚡ ${file}: Reprocessar imagens para ${missingProcessed} produtos`);
        }
    });

    // Análise de normalização
    Object.entries(schemas).forEach(([file, stats]) => {
        const notNormalized = stats.total - stats.normalized;
        if (notNormalized > 0) {
            recommendations.push(`🔧 ${file}: ${notNormalized} produtos precisam de normalização`);
        }
    });

    // Análise geral
    const totalProducts = Object.values(schemas).reduce((sum, s) => sum + s.total, 0);
    const totalWithImages = Object.values(schemas).reduce((sum, s) => sum + s.withImages, 0);
    const totalImages = Object.values(images).reduce((sum, i) => sum + i.totalImages, 0);

    const imageRatio = totalImages / totalProducts;
    if (imageRatio < 1) {
        recommendations.push(`📊 Apenas ${(imageRatio * 100).toFixed(1)}% dos produtos têm imagens - meta: 100%`);
    }

    if (recommendations.length === 0) {
        recommendations.push('✅ Todos os schemas estão em excelente estado!');
    }

    return recommendations;
}

async function main() {
    console.log('🔍 Gerando Relatório de Validação Completo\n');
    console.log('='.repeat(60));

    const unifiedSchemasDir = path.join(__dirname, '../data/catalog/unified_schemas');
    const imagesDir = path.join(__dirname, '../data/catalog/images_processed');

    const issues: ValidationIssue[] = [];
    const schemas: Record<string, SchemaStats> = {};

    // Analisar schemas
    console.log('\n📊 Analisando schemas...');
    const schemaFiles = fs.readdirSync(unifiedSchemasDir)
        .filter(f => f.endsWith('_unified.json'));

    schemaFiles.forEach(file => {
        const filePath = path.join(unifiedSchemasDir, file);
        console.log(`   ✓ ${file}`);
        schemas[file] = analyzeSchema(filePath, issues);
    });

    // Analisar imagens
    console.log('\n🖼️  Analisando imagens...');
    const images = analyzeImages(imagesDir);

    Object.entries(images).forEach(([dist, stats]) => {
        console.log(`   ✓ ${dist}: ${stats.totalImages} imagens`);
    });

    // Gerar recomendações
    console.log('\n💡 Gerando recomendações...');
    const recommendations = generateRecommendations(schemas, images, issues);

    // Criar relatório
    const report: ValidationReport = {
        timestamp: new Date().toISOString(),
        summary: {
            totalProducts: Object.values(schemas).reduce((sum, s) => sum + s.total, 0),
            totalFiles: Object.keys(schemas).length,
            totalImages: Object.values(images).reduce((sum, i) => sum + i.totalImages, 0),
            withPrices: Object.values(schemas).reduce((sum, s) => sum + s.withPrices, 0),
            withImages: Object.values(schemas).reduce((sum, s) => sum + s.withImages, 0),
            normalized: Object.values(schemas).reduce((sum, s) => sum + s.normalized, 0)
        },
        schemas,
        images,
        issues: issues.slice(0, 100), // Limitar a 100 issues
        recommendations
    };

    // Salvar relatório
    const reportPath = path.join(unifiedSchemasDir, 'VALIDATION_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Exibir resumo
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DO RELATÓRIO\n');
    console.log(`📦 Total de Produtos: ${report.summary.totalProducts}`);
    console.log(`📄 Arquivos Analisados: ${report.summary.totalFiles}`);
    console.log(`🖼️  Imagens Processadas: ${report.summary.totalImages}`);
    console.log(`💰 Produtos com Preço: ${report.summary.withPrices} (${((report.summary.withPrices / report.summary.totalProducts) * 100).toFixed(1)}%)`);
    console.log(`🖼️  Produtos com Imagem: ${report.summary.withImages} (${((report.summary.withImages / report.summary.totalProducts) * 100).toFixed(1)}%)`);
    console.log(`🔧 Produtos Normalizados: ${report.summary.normalized} (${((report.summary.normalized / report.summary.totalProducts) * 100).toFixed(1)}%)`);

    console.log('\n🚨 PROBLEMAS ENCONTRADOS\n');
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    console.log(`   Críticos: ${criticalCount}`);
    console.log(`   Avisos: ${warningCount}`);
    console.log(`   Informativos: ${infoCount}`);

    console.log('\n💡 RECOMENDAÇÕES\n');
    recommendations.forEach(rec => console.log(`   ${rec}`));

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Relatório salvo em: ${reportPath}`);
}

main().catch(console.error);
