/**
 * Análise Detalhada de Problemas Críticos
 * 
 * Este script analisa os 117 problemas críticos identificados no VALIDATION_REPORT.json
 * e gera um plano de ação específico para correção.
 */

import fs from 'fs';
import path from 'path';

interface Issue {
    severity: 'critical' | 'warning' | 'info';
    file: string;
    productId: string;
    issue: string;
    suggestion?: string;
}

interface ValidationReport {
    timestamp: string;
    summary: any;
    schemas: any;
    images: any;
    issues: Issue[];
    recommendations: string[];
}

const UNIFIED_SCHEMAS_DIR = path.join(__dirname, '..', 'data', 'catalog', 'unified_schemas');
const REPORT_PATH = path.join(UNIFIED_SCHEMAS_DIR, 'VALIDATION_REPORT.json');

async function analyzeCriticalIssues() {
    console.log('🔍 Analisando problemas críticos...\n');

    // Ler relatório de validação
    const report: ValidationReport = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));

    // Filtrar apenas problemas críticos
    const criticalIssues = report.issues.filter(issue => issue.severity === 'critical');

    console.log(`📋 Total de problemas críticos: ${criticalIssues.length}\n`);

    // Agrupar por tipo de problema
    const issuesByType: Record<string, Issue[]> = {};
    criticalIssues.forEach(issue => {
        const issueType = issue.issue.split(':')[0]; // Ex: "Missing id" -> "Missing id"
        if (!issuesByType[issueType]) {
            issuesByType[issueType] = [];
        }
        issuesByType[issueType].push(issue);
    });

    // Agrupar por arquivo
    const issuesByFile: Record<string, Issue[]> = {};
    criticalIssues.forEach(issue => {
        if (!issuesByFile[issue.file]) {
            issuesByFile[issue.file] = [];
        }
        issuesByFile[issue.file].push(issue);
    });

    console.log('📊 DISTRIBUIÇÃO POR TIPO DE PROBLEMA:\n');
    Object.entries(issuesByType)
        .sort((a, b) => b[1].length - a[1].length)
        .forEach(([type, issues]) => {
            console.log(`  • ${type}: ${issues.length} ocorrências`);
        });

    console.log('\n📂 DISTRIBUIÇÃO POR ARQUIVO:\n');
    Object.entries(issuesByFile)
        .sort((a, b) => b[1].length - a[1].length)
        .forEach(([file, issues]) => {
            console.log(`  • ${file}: ${issues.length} problemas`);
        });

    console.log('\n🔧 DETALHAMENTO DOS PRIMEIROS 20 PROBLEMAS:\n');
    criticalIssues.slice(0, 20).forEach((issue, index) => {
        console.log(`${index + 1}. Arquivo: ${issue.file}`);
        console.log(`   Produto: ${issue.productId || 'N/A'}`);
        console.log(`   Problema: ${issue.issue}`);
        if (issue.suggestion) {
            console.log(`   Sugestão: ${issue.suggestion}`);
        }
        console.log('');
    });

    // Gerar plano de ação
    console.log('📝 PLANO DE AÇÃO:\n');

    const actionPlan: Record<string, string[]> = {};

    Object.entries(issuesByType).forEach(([type, issues]) => {
        if (type.includes('Missing id')) {
            actionPlan['Gerar IDs faltantes'] = [
                `Arquivo: ${issues[0].file}`,
                `Produtos afetados: ${issues.length}`,
                `Ação: Gerar IDs únicos no formato: {categoria}_{timestamp}_{index}`,
                `Script: create-missing-ids.ts`
            ];
        } else if (type.includes('Missing name')) {
            actionPlan['Adicionar nomes faltantes'] = [
                `Arquivo: ${issues[0].file}`,
                `Produtos afetados: ${issues.length}`,
                `Ação: Revisar produtos sem nome, buscar em fontes originais ou remover`,
                `Script: Manual ou remove-invalid-products.ts`
            ];
        } else if (type.includes('Missing category') || type.includes('Invalid category')) {
            actionPlan['Corrigir categorias'] = [
                `Arquivo: ${issues[0].file}`,
                `Produtos afetados: ${issues.length}`,
                `Ação: Validar categoria ou categorizar como "others"`,
                `Script: fix-categories.ts`
            ];
        }
    });

    Object.entries(actionPlan).forEach(([action, details]) => {
        console.log(`🎯 ${action}:`);
        details.forEach(detail => console.log(`   ${detail}`));
        console.log('');
    });

    // Salvar análise detalhada
    const analysis = {
        timestamp: new Date().toISOString(),
        totalCritical: criticalIssues.length,
        byType: Object.fromEntries(
            Object.entries(issuesByType).map(([type, issues]) => [
                type,
                {
                    count: issues.length,
                    files: [...new Set(issues.map(i => i.file))],
                    products: issues.slice(0, 10).map(i => i.productId)
                }
            ])
        ),
        byFile: Object.fromEntries(
            Object.entries(issuesByFile).map(([file, issues]) => [
                file,
                {
                    count: issues.length,
                    types: [...new Set(issues.map(i => i.issue.split(':')[0]))]
                }
            ])
        ),
        actionPlan,
        issues: criticalIssues.slice(0, 50) // Primeiros 50 para análise
    };

    const analysisPath = path.join(UNIFIED_SCHEMAS_DIR, 'CRITICAL_ISSUES_ANALYSIS.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf-8');

    console.log(`✅ Análise detalhada salva em: ${analysisPath}\n`);

    // Recomendações finais
    console.log('💡 RECOMENDAÇÕES:\n');
    console.log('1. Revise o arquivo CRITICAL_ISSUES_ANALYSIS.json para entender os padrões');
    console.log('2. Crie scripts específicos para cada tipo de problema');
    console.log('3. Execute correções em ordem de prioridade:');
    console.log('   a) IDs faltantes (pode ser automatizado)');
    console.log('   b) Categorias inválidas (validação automática)');
    console.log('   c) Nomes faltantes (revisão manual necessária)');
    console.log('4. Re-execute a validação após cada lote de correções');
    console.log('5. Meta: 0 problemas críticos antes do re-seed\n');

    return analysis;
}

// Executar análise
analyzeCriticalIssues()
    .then(() => {
        console.log('✅ Análise concluída com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro na análise:', error);
        process.exit(1);
    });
