/**
 * Script de Integração e Consolidação de Diretórios YSH
 * 
 * Este script:
 * 1. Analisa estrutura atual dos 3 diretórios principais
 * 2. Identifica duplicações e inconsistências
 * 3. Consolida catálogos de produtos
 * 4. Sincroniza configurações
 * 5. Integra scripts de processamento
 * 6. Gera relatório de integração
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface DirectoryAnalysis {
  path: string;
  exists: boolean;
  files: number;
  size: number;
  catalogs?: string[];
  configs?: string[];
  scripts?: string[];
}

interface IntegrationReport {
  timestamp: string;
  directories: {
    medusaStarter: DirectoryAnalysis;
    yshErp: DirectoryAnalysis;
    yshStore: DirectoryAnalysis;
  };
  catalogs: {
    total: number;
    duplicates: string[];
    conflicts: string[];
    recommendations: string[];
  };
  configs: {
    files: string[];
    conflicts: string[];
    recommendations: string[];
  };
  scripts: {
    total: number;
    toMigrate: string[];
    recommendations: string[];
  };
  actions: string[];
}

const BASE_DIR = path.join(__dirname, '..', '..', '..', '..');
const MEDUSA_STARTER = path.join(BASE_DIR, 'medusa-starter');
const YSH_ERP = path.join(BASE_DIR, 'ysh-erp');
const YSH_STORE = path.join(BASE_DIR, 'ysh-store');

function analyzeDirectory(dirPath: string, name: string): DirectoryAnalysis {
  console.log(`📂 Analisando: ${name}`);

  if (!fs.existsSync(dirPath)) {
    return {
      path: dirPath,
      exists: false,
      files: 0,
      size: 0
    };
  }

  let files = 0;
  let size = 0;
  const catalogs: string[] = [];
  const configs: string[] = [];
  const scripts: string[] = [];

  function walk(dir: string) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!item.startsWith('.') && item !== 'node_modules' && item !== '.next') {
              walk(fullPath);
            }
          } else {
            files++;
            size += stat.size;

            // Identificar catálogos
            if (fullPath.includes('catalog') && fullPath.endsWith('.json')) {
              catalogs.push(path.relative(dirPath, fullPath));
            }

            // Identificar configs
            if (item === 'medusa-config.ts' || item === '.env' || item === 'package.json') {
              configs.push(path.relative(dirPath, fullPath));
            }

            // Identificar scripts
            if ((fullPath.includes('scripts') || fullPath.includes('src/scripts')) && 
                (item.endsWith('.ts') || item.endsWith('.py') || item.endsWith('.js'))) {
              scripts.push(path.relative(dirPath, fullPath));
            }
          }
        } catch (err) {
          // Ignorar erros de acesso
        }
      });
    } catch (err) {
      // Ignorar erros de acesso ao diretório
    }
  }

  walk(dirPath);

  return {
    path: dirPath,
    exists: true,
    files,
    size,
    catalogs,
    configs,
    scripts
  };
}

function getFileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return '';
  }
}

function findDuplicates(dir1: DirectoryAnalysis, dir2: DirectoryAnalysis): string[] {
  const duplicates: string[] = [];
  
  if (!dir1.catalogs || !dir2.catalogs) return duplicates;

  dir1.catalogs.forEach(file1 => {
    const name1 = path.basename(file1);
    dir2.catalogs?.forEach(file2 => {
      const name2 = path.basename(file2);
      if (name1 === name2) {
        const hash1 = getFileHash(path.join(dir1.path, file1));
        const hash2 = getFileHash(path.join(dir2.path, file2));
        
        if (hash1 === hash2) {
          duplicates.push(name1);
        }
      }
    });
  });

  return duplicates;
}

function findConflicts(dir1: DirectoryAnalysis, dir2: DirectoryAnalysis): string[] {
  const conflicts: string[] = [];
  
  if (!dir1.catalogs || !dir2.catalogs) return conflicts;

  dir1.catalogs.forEach(file1 => {
    const name1 = path.basename(file1);
    dir2.catalogs?.forEach(file2 => {
      const name2 = path.basename(file2);
      if (name1 === name2) {
        const hash1 = getFileHash(path.join(dir1.path, file1));
        const hash2 = getFileHash(path.join(dir2.path, file2));
        
        if (hash1 !== hash2 && hash1 !== '' && hash2 !== '') {
          conflicts.push(name1);
        }
      }
    });
  });

  return conflicts;
}

async function integrateDirectories() {
  console.log('🔄 Iniciando análise e integração de diretórios...\n');

  // Análise de diretórios
  const medusaStarter = analyzeDirectory(MEDUSA_STARTER, 'medusa-starter');
  const yshErp = analyzeDirectory(YSH_ERP, 'ysh-erp');
  const yshStore = analyzeDirectory(YSH_STORE, 'ysh-store');

  console.log('\n📊 Resultados da Análise:\n');
  console.log(`medusa-starter: ${medusaStarter.exists ? `✅ ${medusaStarter.files} arquivos` : '❌ Não encontrado'}`);
  console.log(`ysh-erp: ${yshErp.exists ? `✅ ${yshErp.files} arquivos` : '❌ Não encontrado'}`);
  console.log(`ysh-store: ${yshStore.exists ? `✅ ${yshStore.files} arquivos` : '❌ Não encontrado'}`);

  // Análise de catálogos
  console.log('\n📦 Catálogos Encontrados:\n');
  console.log(`ysh-erp: ${yshErp.catalogs?.length || 0} arquivos`);
  console.log(`ysh-store: ${yshStore.catalogs?.length || 0} arquivos`);

  const duplicates = findDuplicates(yshErp, yshStore);
  const conflicts = findConflicts(yshErp, yshStore);

  console.log(`\n🔍 Duplicados: ${duplicates.length}`);
  console.log(`⚠️  Conflitos: ${conflicts.length}`);

  // Análise de scripts
  console.log('\n📜 Scripts Encontrados:\n');
  console.log(`ysh-erp: ${yshErp.scripts?.length || 0} scripts`);
  console.log(`ysh-store: ${yshStore.scripts?.length || 0} scripts`);

  // Gerar recomendações
  const recommendations: string[] = [];

  if (yshStore.exists && yshStore.catalogs && yshStore.catalogs.length > 0) {
    recommendations.push('✅ ysh-store/backend contém catálogo otimizado mais recente');
    recommendations.push('📋 Usar ysh-store/backend/src/data/catalog como fonte principal');
  }

  if (conflicts.length > 0) {
    recommendations.push(`⚠️  ${conflicts.length} conflitos detectados - manter versão otimizada do ysh-store`);
  }

  if (yshErp.scripts && yshErp.scripts.length > 0) {
    const pythonScripts = yshErp.scripts.filter(s => s.endsWith('.py'));
    if (pythonScripts.length > 0) {
      recommendations.push(`📦 Migrar ${pythonScripts.length} scripts Python do ysh-erp para ysh-store/scripts`);
    }
  }

  // Análise de configurações
  const configConflicts: string[] = [];
  if (yshErp.configs && yshStore.configs) {
    ['medusa-config.ts', 'package.json'].forEach(configFile => {
      const erpHas = yshErp.configs?.some(c => c.includes(configFile));
      const storeHas = yshStore.configs?.some(c => c.includes(configFile));
      
      if (erpHas && storeHas) {
        configConflicts.push(configFile);
      }
    });
  }

  recommendations.push('🔧 Consolidar configurações em ysh-store/backend (ambiente principal)');
  recommendations.push('🗑️  medusa-starter pode ser arquivado (ambiente de testes concluído)');

  // Plano de ação
  const actions = [
    '1. CONSOLIDAR CATÁLOGO:',
    '   → Validar que ysh-store/backend/src/data/catalog/unified_schemas contém versão otimizada',
    '   → Copiar para ysh-erp/data/catalog como backup',
    '   → Documentar em INDEX.md',
    '',
    '2. SINCRONIZAR SCRIPTS:',
    '   → Mover update_product_images.py e update_product_images_new.py para ysh-store/scripts',
    '   → Consolidar scripts TypeScript em ysh-store/backend/src/scripts',
    '   → Remover duplicados',
    '',
    '3. UNIFICAR CONFIGURAÇÕES:',
    '   → Consolidar .env em ysh-store/backend/.env (ambiente principal)',
    '   → Manter ysh-erp/medusa-app/.env como referência de integração ERP',
    '   → Sincronizar medusa-config.ts (ysh-store tem customizações mais recentes)',
    '',
    '4. ESTRUTURA FINAL:',
    '   ysh-store/ (PRINCIPAL - B2B Marketplace)',
    '   ├── backend/ (Medusa.js otimizado)',
    '   ├── storefront/ (Next.js 15)',
    '   └── scripts/ (processamento de dados)',
    '',
    '   ysh-erp/ (INTEGRAÇÃO)',
    '   ├── medusa-app/ (testes de integração)',
    '   └── data/ (backup e referência)',
    '',
    '   medusa-starter/ (ARQUIVAR)',
    '   └── [pode ser movido para /archive]',
    '',
    '5. ATUALIZAR BANCO DE DADOS:',
    '   → cd ysh-store/backend',
    '   → yarn seed (com catálogo otimizado)',
    '   → Validar 1.123 produtos carregados'
  ];

  // Gerar relatório
  const report: IntegrationReport = {
    timestamp: new Date().toISOString(),
    directories: {
      medusaStarter,
      yshErp,
      yshStore
    },
    catalogs: {
      total: (yshErp.catalogs?.length || 0) + (yshStore.catalogs?.length || 0),
      duplicates,
      conflicts,
      recommendations: [
        'Usar ysh-store/backend/src/data/catalog como fonte principal',
        'Manter backup em ysh-erp/data/catalog',
        `${conflicts.length} arquivos com versões diferentes - manter versão otimizada`
      ]
    },
    configs: {
      files: [...(yshErp.configs || []), ...(yshStore.configs || [])],
      conflicts: configConflicts,
      recommendations: [
        'Consolidar em ysh-store/backend (ambiente principal)',
        'Sincronizar package.json entre ambientes',
        'Manter .env separados (ysh-store: produção, ysh-erp: integração)'
      ]
    },
    scripts: {
      total: (yshErp.scripts?.length || 0) + (yshStore.scripts?.length || 0),
      toMigrate: yshErp.scripts?.filter(s => s.endsWith('.py')) || [],
      recommendations: [
        'Mover scripts Python para ysh-store/scripts',
        'Consolidar scripts TypeScript em ysh-store/backend/src/scripts',
        'Documentar dependências (Python: Pillow, pandas; Node: tsx, zod)'
      ]
    },
    actions
  };

  // Salvar relatório
  const reportPath = path.join(YSH_STORE, 'docs', 'INTEGRACAO_DIRETORIOS.md');
  const reportContent = generateMarkdownReport(report);
  fs.writeFileSync(reportPath, reportContent, 'utf-8');

  // Salvar JSON
  const jsonPath = path.join(YSH_STORE, 'docs', 'INTEGRACAO_DIRETORIOS.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n📄 Relatório salvo em:');
  console.log(`  • ${reportPath}`);
  console.log(`  • ${jsonPath}`);

  console.log('\n💡 RECOMENDAÇÕES:\n');
  recommendations.forEach(rec => console.log(`  ${rec}`));

  console.log('\n📋 PLANO DE AÇÃO:\n');
  actions.forEach(action => console.log(action));

  return report;
}

function generateMarkdownReport(report: IntegrationReport): string {
  return `# 🔄 Relatório de Integração de Diretórios YSH

**Data**: ${new Date(report.timestamp).toLocaleString('pt-BR')}

## 📊 Análise de Estrutura

### Diretórios Encontrados

| Diretório | Status | Arquivos | Catálogos | Configs | Scripts |
|-----------|--------|----------|-----------|---------|---------|
| **medusa-starter** | ${report.directories.medusaStarter.exists ? '✅' : '❌'} | ${report.directories.medusaStarter.files} | ${report.directories.medusaStarter.catalogs?.length || 0} | ${report.directories.medusaStarter.configs?.length || 0} | ${report.directories.medusaStarter.scripts?.length || 0} |
| **ysh-erp** | ${report.directories.yshErp.exists ? '✅' : '❌'} | ${report.directories.yshErp.files} | ${report.directories.yshErp.catalogs?.length || 0} | ${report.directories.yshErp.configs?.length || 0} | ${report.directories.yshErp.scripts?.length || 0} |
| **ysh-store** | ${report.directories.yshStore.exists ? '✅' : '❌'} | ${report.directories.yshStore.files} | ${report.directories.yshStore.catalogs?.length || 0} | ${report.directories.yshStore.configs?.length || 0} | ${report.directories.yshStore.scripts?.length || 0} |

## 📦 Catálogos

**Total de arquivos de catálogo**: ${report.catalogs.total}

**Duplicados** (${report.catalogs.duplicates.length}):
${report.catalogs.duplicates.map(d => `- ${d}`).join('\n') || '- Nenhum'}

**Conflitos** (${report.catalogs.conflicts.length}):
${report.catalogs.conflicts.map(c => `- ⚠️ ${c} (versões diferentes)`).join('\n') || '- Nenhum'}

### Recomendações - Catálogos

${report.catalogs.recommendations.map(r => `- ${r}`).join('\n')}

## ⚙️ Configurações

**Arquivos de configuração encontrados**: ${report.configs.files.length}

**Conflitos de configuração**:
${report.configs.conflicts.map(c => `- ${c}`).join('\n') || '- Nenhum'}

### Recomendações - Configurações

${report.configs.recommendations.map(r => `- ${r}`).join('\n')}

## 📜 Scripts

**Total de scripts**: ${report.scripts.total}

**Scripts Python a migrar** (${report.scripts.toMigrate.length}):
${report.scripts.toMigrate.map(s => `- ${s}`).join('\n') || '- Nenhum'}

### Recomendações - Scripts

${report.scripts.recommendations.map(r => `- ${r}`).join('\n')}

## 🎯 Plano de Ação

${report.actions.join('\n')}

---

**Próximos Passos**:
1. Revisar este relatório
2. Executar consolidação de catálogos
3. Sincronizar configurações
4. Migrar scripts
5. Atualizar banco de dados
6. Validar integração completa
`;
}

// Executar integração
integrateDirectories()
  .then(() => {
    console.log('\n✅ Análise de integração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na integração:', error);
    process.exit(1);
  });
