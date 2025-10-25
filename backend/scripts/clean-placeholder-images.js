/**
 * Clean Placeholder Images from Fallback Exports
 * Removes products with missing images or placeholder paths
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_EXPORTS_PATH = path.join(__dirname, '../data/catalog/fallback_exports');
const STATIC_IMAGES_PATH = path.join(__dirname, '../static/images-catálogo_distribuidores');

const CATEGORIES = [
    'accessories', 'batteries', 'cables', 'controllers', 'ev_chargers',
    'inverters', 'kits', 'others', 'panels', 'posts', 'stringboxes', 'structures'
];

/**
 * Check if image file exists
 */
async function imageExists(imagePath) {
    if (!imagePath || imagePath === '') return false;

    // Skip placeholder paths
    if (imagePath.toLowerCase().includes('placeholder')) return false;
    if (imagePath.toLowerCase().includes('no-image')) return false;

    // Convert API path to filesystem path
    let fsPath = imagePath;
    fsPath = fsPath.replace(/^\/static\//, '');
    fsPath = fsPath.replace(/^\/catalog\/images\//, '');
    fsPath = fsPath.replace(/^images-catálogo_distribuidores\//, '');
    fsPath = fsPath.replace(/\//g, path.sep);

    const fullPath = path.join(STATIC_IMAGES_PATH, fsPath);

    try {
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Clean products from JSON file
 */
async function cleanCategoryJson(category) {
    const jsonPath = path.join(FALLBACK_EXPORTS_PATH, `${category}.json`);

    try {
        const content = await fs.readFile(jsonPath, 'utf8');
        const data = JSON.parse(content);

        if (!data.products || !Array.isArray(data.products)) {
            console.log(`⚠️  ${category}: No products array found`);
            return { category, removed: 0, kept: 0 };
        }

        const originalCount = data.products.length;

        // Filter products with valid images
        const validProducts = [];
        const removedProducts = [];

        for (const product of data.products) {
            const imagePath = product.image_path || product.image || '';
            const hasValidImage = await imageExists(imagePath);

            if (hasValidImage) {
                validProducts.push(product);
            } else {
                removedProducts.push({
                    id: product.id,
                    name: product.name,
                    image_path: imagePath
                });
            }
        }

        // Update data
        data.products = validProducts;
        data.total_products = validProducts.length;
        data.with_images = validProducts.length;
        data.cleaned_at = new Date().toISOString();
        data.removed_count = removedProducts.length;

        // Save cleaned JSON
        await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf8');

        console.log(`✅ ${category}: ${originalCount} → ${validProducts.length} products (removed ${removedProducts.length})`);

        if (removedProducts.length > 0 && removedProducts.length <= 5) {
            console.log(`   Removed: ${removedProducts.map(p => p.id).join(', ')}`);
        }

        return {
            category,
            original: originalCount,
            kept: validProducts.length,
            removed: removedProducts.length,
            removedProducts
        };

    } catch (error) {
        console.error(`❌ Error processing ${category}:`, error.message);
        return { category, error: error.message, removed: 0, kept: 0 };
    }
}

/**
 * Clean CSV file
 */
async function cleanCategoryCsv(category) {
    const csvPath = path.join(FALLBACK_EXPORTS_PATH, `${category}.csv`);
    const jsonPath = path.join(FALLBACK_EXPORTS_PATH, `${category}.json`);

    try {
        // Read JSON to get valid product IDs
        const jsonContent = await fs.readFile(jsonPath, 'utf8');
        const jsonData = JSON.parse(jsonContent);
        const validIds = new Set(jsonData.products.map(p => p.id));

        // Read CSV
        const csvContent = await fs.readFile(csvPath, 'utf8');
        const lines = csvContent.split('\n');

        if (lines.length === 0) return;

        // Keep header
        const header = lines[0];
        const validLines = [header];

        // Filter data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Extract ID from first column (may be quoted)
            const match = line.match(/^"?([^",]+)"?,/);
            if (match && validIds.has(match[1])) {
                validLines.push(line);
            }
        }

        // Save cleaned CSV
        await fs.writeFile(csvPath, validLines.join('\n'), 'utf8');

        console.log(`📄 ${category}.csv: ${lines.length - 1} → ${validLines.length - 1} rows`);

    } catch (error) {
        console.error(`❌ Error cleaning CSV ${category}:`, error.message);
    }
}

/**
 * Regenerate master files
 */
async function regenerateMasterFiles() {
    console.log('\n📊 Regenerating master files...');

    const allProducts = [];
    let totalWithImages = 0;

    for (const category of CATEGORIES) {
        try {
            const jsonPath = path.join(FALLBACK_EXPORTS_PATH, `${category}.json`);
            const content = await fs.readFile(jsonPath, 'utf8');
            const data = JSON.parse(content);

            if (data.products) {
                allProducts.push(...data.products);
                totalWithImages += data.products.length;
            }
        } catch (error) {
            console.error(`⚠️  Could not load ${category}:`, error.message);
        }
    }

    const masterData = {
        category: 'all',
        total_products: allProducts.length,
        with_images: totalWithImages,
        image_coverage_percent: '100.00',
        generated_at: new Date().toISOString(),
        cleaned: true,
        note: 'All products with invalid/missing images have been removed',
        products: allProducts
    };

    // Save master JSON
    const masterJsonPath = path.join(FALLBACK_EXPORTS_PATH, 'products_master.json');
    await fs.writeFile(masterJsonPath, JSON.stringify(masterData, null, 2), 'utf8');
    console.log(`✅ products_master.json: ${allProducts.length} products (100% valid images)`);

    // Save master CSV
    const masterCsvPath = path.join(FALLBACK_EXPORTS_PATH, 'products_master.csv');
    const csvLines = ['id,sku,name,manufacturer,model,category,price_brl,power_w,efficiency,voltage_v,current_a,image_path,source,availability,description,image_tier,specs_count'];

    for (const product of allProducts) {
        const row = [
            `"${product.id}"`,
            `"${product.sku || ''}"`,
            `"${product.name || ''}"`,
            `"${product.manufacturer || ''}"`,
            `"${product.model || ''}"`,
            `"${product.category || ''}"`,
            product.price_brl || product.price || '0',
            product.technical_specs?.power_w || '',
            product.technical_specs?.efficiency || '',
            product.technical_specs?.voltage_v || '',
            product.technical_specs?.current_a || '',
            `"${product.image_path || product.image || ''}"`,
            `"${product.source || ''}"`,
            `"${product.availability || 'false'}"`,
            `"${(product.description || '').replace(/"/g, '""')}"`,
            `"${product.metadata?.image_match?.tier || ''}"`,
            product.metadata?.specs_count || ''
        ];
        csvLines.push(row.join(','));
    }

    await fs.writeFile(masterCsvPath, csvLines.join('\n'), 'utf8');
    console.log(`✅ products_master.csv: ${allProducts.length} rows`);

    return {
        total: allProducts.length,
        withImages: totalWithImages
    };
}

/**
 * Main execution
 */
async function main() {
    console.log('🧹 Cleaning placeholder images from fallback exports...\n');

    const results = [];

    // Clean each category
    for (const category of CATEGORIES) {
        const result = await cleanCategoryJson(category);
        results.push(result);

        if (result.kept > 0) {
            await cleanCategoryCsv(category);
        }
    }

    console.log('\n' + '='.repeat(60));

    // Summary
    const totalOriginal = results.reduce((sum, r) => sum + (r.original || 0), 0);
    const totalKept = results.reduce((sum, r) => sum + r.kept, 0);
    const totalRemoved = results.reduce((sum, r) => sum + r.removed, 0);

    console.log('\n📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Original Products: ${totalOriginal}`);
    console.log(`Valid Products Kept: ${totalKept}`);
    console.log(`Invalid Products Removed: ${totalRemoved}`);
    console.log(`Final Coverage: 100% (all products have valid images)`);

    // Regenerate master files
    await regenerateMasterFiles();

    console.log('\n✅ Cleaning complete!');
    console.log('📁 All files updated in:', FALLBACK_EXPORTS_PATH);
}

main().catch(console.error);
