/**
 * Script de Correção de Problemas Críticos
 * 
 * Este script corrige automaticamente os 30 problemas críticos identificados:
 * - Gera IDs únicos para produtos sem ID
 * - Remove produtos sem nome (provavelmente inválidos)
 * - Define categoria padrão para produtos sem categoria
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface Product {
    id?: string;
    name?: string;
    category?: string;
    [key: string]: any;
}

const UNIFIED_SCHEMAS_DIR = path.join(__dirname, '..', 'data', 'catalog', 'unified_schemas');

// Categorias válidas
const VALID_CATEGORIES = [
    'panels', 'inverters', 'batteries', 'kits', 'kits-hibridos',
    'structures', 'cables', 'controllers', 'chargers', 'ev_chargers',
    'accessories', 'stringboxes', 'posts', 'pumps', 'stations', 'others'
];

function generateUniqueId(category: string, index: number): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${category}_${timestamp}_${index}_${random}`;
}

function inferCategoryFromFilename(filename: string): string {
    // Ex: "inverters_unified.json" -> "inverters"
    const match = filename.match(/^([a-z_]+)_unified\.json$/);
    if (match) {
        const category = match[1].replace(/_/g, '-');
        return VALID_CATEGORIES.includes(category) ? category : 'others';
    }
    return 'others';
}

function fixCriticalIssues() {
    console.log('🔧 Iniciando correção de problemas críticos...\n');

    const filesToFix = [
        'inverters_unified.json',
        'kits_unified.json',
        'others_unified.json'
    ];

    let totalFixed = 0;
    let totalRemoved = 0;

    filesToFix.forEach(filename => {
        const filePath = path.join(UNIFIED_SCHEMAS_DIR, filename);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Arquivo não encontrado: ${filename}`);
            return;
        }

        console.log(`📄 Processando: ${filename}`);

        const products: Product[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const originalCount = products.length;

        const inferredCategory = inferCategoryFromFilename(filename);
        let fixedInFile = 0;
        let removedInFile = 0;

        const validProducts = products.filter((product, index) => {
            const issues: string[] = [];

            // Verificar problemas
            if (!product.id || product.id.trim() === '') {
                issues.push('sem ID');
            }
            if (!product.name || product.name.trim() === '') {
                issues.push('sem nome');
            }
            if (!product.category || !VALID_CATEGORIES.includes(product.category)) {
                issues.push('sem categoria válida');
            }

            // Se não tem nome, provavelmente é inválido -> REMOVER
            if (!product.name || product.name.trim() === '') {
                console.log(`  ❌ Removendo produto inválido (sem nome) na posição ${index}`);
                removedInFile++;
                return false; // Remove do array
            }

            // Corrigir problemas
            if (issues.length > 0) {
                console.log(`  🔧 Corrigindo produto na posição ${index}: ${issues.join(', ')}`);

                // Gerar ID se faltando
                if (!product.id || product.id.trim() === '') {
                    product.id = generateUniqueId(inferredCategory, index);
                    console.log(`     ✅ ID gerado: ${product.id}`);
                }

                // Definir categoria se faltando
                if (!product.category || !VALID_CATEGORIES.includes(product.category)) {
                    product.category = inferredCategory;
                    console.log(`     ✅ Categoria definida: ${product.category}`);

                    // Atualizar metadata
                    if (!product.metadata) product.metadata = {};
                    product.metadata.auto_categorized = true;
                    product.metadata.auto_categorized_at = new Date().toISOString();
                }

                fixedInFile++;
            }

            return true; // Manter no array
        });

        // Salvar arquivo corrigido
        const backupPath = filePath.replace('.json', '_backup_before_fix.json');
        fs.copyFileSync(filePath, backupPath);
        console.log(`  💾 Backup salvo: ${path.basename(backupPath)}`);

        fs.writeFileSync(filePath, JSON.stringify(validProducts, null, 2), 'utf-8');

        console.log(`  ✅ ${filename}:`);
        console.log(`     - Produtos originais: ${originalCount}`);
        console.log(`     - Produtos corrigidos: ${fixedInFile}`);
        console.log(`     - Produtos removidos: ${removedInFile}`);
        console.log(`     - Produtos finais: ${validProducts.length}\n`);

        totalFixed += fixedInFile;
        totalRemoved += removedInFile;
    });

    console.log('📊 RESUMO DA CORREÇÃO:\n');
    console.log(`  ✅ Total de produtos corrigidos: ${totalFixed}`);
    console.log(`  ❌ Total de produtos removidos: ${totalRemoved}`);
    console.log(`  📁 Backups salvos em: *_backup_before_fix.json\n`);

    console.log('✅ Correção concluída! Próximos passos:\n');
    console.log('  1. Re-executar validação: npx tsx src/scripts/create-validation-report.ts');
    console.log('  2. Verificar se problemas críticos foram reduzidos para 0');
    console.log('  3. Prosseguir para correção de preços faltantes\n');
}

// Executar correção
fixCriticalIssues();
