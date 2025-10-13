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
const IMAGE_MAP_PATH = path.join(__dirname, '../static/images-catálogo_distribuidores/IMAGE_MAP.json');
const STATIC_IMAGE_BASE = '/static/images-catálogo_distribuidores';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

// Load IMAGE_MAP for SKU to image resolution
let IMAGE_MAP = {};
try {
    if (fs.existsSync(IMAGE_MAP_PATH)) {
        const imageMapData = JSON.parse(fs.readFileSync(IMAGE_MAP_PATH, 'utf8'));
        IMAGE_MAP = imageMapData.mappings || {};
        console.log(`📷 Loaded IMAGE_MAP: ${Object.keys(IMAGE_MAP).length} SKUs mapped`);
    }
} catch (error) {
    console.warn('⚠️  Could not load IMAGE_MAP:', error.message);
}

// Categories to process
const CATEGORIES = [
    'panels', 'inverters', 'batteries', 'kits', 'cables',
    'controllers', 'structures', 'accessories', 'ev_chargers',
    'posts', 'stringboxes', 'others'
];

/**
 * Extract SKU from product ID or metadata
 */
function extractSku(product) {
    // Try various SKU sources
    if (product.sku) return String(product.sku).trim();
    if (product.metadata?.sku) return String(product.metadata.sku).trim();

    // Try to extract from name or model
    if (product.model) {
        const modelClean = String(product.model).trim();
        if (modelClean && modelClean !== 'undefined' && modelClean !== 'null') {
            return modelClean;
        }
    }

    // Extract from ID patterns - try multiple patterns
    if (product.id) {
        // Pattern 1: ends with number (e.g., odex_inverters_112369 -> 112369)
        const numMatch = product.id.match(/[-_](\d{4,})$/);
        if (numMatch) return numMatch[1];

        // Pattern 2: ends with alphanumeric (e.g., ABC-123)
        const alphaMatch = product.id.match(/[-_]([A-Z0-9]{3,})$/i);
        if (alphaMatch) return alphaMatch[1];

        // Pattern 3: just the last part after last separator
        const parts = product.id.split(/[-_]/);
        if (parts.length > 0) {
            const lastPart = parts[parts.length - 1];
            if (lastPart && lastPart.length >= 3) return lastPart;
        }
    }

    return null;
}

/**
 * Resolve image path from IMAGE_MAP or product data
 */
function resolveImagePath(product) {
    const sku = extractSku(product);

    // Try IMAGE_MAP first
    if (sku && IMAGE_MAP[sku]) {
        return IMAGE_MAP[sku].images?.original || IMAGE_MAP[sku].images?.large || '';
    }

    // Fallback to product image fields
    if (product.image_url) {
        // Normalize path
        let normalizedPath = product.image_url.replace(/\\/g, '/');
        // Remove duplicate 'images/' prefix
        normalizedPath = normalizedPath.replace(/images\//g, '');

        return normalizedPath.startsWith('/') ? normalizedPath : `${STATIC_IMAGE_BASE}/${normalizedPath}`;
    }

    if (product.image) {
        // Normalize Windows paths to URL paths
        let normalizedPath = product.image.replace(/\\/g, '/');

        // Remove duplicate 'images/' prefix if present
        normalizedPath = normalizedPath.replace(/^images\//, '');

        // If it starts with distributor name, it's already correctly formatted
        if (normalizedPath.match(/^[A-Z]+-[A-Z]+\//)) {
            return `${STATIC_IMAGE_BASE}/${normalizedPath}`;
        }

        // If already has full path, return as is
        if (normalizedPath.startsWith('/static/')) {
            return normalizedPath;
        }

        // Otherwise, add base path
        return normalizedPath.startsWith('/') ? normalizedPath : `${STATIC_IMAGE_BASE}/${normalizedPath}`;
    }

    return '';
}/**
 * Convert product to CSV row
 */
function productToCsvRow(product) {
    const imagePath = resolveImagePath(product);
    const sku = extractSku(product);

    return [
        product.id,
        sku || '',
        product.name,
        product.manufacturer,
        product.model || '',
        product.category,
        product.price_brl || product.pricing?.price_brl || 0,
        product.technical_specs?.power_w || '',
        product.technical_specs?.efficiency || '',
        product.technical_specs?.voltage_v || '',
        product.technical_specs?.current_a || '',
        imagePath,
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
    const imagePath = resolveImagePath(product);
    const imageUrl = imagePath ?
        `${baseUrl}${imagePath}` :
        `${baseUrl}/images/placeholder.jpg`;

    const sku = extractSku(product);

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${baseUrl}/products/${product.id}`,
        'sku': sku,
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
        'id', 'sku', 'name', 'manufacturer', 'model', 'category', 'price_brl',
        'power_w', 'efficiency', 'voltage_v', 'current_a', 'image_path',
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

    // Enhance products with resolved image paths
    const enhancedProducts = products.map(product => ({
        ...product,
        sku: extractSku(product),
        image_path: resolveImagePath(product),
        image_verified: !!resolveImagePath(product)
    }));

    const data = {
        category,
        total_products: products.length,
        with_images: enhancedProducts.filter(p => p.image_verified).length,
        generated_at: new Date().toISOString(),
        products: enhancedProducts
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
    // Enhance all products with resolved image paths
    const enhancedProducts = allProducts.map(product => ({
        ...product,
        sku: extractSku(product),
        image_path: resolveImagePath(product),
        image_verified: !!resolveImagePath(product)
    }));

    // Master CSV
    const masterCsvPath = path.join(OUTPUT_PATH, 'products_master.csv');
    const headers = [
        'id', 'sku', 'name', 'manufacturer', 'model', 'category', 'price_brl',
        'power_w', 'efficiency', 'voltage_v', 'current_a', 'image_path',
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
    const withImages = enhancedProducts.filter(p => p.image_verified).length;
    const masterData = {
        total_products: allProducts.length,
        with_images: withImages,
        image_coverage_percent: ((withImages / allProducts.length) * 100).toFixed(2),
        categories: CATEGORIES,
        generated_at: new Date().toISOString(),
        products: enhancedProducts
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