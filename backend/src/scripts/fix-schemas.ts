import fs from 'fs';
import path from 'path';

/**
 * Script de Correção de Problemas Específicos
 * 
 * Corrige:
 * 1. Categorias incorretamente alteradas para "others"
 * 2. Preços mal formatados
 * 3. Encoding UTF-8
 */

interface ProductSchema {
    id: string;
    name: string;
    category: string;
    original_category?: string;
    price: string | number;
    price_brl?: number;
    pricing?: {
        price: number;
        price_brl: number;
        currency: string;
    };
    manufacturer?: string;
    distributor?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
}

// Mapeamento correto de categorias
const CATEGORY_FIXES: Record<string, string> = {
    'battery': 'batteries',
    'panel': 'panels',
    'inverter': 'inverters',
    'kit': 'kits',
    'cable': 'cables',
    'controller': 'controllers',
    'charger': 'chargers',
    'ev_charger': 'ev_chargers',
    'accessory': 'accessories',
    'structure': 'structures',
    'stringbox': 'stringboxes',
    'post': 'posts',
    'pump': 'pumps',
    'station': 'stations'
};

function fixCategory(product: ProductSchema): ProductSchema {
    // Se está em "others" mas tem original_category válido, restaurar
    if (product.category === 'others' && product.original_category) {
        const originalCat = product.original_category.toLowerCase();

        // Verificar se original_category precisa de correção
        if (CATEGORY_FIXES[originalCat]) {
            product.category = CATEGORY_FIXES[originalCat];
            console.log(`   ✓ Restaurado ${product.id}: others → ${product.category}`);
        } else if (originalCat.endsWith('ies') || originalCat.endsWith('s')) {
            // Já está no plural correto
            product.category = originalCat;
            console.log(`   ✓ Restaurado ${product.id}: others → ${product.category}`);
        }
    }

    return product;
}

function fixPrice(product: ProductSchema): ProductSchema {
    if (product.pricing && product.pricing.price > 100000) {
        // Preço provavelmente está sem vírgula decimal
        // Ex: 671683 → 6716.83
        const originalPrice = product.pricing.price;
        const fixedPrice = originalPrice / 100;

        product.pricing.price = fixedPrice;
        product.pricing.price_brl = fixedPrice;
        product.price_brl = fixedPrice;
        product.price = `R$ ${fixedPrice.toFixed(2).replace('.', ',')}`;

        console.log(`   ✓ Preço corrigido ${product.id}: R$ ${originalPrice.toFixed(2)} → R$ ${fixedPrice.toFixed(2)}`);
    }

    return product;
}

function fixEncoding(product: ProductSchema): ProductSchema {
    // Corrigir encoding UTF-8 mal formatado
    const fixes: Record<string, string> = {
        'SolfÃ¡cil': 'Solfácil',
        'Ã¡': 'á',
        'Ã©': 'é',
        'Ã³': 'ó',
        'Ã§': 'ç',
        'Ãº': 'ú',
        'Ã£': 'ã',
        'Ãµ': 'õ',
        'Ã‰': 'É',
        'Ã\u0081': 'Á'
    };

    function fixString(str: string): string {
        let fixed = str;
        Object.entries(fixes).forEach(([wrong, correct]) => {
            fixed = fixed.replace(new RegExp(wrong, 'g'), correct);
        });
        return fixed;
    }

    // Corrigir campos textuais
    if (product.name) product.name = fixString(product.name);
    if (product.manufacturer) product.manufacturer = fixString(product.manufacturer);
    if (product.distributor) product.distributor = fixString(product.distributor);
    if (product.description) product.description = fixString(product.description);

    // Corrigir metadata
    if (product.metadata) {
        if (product.metadata.distributor) {
            product.metadata.distributor = fixString(product.metadata.distributor);
        }
    }

    return product;
}

async function fixSchemaFile(filePath: string): Promise<void> {
    console.log(`\n📄 Corrigindo: ${path.basename(filePath)}`);

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const products: ProductSchema[] = JSON.parse(content);

        console.log(`   📊 Total de produtos: ${products.length}`);

        let categoriesFixed = 0;
        let pricesFixed = 0;
        let encodingFixed = 0;

        const fixed = products.map(product => {
            const original = JSON.stringify(product);

            product = fixCategory(product);
            if (JSON.stringify(product) !== original) categoriesFixed++;

            product = fixPrice(product);
            if (JSON.stringify(product) !== original) pricesFixed++;

            product = fixEncoding(product);
            if (JSON.stringify(product) !== original) encodingFixed++;

            return product;
        });

        // Salvar arquivo corrigido
        fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf-8');

        console.log(`   ✅ Correções aplicadas:`);
        console.log(`      - Categorias: ${categoriesFixed}`);
        console.log(`      - Preços: ${pricesFixed}`);
        console.log(`      - Encoding: ${encodingFixed}`);

    } catch (error) {
        console.error(`   ❌ Erro ao processar arquivo:`, error);
    }
}

async function main() {
    console.log('🔧 Iniciando Correção de Schemas JSON\n');
    console.log('='.repeat(60));

    const unifiedSchemasDir = path.join(__dirname, '../data/catalog/unified_schemas');

    // Processar unified_schemas
    console.log('\n📁 Processando unified_schemas...');
    const unifiedFiles = fs.readdirSync(unifiedSchemasDir)
        .filter(f => f.endsWith('.json'));

    for (const file of unifiedFiles) {
        await fixSchemaFile(path.join(unifiedSchemasDir, file));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Correções concluídas!');
}

main().catch(console.error);
