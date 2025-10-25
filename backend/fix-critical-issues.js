import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para corrigir problemas críticos nos schemas unificados
 * - Corrigir nomes que são URLs
 * - Adicionar IDs faltantes
 * - Padronizar categorias
 */

const CATALOG_DIR = path.join(__dirname, 'data', 'catalog');
const UNIFIED_SCHEMAS_DIR = path.join(CATALOG_DIR, 'unified_schemas');

function isUrl(str) {
    return str && (str.startsWith('http://') || str.startsWith('https://'));
}

function extractNameFromDescription(description, category) {
    if (!description) return null;

    // Remove aspas e caracteres especiais
    let cleanDesc = description.replace(/"/g, '').trim();

    // Para diferentes categorias, tenta extrair nomes específicos
    switch (category) {
        case 'controllers':
            // Exemplos: "Cabo para Carro Elétrico NeoCharge NCT1 até 7"
            if (cleanDesc.includes('Cabo para Carro Elétrico')) {
                return 'Cabo para Carro Elétrico NeoCharge NCT1';
            }
            break;

        case 'chargers':
            // Exemplos: "Kit Bomba Solar ZTROON - 3ZTPC3.8-180-96-1500W"
            if (cleanDesc.includes('Kit Bomba Solar')) {
                return cleanDesc.split(' - ')[0] + ' - Bomba Solar';
            }
            break;

        case 'cables':
            // Exemplos: "Cabo Lafeber 6mm² - Vermelho"
            if (cleanDesc.includes('Cabo ')) {
                return cleanDesc.split(' 1')[0]; // Remove "1" do final
            }
            break;

        case 'posts':
            // Para posts, usar uma abordagem genérica
            return `Poste Estrutura ${category}`;
    }

    // Fallback: usar as primeiras palavras da descrição
    const words = cleanDesc.split(' ').slice(0, 5).join(' ');
    return words.length > 10 ? words : null;
}

function fixProduct(product, index) {
    let fixed = false;
    const issues = [];

    // 1. Corrigir nome se for URL
    if (isUrl(product.name)) {
        const extractedName = extractNameFromDescription(product.description, product.category);
        if (extractedName) {
            product.name = extractedName;
            fixed = true;
            issues.push('name_was_url');
        } else {
            // Fallback para nome genérico
            product.name = `${product.category} ${product.id.split('_').pop()}`;
            fixed = true;
            issues.push('name_was_url_fallback');
        }
    }

    // 2. Garantir que tem ID
    if (!product.id) {
        product.id = `${product.source || 'unknown'}_${product.category}_${index}`;
        fixed = true;
        issues.push('missing_id');
    }

    // 3. Padronizar categoria se necessário
    if (product.category === 'chargers') {
        product.category = 'ev_chargers';
        fixed = true;
        issues.push('category_standardized');
    }

    // 4. Garantir que tem manufacturer
    if (!product.manufacturer || product.manufacturer === 'NEOSOLAR') {
        // Tentar extrair do nome ou usar distributor
        if (product.distributor && product.distributor !== 'YSH') {
            product.manufacturer = product.distributor;
            fixed = true;
            issues.push('manufacturer_from_distributor');
        }
    }

    if (fixed) {
        product.metadata = product.metadata || {};
        product.metadata.fixed_issues = issues;
        product.metadata.fixed_at = new Date().toISOString();
    }

    return fixed;
}

function processUnifiedSchema(filename) {
    const filePath = path.join(UNIFIED_SCHEMAS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.log(`Arquivo não encontrado: ${filename}`);
        return { processed: 0, fixed: 0 };
    }

    console.log(`\n🔧 Processando ${filename}...`);

    const content = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(content);

    let fixedCount = 0;
    let processedCount = 0;

    products.forEach((product, index) => {
        processedCount++;
        if (fixProduct(product, index)) {
            fixedCount++;
        }
    });

    // Salvar arquivo corrigido
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    console.log(`✅ ${filename}: ${processedCount} processados, ${fixedCount} corrigidos`);

    return { processed: processedCount, fixed: fixedCount };
}

function generateFixReport(results) {
    const reportPath = path.join(CATALOG_DIR, 'CRITICAL_ISSUES_FIX_REPORT.json');

    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_files_processed: results.length,
            total_products_processed: results.reduce((sum, r) => sum + r.processed, 0),
            total_products_fixed: results.reduce((sum, r) => sum + r.fixed, 0),
            fix_rate: `${((results.reduce((sum, r) => sum + r.fixed, 0) / results.reduce((sum, r) => sum + r.processed, 0)) * 100).toFixed(1)}%`
        },
        files: results,
        issues_fixed: [
            'name_was_url',
            'name_was_url_fallback',
            'missing_id',
            'category_standardized',
            'manufacturer_from_distributor'
        ]
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Relatório salvo em: ${reportPath}`);
}

// Arquivos que precisam ser corrigidos baseados na análise
const filesToFix = [
    'controllers_unified.json',
    'ev_chargers_unified.json',
    'cables_unified.json',
    'posts_unified.json',
    'accessories_unified.json',
    'stringboxes_unified.json',
    'structures_unified.json',
    'others_unified.json'
];

console.log('🚀 Iniciando correção de problemas críticos nos schemas unificados...\n');

const results = filesToFix.map(processUnifiedSchema);

generateFixReport(results);

console.log('\n🎉 Correção concluída! Verifique o relatório para detalhes.');