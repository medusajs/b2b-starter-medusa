import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para migrar dados dos fallback exports para os unified schemas
 * Os fallback exports têm melhor sincronização com imagens
 */

const FALLBACK_DIR = path.join(__dirname, 'data', 'catalog', 'fallback_exports');
const UNIFIED_SCHEMAS_DIR = path.join(__dirname, 'data', 'catalog', 'unified_schemas');

// Mapeamento de arquivos fallback para unified
const FILE_MAPPING = {
    'accessories.json': 'accessories_unified.json',
    'batteries.json': 'batteries_unified.json',
    'cables.json': 'cables_unified.json',
    'controllers.json': 'controllers_unified.json',
    'ev_chargers.json': 'ev_chargers_unified.json',
    'inverters.json': 'inverters_unified.json',
    'kits.json': 'kits_unified.json',
    'others.json': 'others_unified.json',
    'panels.json': 'panels_unified.json',
    'posts.json': 'posts_unified.json',
    'stringboxes.json': 'stringboxes_unified.json',
    'structures.json': 'structures_unified.json'
};

function normalizeProduct(product) {
    // Garantir campos obrigatórios do schema v2.0.0
    const normalized = {
        id: product.id,
        name: product.name,
        category: product.category,
        sku: product.sku || product.id,
        manufacturer: product.manufacturer,
        price_brl: product.pricing || {
            base: product.price_brl || 0,
            distributor_markup: 0,
            final: product.price_brl || 0,
            currency: 'BRL'
        },
        technical_specs: product.technical_specs || {},
        metadata: {
            ...product.metadata,
            migrated_from_fallback: true,
            migrated_at: new Date().toISOString(),
            version: '2.0.0'
        }
    };

    // Adicionar campos específicos por categoria
    if (product.category === 'kits') {
        normalized.components = product.panels?.map(p => ({
            component_id: `panel_${p.brand}_${p.power_w}w`,
            quantity: p.quantity,
            component_type: 'panel'
        })) || [];

        if (product.inverters) {
            normalized.components.push(...product.inverters.map(i => ({
                component_id: `inverter_${i.brand}_${i.power_kw}kw`,
                quantity: i.quantity,
                component_type: 'inverter'
            })));
        }

        if (product.batteries) {
            normalized.components.push(...product.batteries.map(b => ({
                component_id: `battery_${b.brand}_${b.capacity_kwh}kwh`,
                quantity: b.quantity,
                component_type: 'battery'
            })));
        }
    }

    // Adicionar imagens se disponíveis
    if (product.image_url) {
        normalized.images = [{
            url: product.image_url.replace(/\\/g, '/'),
            alt: product.name,
            type: 'primary'
        }];
    }

    return normalized;
}

function migrateCategoryFile(fallbackFile, unifiedFile) {
    const fallbackPath = path.join(FALLBACK_DIR, fallbackFile);
    const unifiedPath = path.join(UNIFIED_SCHEMAS_DIR, unifiedFile);

    if (!fs.existsSync(fallbackPath)) {
        console.log(`⚠️  Arquivo fallback não encontrado: ${fallbackFile}`);
        return { processed: 0, migrated: 0 };
    }

    console.log(`\n🔄 Migrando ${fallbackFile} -> ${unifiedFile}...`);

    // Ler dados do fallback
    const fallbackContent = fs.readFileSync(fallbackPath, 'utf8');
    const fallbackData = JSON.parse(fallbackContent);

    // Normalizar produtos
    const products = Array.isArray(fallbackData.products)
        ? fallbackData.products
        : fallbackData;

    const normalizedProducts = products.map(normalizeProduct);

    // Salvar no unified schema
    fs.writeFileSync(unifiedPath, JSON.stringify(normalizedProducts, null, 2));

    console.log(`✅ Migrados ${normalizedProducts.length} produtos de ${fallbackFile}`);

    return {
        processed: products.length,
        migrated: normalizedProducts.length
    };
}

function generateMigrationReport(results) {
    const reportPath = path.join(__dirname, 'data', 'catalog', 'FALLBACK_MIGRATION_REPORT.json');

    const totalProcessed = results.reduce((sum, r) => sum + (r?.processed || 0), 0);
    const totalMigrated = results.reduce((sum, r) => sum + (r?.migrated || 0), 0);

    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_files_processed: results.length,
            total_products_processed: totalProcessed,
            total_products_migrated: totalMigrated,
            migration_success_rate: totalProcessed > 0 ? `${((totalMigrated / totalProcessed) * 100).toFixed(1)}%` : '0%'
        },
        files: results,
        notes: [
            'Dados migrados dos fallback exports com melhor sincronização de imagens',
            'Produtos normalizados para schema v2.0.0',
            'Campos obrigatórios garantidos',
            'URLs de imagem corrigidas para formato web'
        ]
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Relatório salvo em: ${reportPath}`);
}

// Executar migração
console.log('🚀 Iniciando migração dos fallback exports para unified schemas...\n');

const results = Object.entries(FILE_MAPPING).map(([fallbackFile, unifiedFile]) =>
    migrateCategoryFile(fallbackFile, unifiedFile)
);

generateMigrationReport(results);

console.log('\n🎉 Migração concluída! Os unified schemas agora usam dados dos fallbacks com imagens sincronizadas.');