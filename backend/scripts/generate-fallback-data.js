/**
 * Product Data Export Script
 * Generates CSV, JSON, and JSON-LD files for fallback coverage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNIFIED_SCHEMAS_PATH = path.join(__dirname, '../data/catalog/unified_schemas');
const OUTPUT_PATH = path.join(__dirname, '../data/catalog/fallback_exports');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

// Categories to process
const CATEGORIES = [
    'panels', 'inverters', 'batteries', 'kits', 'cables',
    'controllers', 'structures', 'accessories', 'ev_chargers',
    'posts', 'stringboxes', 'others'
];

/**
 * Convert product to CSV row
 */
function productToCsvRow(product) {
    return [
        product.id,
        product.name,
        product.manufacturer,
        product.model || '',
        product.category,
        product.price_brl || product.pricing?.price_brl || 0,
        product.technical_specs?.power_w || '',
        product.technical_specs?.efficiency || '',
        product.technical_specs?.voltage_v || '',
        product.technical_specs?.current_a || '',
        product.image || '',
        product.image_url || '',
        product.source || '',
        product.availability ? 'true' : 'false',
        product.description || '',
        product.metadata?.image_match?.tier || '',
        product.metadata?.specs_count || 0
    ];
}

/**
 * Convert product to JSON-LD
 */
function productToJsonLd(product, baseUrl = 'https://ysh-solar.com') {
    const imageUrl = product.image_url ?
        `${baseUrl}/images/${product.image_url.replace(/\\/g, '/')}` :
        `${baseUrl}/images/placeholder.jpg`;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${baseUrl}/products/${product.id}`,
        'name': product.name,
        'manufacturer': {
            '@type': 'Organization',
            'name': product.manufacturer
        },
        'model': product.model,
        'category': product.category,
        'description': product.description,
        'image': imageUrl,
        'offers': {
            '@type': 'Offer',
            'price': product.price_brl || product.pricing?.price_brl,
            'priceCurrency': 'BRL',
            'availability': product.availability ?
                'https://schema.org/InStock' :
                'https://schema.org/OutOfStock'
        },
        'additionalProperty': Object.entries(product.technical_specs || {}).map(([key, value]) => ({
            '@type': 'PropertyValue',
            'name': key,
            'value': value
        })),
        'brand': {
            '@type': 'Brand',
            'name': product.manufacturer
        }
    };
}

/**
 * Generate CSV for category
 */
function generateCategoryCsv(category, products) {
    const csvPath = path.join(OUTPUT_PATH, `${category}.csv`);
    const headers = [
        'id', 'name', 'manufacturer', 'model', 'category', 'price_brl',
        'power_w', 'efficiency', 'voltage_v', 'current_a', 'image', 'image_url',
        'source', 'availability', 'description', 'image_tier', 'specs_count'
    ];

    const csvContent = [
        headers.join(','),
        ...products.map(productToCsvRow).map(row =>
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`Generated CSV: ${csvPath} (${products.length} products)`);
}

/**
 * Generate JSON for category
 */
function generateCategoryJson(category, products) {
    const jsonPath = path.join(OUTPUT_PATH, `${category}.json`);
    const data = {
        category,
        total_products: products.length,
        generated_at: new Date().toISOString(),
        products: products
    };

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Generated JSON: ${jsonPath}`);
}

/**
 * Generate JSON-LD for category
 */
function generateCategoryJsonLd(category, products) {
    const jsonLdPath = path.join(OUTPUT_PATH, `${category}.jsonld`);
    const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': `${category} Products Catalog`,
        'description': `Complete catalog of ${category} products with specifications and images`,
        'numberOfItems': products.length,
        'itemListElement': products.map((product, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'item': productToJsonLd(product)
        }))
    };

    fs.writeFileSync(jsonLdPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Generated JSON-LD: ${jsonLdPath}`);
}

/**
 * Generate master index files
 */
function generateMasterFiles(allProducts) {
    // Master CSV
    const masterCsvPath = path.join(OUTPUT_PATH, 'products_master.csv');
    const headers = [
        'id', 'name', 'manufacturer', 'model', 'category', 'price_brl',
        'power_w', 'efficiency', 'voltage_v', 'current_a', 'image', 'image_url',
        'source', 'availability', 'description', 'image_tier', 'specs_count'
    ];

    const csvContent = [
        headers.join(','),
        ...allProducts.map(productToCsvRow).map(row =>
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');

    fs.writeFileSync(masterCsvPath, csvContent, 'utf8');
    console.log(`Generated Master CSV: ${masterCsvPath} (${allProducts.length} products)`);

    // Master JSON
    const masterJsonPath = path.join(OUTPUT_PATH, 'products_master.json');
    const masterData = {
        total_products: allProducts.length,
        categories: CATEGORIES,
        generated_at: new Date().toISOString(),
        products: allProducts
    };
    fs.writeFileSync(masterJsonPath, JSON.stringify(masterData, null, 2), 'utf8');
    console.log(`Generated Master JSON: ${masterJsonPath}`);

    // Master JSON-LD
    const masterJsonLdPath = path.join(OUTPUT_PATH, 'products_master.jsonld');
    const masterLdData = {
        '@context': 'https://schema.org',
        '@type': 'DataCatalog',
        'name': 'YSH Solar Products Catalog',
        'description': 'Complete catalog of solar energy products with specifications and images',
        'provider': {
            '@type': 'Organization',
            'name': 'YSH Solar',
            'url': 'https://ysh-solar.com'
        },
        'dataset': CATEGORIES.map(category => ({
            '@type': 'Dataset',
            'name': `${category} Products`,
            'description': `Solar ${category} product catalog`,
            'url': `https://ysh-solar.com/catalog/${category}`,
            'distribution': [
                {
                    '@type': 'DataDownload',
                    'encodingFormat': 'text/csv',
                    'contentUrl': `https://ysh-solar.com/data/${category}.csv`
                },
                {
                    '@type': 'DataDownload',
                    'encodingFormat': 'application/json',
                    'contentUrl': `https://ysh-solar.com/data/${category}.json`
                }
            ]
        }))
    };
    fs.writeFileSync(masterJsonLdPath, JSON.stringify(masterLdData, null, 2), 'utf8');
    console.log(`Generated Master JSON-LD: ${masterJsonLdPath}`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting product data export for fallback coverage...\n');
    console.log('📁 Input path:', UNIFIED_SCHEMAS_PATH);
    console.log('📁 Output path:', OUTPUT_PATH);
    console.log('📂 Categories:', CATEGORIES.join(', '));
    console.log('');

    const allProducts = [];

    for (const category of CATEGORIES) {
        const filePath = path.join(UNIFIED_SCHEMAS_PATH, `${category}_unified.json`);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Skipping ${category}: file not found`);
            continue;
        }

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const products = Array.isArray(data) ? data : data.products || [];

            if (products.length === 0) {
                console.log(`⚠️  Skipping ${category}: no products`);
                continue;
            }

            // Generate files for category
            generateCategoryCsv(category, products);
            generateCategoryJson(category, products);
            generateCategoryJsonLd(category, products);

            allProducts.push(...products);
            console.log(`✅ Processed ${category}: ${products.length} products\n`);

        } catch (error) {
            console.error(`❌ Error processing ${category}:`, error.message);
        }
    }

    // Generate master files
    console.log('📊 Generating master files...');
    generateMasterFiles(allProducts);

    console.log('\n🎉 Export complete!');
    console.log(`📁 Files generated in: ${OUTPUT_PATH}`);
    console.log(`📊 Total products: ${allProducts.length}`);
}

// Run if called directly
main().catch(console.error);

export { main, productToCsvRow, productToJsonLd };