/**
 * Otimizador de Especificações Técnicas
 * 
 * Este script:
 * 1. Extrai especificações técnicas do nome e descrição dos produtos
 * 2. Normaliza unidades (W, kW, V, A, etc.)
 * 3. Padroniza nomes de especificações
 * 4. Valida valores numéricos
 * 5. Completa especificações faltantes quando possível
 */

import fs from 'fs';
import path from 'path';

interface Product {
    id: string;
    name: string;
    category: string;
    description?: string;
    technical_specs?: Record<string, any>;
    metadata?: Record<string, any>;
    [key: string]: any;
}

const UNIFIED_SCHEMAS_DIR = path.join(__dirname, '..', 'data', 'catalog', 'unified_schemas');

// Padrões regex para extrair especificações
const SPEC_PATTERNS: Record<string, RegExp[]> = {
    power_w: [
        /(\d+(?:\.\d+)?)\s*(?:kW|kw|KW)/gi,
        /(\d+(?:\.\d+)?)\s*(?:W|watts?|watt)/gi,
        /potência[:\s]+(\d+(?:\.\d+)?)\s*(?:kW|W)/gi
    ],
    voltage_v: [
        /(\d+(?:\.\d+)?)\s*(?:V|volts?|volt)/gi,
        /tensão[:\s]+(\d+(?:\.\d+)?)\s*V/gi
    ],
    current_a: [
        /(\d+(?:\.\d+)?)\s*(?:A|amperes?|amp)/gi,
        /corrente[:\s]+(\d+(?:\.\d+)?)\s*A/gi
    ],
    efficiency: [
        /eficiência[:\s]+(\d+(?:\.\d+)?)\s*%/gi,
        /(\d+(?:\.\d+)?)\s*%\s*(?:de\s*)?eficiência/gi
    ],
    warranty_years: [
        /garantia[:\s]+(\d+)\s*anos?/gi,
        /(\d+)\s*anos?\s*(?:de\s*)?garantia/gi
    ],
    phases: [
        /(\d+)\s*(?:fases?|phase)/gi,
        /(?:mono|bi|tri)fásico/gi
    ]
};

// Conversões de unidades
const UNIT_CONVERSIONS: Record<string, (value: number) => number> = {
    'kW_to_W': (kw: number) => kw * 1000,
    'W_to_kW': (w: number) => w / 1000,
    'mA_to_A': (ma: number) => ma / 1000
};

function extractSpecFromText(text: string, specKey: string): any {
    if (!text) return null;

    const patterns = SPEC_PATTERNS[specKey];
    if (!patterns) return null;

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            // Extrair valor numérico
            const numMatch = match[0].match(/(\d+(?:\.\d+)?)/);
            if (numMatch) {
                let value = parseFloat(numMatch[1]);

                // Converter unidades se necessário
                if (specKey === 'power_w' && /kW/i.test(match[0])) {
                    value = UNIT_CONVERSIONS['kW_to_W'](value);
                }

                return value;
            }

            // Para fases, extrair texto
            if (specKey === 'phases') {
                if (/monofásico|mono/i.test(match[0])) return 1;
                if (/bifásico|bi/i.test(match[0])) return 2;
                if (/trifásico|tri/i.test(match[0])) return 3;
            }
        }
    }

    return null;
}

function normalizeSpecKey(key: string): string {
    // Padronizar nomes de especificações
    const keyMappings: Record<string, string> = {
        'potencia': 'power_w',
        'potência': 'power_w',
        'power': 'power_w',
        'tensao': 'voltage_v',
        'tensão': 'voltage_v',
        'voltage': 'voltage_v',
        'corrente': 'current_a',
        'current': 'current_a',
        'eficiencia': 'efficiency',
        'eficiência': 'efficiency',
        'garantia': 'warranty_years',
        'warranty': 'warranty_years',
        'fases': 'phases',
        'peso': 'weight_kg',
        'weight': 'weight_kg',
        'dimensoes': 'dimensions',
        'dimensões': 'dimensions',
        'dimensions': 'dimensions'
    };

    const normalized = key.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    return keyMappings[normalized] || normalized;
}

function normalizeSpecValue(key: string, value: any): any {
    // Converter strings numéricas
    if (typeof value === 'string') {
        const numMatch = value.match(/(\d+(?:\.\d+)?)/);
        if (numMatch && ['power_w', 'voltage_v', 'current_a', 'efficiency', 'weight_kg'].includes(key)) {
            let numValue = parseFloat(numMatch[1]);

            // Converter unidades
            if (key === 'power_w' && /kW/i.test(value)) {
                numValue = UNIT_CONVERSIONS['kW_to_W'](numValue);
            }

            return numValue;
        }
    }

    return value;
}

function enrichTechnicalSpecs(product: Product): Product {
    const enriched = { ...product };

    if (!enriched.technical_specs) {
        enriched.technical_specs = {};
    }

    // Normalizar keys existentes
    const normalizedSpecs: Record<string, any> = {};
    Object.entries(enriched.technical_specs).forEach(([key, value]) => {
        const normalizedKey = normalizeSpecKey(key);
        const normalizedValue = normalizeSpecValue(normalizedKey, value);
        normalizedSpecs[normalizedKey] = normalizedValue;
    });

    enriched.technical_specs = normalizedSpecs;

    // Extrair especificações do nome e descrição
    const searchText = `${product.name} ${product.description || ''}`;

    Object.keys(SPEC_PATTERNS).forEach(specKey => {
        // Não sobrescrever se já existe
        if (enriched.technical_specs![specKey]) return;

        const extracted = extractSpecFromText(searchText, specKey);
        if (extracted !== null) {
            enriched.technical_specs![specKey] = extracted;
        }
    });

    // Adicionar metadados de enriquecimento
    if (!enriched.metadata) {
        enriched.metadata = {};
    }
    enriched.metadata.specs_enriched = true;
    enriched.metadata.specs_enriched_at = new Date().toISOString();
    enriched.metadata.specs_count = Object.keys(enriched.technical_specs).length;

    return enriched;
}

async function optimizeTechnicalSpecs() {
    console.log('🔬 Iniciando otimização de especificações técnicas...\n');

    const files = fs.readdirSync(UNIFIED_SCHEMAS_DIR)
        .filter(f => f.endsWith('_unified.json') && !f.includes('backup'));

    let totalProducts = 0;
    let totalEnriched = 0;
    let totalSpecsAdded = 0;

    for (const filename of files) {
        const filePath = path.join(UNIFIED_SCHEMAS_DIR, filename);
        console.log(`📄 Processando: ${filename}`);

        const products: Product[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const originalCount = products.length;

        let enrichedInFile = 0;
        let specsAddedInFile = 0;

        const enrichedProducts = products.map(product => {
            const originalSpecsCount = Object.keys(product.technical_specs || {}).length;
            const enriched = enrichTechnicalSpecs(product);
            const newSpecsCount = Object.keys(enriched.technical_specs || {}).length;

            if (newSpecsCount > originalSpecsCount) {
                enrichedInFile++;
                specsAddedInFile += (newSpecsCount - originalSpecsCount);
            }

            return enriched;
        });

        // Salvar backup
        const backupPath = filePath.replace('.json', '_backup_before_specs_opt.json');
        fs.copyFileSync(filePath, backupPath);

        // Salvar enriquecido
        fs.writeFileSync(filePath, JSON.stringify(enrichedProducts, null, 2), 'utf-8');

        console.log(`  ✅ ${enrichedInFile} produtos enriquecidos`);
        console.log(`  📊 ${specsAddedInFile} especificações adicionadas`);
        console.log(`  💾 Backup: ${path.basename(backupPath)}\n`);

        totalProducts += originalCount;
        totalEnriched += enrichedInFile;
        totalSpecsAdded += specsAddedInFile;
    }

    console.log('📊 RESUMO DA OTIMIZAÇÃO:\n');
    console.log(`  📦 Total de produtos processados: ${totalProducts}`);
    console.log(`  ✅ Produtos enriquecidos: ${totalEnriched} (${((totalEnriched / totalProducts) * 100).toFixed(1)}%)`);
    console.log(`  📋 Especificações adicionadas: ${totalSpecsAdded}`);
    console.log(`  📁 Backups salvos: *_backup_before_specs_opt.json\n`);

    console.log('✅ Otimização concluída!\n');
    console.log('📋 Próximos passos:');
    console.log('  1. Revisar especificações extraídas');
    console.log('  2. Re-executar análise semântica');
    console.log('  3. Prosseguir para otimização de precificação\n');
}

// Executar otimização
optimizeTechnicalSpecs()
    .then(() => {
        console.log('✅ Processo concluído com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro na otimização:', error);
        process.exit(1);
    });
